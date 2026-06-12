import {
  ComponentRef,
  Directive,
  ElementRef,
  OnDestroy,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { type ExtenderPluginBaseComponent } from './factory';
import { type ExtenderPlugin } from './provider';
import { ExtenderPluginManager } from './plugin-manager';

export type ExtenderSlotEvent<T = unknown> = {
  componentName: string;
  plugin?: ExtenderPlugin;
  event: CustomEvent<T>;
};

export const ExtenderSlotManager = new (class ExtenderSlotManager {
  #slots = new Map<string, Set<ExtenderPluginBaseComponent>>();
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
    if (!this.#slots.has(slotName)) {
      this.#slots.set(slotName, new Set());
    }
    if (!this.#refs.has(slotName)) {
      this.#refs.set(slotName, []);
    }
    // Get components for slot
    const componentMap = ExtenderPluginManager.getComponentsForSlot(slotName);
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
      }
    }

    dataObservable?.subscribe(data => {
      const refs = this.#refs.get(slotName) ?? [];
      for (const ref of refs) {
        ref.instance.dataSubject.next(data);
      }
    });
  }
})();
