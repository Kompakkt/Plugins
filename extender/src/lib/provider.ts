/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

import { Type } from '@angular/core';
import { ExtenderPluginBaseComponent } from './factory';

export type ExtenderPluginType = 'data-provider' | 'login-provider' | 'addon-provider';

export interface ExtenderPlugin {
  tokenName?: string;
  name: string;
  description: string;

  version: `${number}.${number}.${number}`;
  type: ExtenderPluginType;
}

export interface ExtenderDataProviderPlugin extends ExtenderPlugin {
  type: 'data-provider';
}

export interface ExtenderLoginProviderPlugin extends ExtenderPlugin {
  type: 'login-provider';
}

export interface ExtenderAddonProviderPlugin extends ExtenderPlugin {
  type: 'addon-provider';
  viewerComponents: Record<string, Type<ExtenderPluginBaseComponent>[]>;
  repoComponents: Record<string, Type<ExtenderPluginBaseComponent>[]>;
}

export type ExtenderProviderPlugin =
  | ExtenderDataProviderPlugin
  | ExtenderLoginProviderPlugin
  | ExtenderAddonProviderPlugin;
