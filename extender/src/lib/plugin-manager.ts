import { Type } from '@angular/core';
import { ExtenderPluginBaseComponent } from './factory';
import { ExtenderPlugin } from './provider';

class ExtenderPluginManagerImpl {
  plugins: ExtenderPlugin[] = [];
  services: Record<string, Type<unknown>> = {};
  componentSet: 'viewerComponents' | 'repoComponents' = 'repoComponents';
  disabledPlugins = new Set<string>();

  get enabledPlugins(): ExtenderPlugin[] {
    return Array.from(this.plugins.values()).filter(p => !this.disabledPlugins.has(p.name));
  }

  public initialize(options: {
    plugins: ExtenderPlugin[];
    services: Record<string, Type<unknown>>;
    componentSet: 'viewerComponents' | 'repoComponents';
  }) {
    this.plugins = options.plugins;
    this.services = options.services;
    this.componentSet = options.componentSet;
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

export const ExtenderPluginManager = new ExtenderPluginManagerImpl();
export type ExtenderPluginManager = ExtenderPluginManagerImpl;
