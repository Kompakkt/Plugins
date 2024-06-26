import {
  Directive,
  ElementRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { PLUGIN_COMPONENT_SET, PLUGIN_MANAGER } from './extender';
import { ExtenderAddonProviderPlugin } from './provider';

@Directive({
  selector: '[extendSlot]',
  standalone: true,
})
export class ExtenderSlotDirective {
  // Fields needed from Plugin Manager (Extender)
  #pluginManager = inject(PLUGIN_MANAGER);
  #componentSet = inject(PLUGIN_COMPONENT_SET);

  #viewContainerRef = inject(ViewContainerRef);
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // User has to input the slot name, which will then be used to find the components for that slot
  extendSlot = input<string | undefined>();
  slotData = input<unknown>();
  event = output<{
    componentName: string;
    plugin?: ExtenderAddonProviderPlugin;
    event: Event;
  }>();

  // Create components for the slot
  #componentsForSlot = computed(() => {
    const slot = this.extendSlot();
    return slot ? this.#pluginManager.getComponentsForSlot(slot, this.#componentSet) : [];
  });

  constructor() {
    effect(() => {
      console.log('SlotData', this.slotData());
      console.log('SlotDirective components', this.#componentsForSlot());
      const componentList = this.#componentsForSlot();
      const data = this.slotData();

      for (const [plugin, components] of componentList) {
        for (const component of components) {
          const ref = this.#viewContainerRef.createComponent(component);
          try {
            ref.setInput('slotData', data);
            ref.setInput('pluginManager', this.#pluginManager);
          } catch (e) {
            console.error('Error while setting slotData', e);
          }
          ref.instance.event.subscribe(event => {
            this.event.emit({
              componentName: ref.instance.constructor.name,
              plugin,
              event,
            });
          });
          this.#elementRef.nativeElement.append(ref.location.nativeElement);
        }
      }
    });
  }
}
