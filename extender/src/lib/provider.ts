/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

import { Type } from '@angular/core';
import { ExtenderPluginBaseComponent } from './factory';

export type ExtenderPlugin = {
  tokenName?: string;
  name: string;
  description: string;

  version: `${number}.${number}.${number}`;
  viewerComponents: Record<string, Type<ExtenderPluginBaseComponent>[]>;
  repoComponents: Record<string, Type<ExtenderPluginBaseComponent>[]>;

  enabled?: boolean;
};
