import {
  EnvironmentProviders,
  InjectionToken,
  PipeTransform,
  Type,
  makeEnvironmentProviders,
} from '@angular/core';
import { ExtenderPluginManager } from './manager';
import { ExtenderPlugin } from './provider';

abstract class BackendServiceClass {
  public abstract get(path: string): Promise<any>;
  public abstract post(path: string, obj: any): Promise<any>;
}

export type BackendService = Type<BackendServiceClass>;

abstract class TranslatePipeClass implements PipeTransform {
  public abstract transform(key: string): string;
}

export type TranslatePipe = Type<TranslatePipeClass>;

export type ExtenderOptions = {
  componentSet: 'viewerComponents' | 'repoComponents';
  plugins: ExtenderPlugin[];
  services: Record<string, Type<unknown>> & {
    backendService: BackendService;
  };
  pipes: Record<string, Type<unknown>> & {
    translatePipe: TranslatePipe;
  };
};

export const PLUGIN_MANAGER = new InjectionToken<ExtenderPluginManager>(
  'KOMPAKKT_EXTENDER_PLUGIN_MANAGER',
);

export const PLUGIN_COMPONENT_SET = new InjectionToken<ExtenderOptions['componentSet']>(
  'KOMPAKKT_EXTENDER_PLUGIN_COMPONENT_SET',
);

export const EXTENDER_BACKEND_SERVICE = new InjectionToken<BackendServiceClass>(
  'KOMPAKKT_EXTENDER_BACKEND_SERVICE',
);

export const EXTENDER_TRANSLATE_PIPE = new InjectionToken<TranslatePipeClass>(
  'KOMPAKKT_EXTENDER_TRANSLATE_PIPE',
);

export const EXTENDER_PLUGINS = new InjectionToken<ExtenderPlugin[]>('KOMPAKKT_EXTENDER_PLUGINS');

export const EXTENDER_SERVICES = new InjectionToken<Record<string, Type<unknown>>>(
  'KOMPAKKT_EXTENDER_SERVICES',
);

export const provideExtender = ({
  componentSet,
  plugins,
  services,
  pipes,
}: ExtenderOptions): EnvironmentProviders => {
  const servicesByPlugins = plugins.map(p => Object.values((p as any).services)).flat();
  return makeEnvironmentProviders([
    {
      provide: EXTENDER_PLUGINS,
      useValue: plugins,
    },
    {
      provide: EXTENDER_SERVICES,
      useValue: services,
    },
    {
      provide: PLUGIN_COMPONENT_SET,
      useValue: componentSet,
    },
    {
      provide: PLUGIN_MANAGER,
      useClass: ExtenderPluginManager,
      deps: [EXTENDER_PLUGINS, EXTENDER_SERVICES, PLUGIN_COMPONENT_SET],
    },
    {
      provide: EXTENDER_BACKEND_SERVICE,
      useClass: services.backendService,
    },
    {
      provide: EXTENDER_TRANSLATE_PIPE,
      useClass: pipes.translatePipe,
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
