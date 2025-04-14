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
import { Observable, Subscription } from 'rxjs';
import { PLUGIN_MANAGER } from './extender';
import { type ExtenderPluginBaseComponent } from './factory';
import { type ExtenderPlugin } from './provider';

export type ExtenderSlotEvent<T = any> = {
  componentName: string;
  plugin?: ExtenderPlugin;
  event: CustomEvent<T>;
};

@Directive({
  selector: '[extendSlot]',
  standalone: true,
})
export class ExtenderSlotDirective implements OnDestroy {
  // Fields needed from Plugin Manager (Extender)
  #pluginManager = inject(PLUGIN_MANAGER);
  #viewContainerRef = inject(ViewContainerRef);
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // User has to input the slot name, which will then be used to find the components for that slot
  extendSlot = input<string | undefined>();
  dataObservable = input<Observable<unknown>>();
  slotBehaviour = input<'append' | 'prepend' | 'replace'>();
  event = output<ExtenderSlotEvent>();

  #refs = new Array<ComponentRef<ExtenderPluginBaseComponent>>();

  // Create components for the slot
  #componentsForSlot = computed(() => {
    const slot = this.extendSlot();
    return slot ? this.#pluginManager.getComponentsForSlot(slot) : [];
  });

  #slotDataSubscription?: Subscription;

  constructor() {
    effect(() => {
      console.log('SlotDirective components', this.#componentsForSlot());
      const componentList = this.#componentsForSlot();

      for (const [plugin, components] of componentList) {
        for (const component of components) {
          const ref =
            this.#viewContainerRef.createComponent<ExtenderPluginBaseComponent>(component);
          ref.setInput('pluginManager', this.#pluginManager);
          ref.instance.event.subscribe(event => {
            this.event.emit({
              componentName: ref.instance.constructor.name,
              plugin,
              event,
            });
          });

          this.#refs.push(ref);

          switch (this.slotBehaviour()) {
            case 'prepend':
              this.#elementRef.nativeElement.prepend(ref.location.nativeElement);
              break;
            case 'replace':
              this.#elementRef.nativeElement.replaceChildren(ref.location.nativeElement);
              break;
            case 'append':
            default:
              this.#elementRef.nativeElement.append(ref.location.nativeElement);
              break;
          }
        }
      }

      this.setupDataObservable(this.dataObservable());
    });

    effect(() => {
      const observable = this.dataObservable();
      this.setupDataObservable(observable);
    });
  }

  private setupDataObservable(observable?: Observable<unknown>) {
    this.#slotDataSubscription?.unsubscribe();
    this.#slotDataSubscription = observable?.subscribe(data => {
      for (const ref of this.#refs) {
        ref.instance.dataSubject.next(data);
      }
    });
  }

  ngOnDestroy(): void {
    this.#slotDataSubscription?.unsubscribe();
  }
}
