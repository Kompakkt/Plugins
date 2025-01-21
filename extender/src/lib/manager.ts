import { Injector, Type, inject, runInInjectionContext } from '@angular/core';
import { ExtenderPluginBaseComponent } from './factory';
import {
  ExtenderAddonProviderPlugin,
  ExtenderDataProviderPlugin,
  ExtenderLoginProviderPlugin,
  ExtenderProviderPlugin,
} from './provider';

export class ExtenderPluginManager<T> {
  readonly plugins: ExtenderProviderPlugin[] = [];
  readonly serviceMap = new Map<string, Type<T>>();
  readonly injectedServicesMap = new Map<string, T>();

  #injector = inject(Injector);

  constructor(plugins: ExtenderProviderPlugin[], services: Record<string, Type<T>>) {
    this.plugins.push(...plugins);
    for (const [key, service] of Object.entries(services)) {
      this.serviceMap.set(key, service);
    }

    runInInjectionContext(this.#injector, () => {
      for (const [key, service] of this.serviceMap) {
        const injected = inject(service);
        this.injectedServicesMap.set(key, injected);
      }
    });
  }

  get dataProvider(): ExtenderDataProviderPlugin | undefined {
    return this.plugins.find(
      (plugin): plugin is ExtenderDataProviderPlugin => plugin.type === 'data-provider',
    );
  }

  get loginProviders(): ExtenderLoginProviderPlugin[] {
    return this.plugins.filter(
      (plugin): plugin is ExtenderLoginProviderPlugin => plugin.type === 'login-provider',
    );
  }

  get addonProviders(): ExtenderAddonProviderPlugin[] {
    return this.plugins.filter(
      (plugin): plugin is ExtenderAddonProviderPlugin => plugin.type === 'addon-provider',
    );
  }

  public getComponentsForSlot(slot: string, componentSet: 'viewerComponents' | 'repoComponents') {
    return new Map<ExtenderAddonProviderPlugin, Type<ExtenderPluginBaseComponent>[]>(
      this.addonProviders.map(p => [p, p?.[componentSet]?.[slot] ?? []] as const),
    );
  }

  public hasComponentsForSlot(slot: string, componentSet: 'viewerComponents' | 'repoComponents') {
    const components = this.getComponentsForSlot(slot, componentSet);
    return Array.from(components.values()).some(c => c.length > 0);
  }

  public findAddonForComponent(
    slot: string,
    componentSet: 'viewerComponents' | 'repoComponents',
    component: Type<ExtenderPluginBaseComponent>,
  ): ExtenderAddonProviderPlugin | undefined {
    return this.addonProviders.find(p =>
      p?.[componentSet]?.[slot]?.find(c => c.name === component.name),
    );
  }
}
