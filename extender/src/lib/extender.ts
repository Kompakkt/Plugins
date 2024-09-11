import {
  EnvironmentProviders,
  InjectionToken,
  Type,
  makeEnvironmentProviders,
} from '@angular/core';
import { ExtenderPluginManager } from './manager';
import { ExtenderProviderPlugin } from './provider';

export type ExtenderOptions<T> = {
  componentSet: 'viewerComponents' | 'repoComponents';
  plugins: ExtenderProviderPlugin[];
  services: Record<string, Type<T>>;
};

export const PLUGIN_MANAGER = new InjectionToken<ExtenderPluginManager<unknown>>(
  'KOMPAKKT_EXTENDER_PLUGIN_MANAGER',
);

export const PLUGIN_COMPONENT_SET = new InjectionToken<ExtenderOptions<unknown>['componentSet']>(
  'KOMPAKKT_EXTENDER_PLUGIN_COMPONENT_SET',
);

export const provideExtender = <T>({
  componentSet,
  plugins,
  services,
}: ExtenderOptions<T>): EnvironmentProviders => {
  const servicesByPlugins = plugins.map(p => Object.values((p as any).services)).flat();
  return makeEnvironmentProviders([
    {
      provide: PLUGIN_MANAGER,
      useFactory: () => new ExtenderPluginManager<T>(plugins, services),
    },
    {
      provide: PLUGIN_COMPONENT_SET,
      useValue: componentSet,
    },
    servicesByPlugins.map(c => ({ provide: c, useClass: c })),
    ...plugins
      .filter(p => !!(p.constructor as any)?.providerToken)
      .map(p => {
        const provide = (p.constructor as any).providerToken;
        return { provide, useValue: p };
      }),
  ]);
};
