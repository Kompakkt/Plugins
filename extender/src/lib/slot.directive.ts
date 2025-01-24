import {
  ComponentRef,
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
import { ExtenderPluginBaseComponent } from './factory';
import { type ExtenderPlugin } from './provider';

@Directive({
  selector: '[extendSlot]',
  standalone: true,
})
export class ExtenderSlotDirective {
  // Fields needed from Plugin Manager (Extender)
  #pluginManager = inject(PLUGIN_MANAGER);
  #viewContainerRef = inject(ViewContainerRef);
  #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // User has to input the slot name, which will then be used to find the components for that slot
  extendSlot = input<string | undefined>();
  slotData = input<unknown>();
  slotBehaviour = input<'append' | 'prepend' | 'replace'>();
  event = output<{
    componentName: string;
    plugin?: ExtenderPlugin;
    event: Event;
  }>();

  #refs = new Array<ComponentRef<ExtenderPluginBaseComponent>>();

  public async getData() {
    return new Promise<unknown>(async (resolve, reject) => {
      try {
        const result = await Promise.all(this.#refs.map(ref => ref.instance.getSlotOutput()));
        const filtered = result.filter(v => !!v);
        if (filtered.length === 1) return resolve(filtered[0]);
        return resolve(filtered);
      } catch (e) {
        return reject(e);
      }
    });
  }

  // Create components for the slot
  #componentsForSlot = computed(() => {
    const slot = this.extendSlot();
    return slot ? this.#pluginManager.getComponentsForSlot(slot) : [];
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
    });
  }
}
