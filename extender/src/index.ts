export {
  type ExtenderOptions,
  EXTENDER_BACKEND_SERVICE,
  EXTENDER_TRANSLATE_PIPE,
  type BackendService,
  type TranslatePipe,
  provideExtender,
} from './lib/extender';
export {
  createExtenderComponent,
  createExtenderPlugin,
  type ExtenderPluginBaseComponent,
} from './lib/factory';
export { ExtenderSlotManager, type ExtenderSlotEvent } from './lib/slot-manager';
export { type ExtenderPlugin } from './lib/provider';
export { ExtenderPluginManager } from './lib/plugin-manager';
export { ExtenderTransformer } from './lib/transformer';
