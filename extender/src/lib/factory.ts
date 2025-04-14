import {
  ChangeDetectorRef,
  Directive,
  InjectionToken,
  OnDestroy,
  Type,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ExtenderPluginManager } from './manager';
import { ExtenderPlugin } from './provider';
import { BehaviorSubject } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

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
export class ExtenderPluginBaseComponent implements OnDestroy {
  readonly dataSubject = new BehaviorSubject<unknown>(undefined);
  readonly slotData = toSignal(this.dataSubject);
  readonly event = output<CustomEvent>();
  readonly pluginManager = input<ExtenderPluginManager>();

  readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnDestroy(): void {
    this.dataSubject?.unsubscribe();
  }
}

export const createExtenderComponent = () => {
  return class extends ExtenderPluginBaseComponent {};
};
