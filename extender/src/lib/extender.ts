import {
  EnvironmentProviders,
  InjectionToken,
  Type,
  makeEnvironmentProviders,
} from '@angular/core';
import { ExtenderPluginManager } from './manager';
import { ExtenderProviderPlugin } from './provider';

abstract class BackendServiceClass {
  public abstract get(path: string): Promise<any>
  public abstract post(path: string, obj: any): Promise<any>
}

export type BackendService = Type<BackendServiceClass>

export type ExtenderOptions<T> = {
  componentSet: 'viewerComponents' | 'repoComponents';
  plugins: ExtenderProviderPlugin[];
  services: Record<string, Type<T>>;
  backendService: BackendService;
};

export const PLUGIN_MANAGER = new InjectionToken<ExtenderPluginManager<unknown>>(
  'KOMPAKKT_EXTENDER_PLUGIN_MANAGER',
);

export const PLUGIN_COMPONENT_SET = new InjectionToken<ExtenderOptions<unknown>['componentSet']>(
  'KOMPAKKT_EXTENDER_PLUGIN_COMPONENT_SET',
);

export const EXTENDED_BACKEND_SERVICE = new InjectionToken<BackendServiceClass>(
  'KOMPAKKT_EXTENDER_BACKEND_SERVICE',
)

export const provideExtender = <T>({
  componentSet,
  plugins,
  services,
  backendService,
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
    {
      provide: EXTENDED_BACKEND_SERVICE,
      useClass: backendService,
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
