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

export const ExtenderSlotManager = new (class ExtenderSlotManager {
  #refs = new Map<string, Array<ComponentRef<ExtenderPluginBaseComponent>>>();

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
    if (!this.#refs.has(slotName)) {
      this.#refs.set(slotName, []);
    }
    // Get components for slot
    const componentMap = ExtenderPluginManager.getComponentsForSlot(slotName);
    const replaySubject = new ReplaySubject<ExtenderSlotEvent>(100);
    for (const [plugin, components] of componentMap) {
      for (const component of components) {
        const ref = viewContainerRef.createComponent<ExtenderPluginBaseComponent>(component);
        ref.setInput('pluginManager', ExtenderPluginManager);
        ref.instance.event.subscribe(event => {
          this.events$.next({
            componentName: ref.instance.constructor.name,
            plugin,
            event,
          });
          replaySubject.next({
            componentName: ref.instance.constructor.name,
            plugin,
            event,
          });
        });

        this.#refs.get(slotName)?.push(ref);

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
      dataObservable.subscribe(data => {
        console.log('Received data for slot', { slotName, data });
        const refs = this.#refs.get(slotName) ?? [];
        for (const ref of refs) {
          ref.instance.dataSubject.next(data);
        }
      });
    }

    return replaySubject.asObservable();
  }

  public unregisterSlot(slotName: string) {
    const refs = this.#refs.get(slotName) ?? [];
    for (const ref of refs) {
      ref.destroy();
    }
    this.#refs.delete(slotName);
  }
})();
