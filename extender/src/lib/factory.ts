import { Directive, InjectionToken, Type, input, output, signal } from '@angular/core';
import { ExtenderPluginManager } from './manager';
import { ExtenderPlugin } from './provider';

@Directive()
class ExtenderAddonProviderPluginBase {}

export const createExtenderPlugin = (options: {
  name: string;
  description: string;
  version: `${number}.${number}.${number}`;
  viewerComponents?: Record<string, Type<ExtenderPluginBaseComponent>[]>;
  repoComponents?: Record<string, Type<ExtenderPluginBaseComponent>[]>;
  services?: Record<string, Type<unknown>>;
  tokenName: string;
}) => {
  const providerToken = new InjectionToken<ExtenderPlugin>(
    `KOMPAKKT_EXTENDER_PLUGIN_${options.tokenName}`,
  );

  return class extends ExtenderAddonProviderPluginBase implements ExtenderPlugin {
    readonly type = 'addon-provider' as const;
    readonly tokenName = options.tokenName;
    readonly name = options.name;
    readonly description = options.description;
    readonly version = options.version;
    readonly viewerComponents = options.viewerComponents ?? {};
    readonly repoComponents = options.repoComponents ?? {};
    readonly services = options.services ?? {};

    static readonly providerToken = providerToken;
  };
};

@Directive()
export class ExtenderPluginBaseComponent {
  readonly slotData = input<unknown>();
  readonly event = output<Event>();
  readonly pluginManager = input<ExtenderPluginManager>();

  public async getSlotOutput(): Promise<unknown> {
    throw new Error('Not implemented');
  }
}

export const createExtenderComponent = () => {
  return class extends ExtenderPluginBaseComponent {};
};
