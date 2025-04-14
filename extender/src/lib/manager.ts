import { Injectable, Injector, Type, inject, runInInjectionContext } from '@angular/core';
import { ExtenderPluginBaseComponent } from './factory';
import { ExtenderPlugin } from './provider';
import { EXTENDER_PLUGINS, EXTENDER_SERVICES, PLUGIN_COMPONENT_SET } from './extender';

@Injectable()
export class ExtenderPluginManager {
  readonly serviceMap = new Map<string, Type<unknown>>();
  readonly injectedServicesMap = new Map<string, unknown>();

  #injector = inject(Injector);
  readonly plugins = inject(EXTENDER_PLUGINS);
  readonly services = inject(EXTENDER_SERVICES);
  readonly componentSet = inject(PLUGIN_COMPONENT_SET);

  readonly disabledPlugins = new Set<string>();
  get enabledPlugins(): ExtenderPlugin[] {
    return Array.from(this.plugins.values()).filter(p => !this.disabledPlugins.has(p.name));
  }

  constructor() {
    for (const [key, service] of Object.entries(this.services)) {
      this.serviceMap.set(key, service);
    }

    runInInjectionContext(this.#injector, () => {
      for (const [key, service] of this.serviceMap) {
        const injected = inject(service);
        this.injectedServicesMap.set(key, injected);
      }
    });
  }

  public getComponentsForSlot(slot: string) {
    return new Map<ExtenderPlugin, Type<ExtenderPluginBaseComponent>[]>(
      this.enabledPlugins.map(p => [p, p?.[this.componentSet]?.[slot] ?? []] as const),
    );
  }

  public hasComponentsForSlot(slot: string) {
    const components = this.getComponentsForSlot(slot);
    return Array.from(components.values()).some(c => c.length > 0);
  }

  public findAddonForComponent(
    slot: string,
    component: Type<ExtenderPluginBaseComponent>,
  ): ExtenderPlugin | undefined {
    return this.enabledPlugins.find(p =>
      p?.[this.componentSet]?.[slot]?.find((c: any) => c.name === component.name),
    );
  }

  public enablePlugin(name: string) {
    this.disabledPlugins.delete(name);
  }

  public disablePlugin(name: string) {
    this.disabledPlugins.add(name);
  }
}
