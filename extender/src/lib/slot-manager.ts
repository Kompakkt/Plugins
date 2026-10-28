import { ComponentRef, ElementRef, ViewContainerRef } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { type ExtenderPluginBaseComponent } from './factory';
import { type ExtenderPlugin } from './provider';
import { ExtenderPluginManager } from './plugin-manager';

export type ExtenderSlotEvent<T = unknown> = {
  componentName: string;
  plugin?: ExtenderPlugin;
  event: CustomEvent<T>;
};

type Teardown = { unsubscribe(): void };

type SlotRegistration = {
  refs: Array<ComponentRef<ExtenderPluginBaseComponent>>;
  teardowns: Teardown[];
  replaySubject: ReplaySubject<ExtenderSlotEvent>;
};

export const ExtenderSlotManager = new (class ExtenderSlotManager {
  #slots = new Map<string, SlotRegistration>();

  events$ = new ReplaySubject<ExtenderSlotEvent>(100);

  public registerSlot({
    slotName,
    slotBehaviour,
    elementRef,
    viewContainerRef,
    dataObservable,
  }: {
    slotName: string;
    slotBehaviour: 'append' | 'prepend' | 'replace';
    elementRef: ElementRef<HTMLElement>;
    viewContainerRef: ViewContainerRef;
    dataObservable?: Observable<unknown>;
  }) {
    const registration: SlotRegistration = {
      refs: [],
      teardowns: [],
      replaySubject: new ReplaySubject<ExtenderSlotEvent>(100),
    };
    this.#slots.set(slotName, registration);

    // Get components for slot
    const componentMap = ExtenderPluginManager.getComponentsForSlot(slotName);
    for (const [plugin, components] of componentMap) {
      for (const component of components) {
        const ref = viewContainerRef.createComponent<ExtenderPluginBaseComponent>(component);
        ref.setInput('pluginManager', ExtenderPluginManager);
        registration.teardowns.push(
          ref.instance.event.subscribe(event => {
            this.events$.next({
              componentName: ref.instance.constructor.name,
              plugin,
              event,
            });
            registration.replaySubject.next({
              componentName: ref.instance.constructor.name,
              plugin,
              event,
            });
          }),
        );

        registration.refs.push(ref);

        switch (slotBehaviour) {
          case 'prepend':
            elementRef.nativeElement.prepend(ref.location.nativeElement);
            break;
          case 'replace':
            elementRef.nativeElement.replaceChildren(ref.location.nativeElement);
            break;
          case 'append':
          default:
            elementRef.nativeElement.append(ref.location.nativeElement);
            break;
        }

        console.log('Registered component for slot', {
          slotName,
          component: ref.instance.constructor.name,
          plugin,
        });
      }
    }

    if (dataObservable) {
      console.log('Subscribing to dataObservable for slot', { slotName });
      registration.teardowns.push(
        dataObservable.subscribe(data => {
          console.log('Received data for slot', { slotName, data });
          for (const ref of registration.refs) {
            ref.instance.dataSubject.next(data);
          }
        }),
      );
    }

    return registration.replaySubject.asObservable();
  }

  public unregisterSlot(slotName: string) {
    const registration = this.#slots.get(slotName);
    if (!registration) return;
    for (const teardown of registration.teardowns) {
      teardown.unsubscribe();
    }
    for (const ref of registration.refs) {
      ref.destroy();
    }
    registration.replaySubject.complete();
    this.#slots.delete(slotName);
  }
})();
