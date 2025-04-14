export {
  type ExtenderOptions,
  PLUGIN_COMPONENT_SET,
  PLUGIN_MANAGER,
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
export { ExtenderSlotDirective, type ExtenderSlotEvent } from './lib/slot.directive';
export { type ExtenderPlugin } from './lib/provider';
export { type ExtenderPluginManager } from './lib/manager';
export { ExtenderTransformer } from './lib/transformer';
