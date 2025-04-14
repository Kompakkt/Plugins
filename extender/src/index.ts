export {
  type ExtenderOptions,
  PLUGIN_COMPONENT_SET,
  PLUGIN_MANAGER,
  EXTENDED_BACKEND_SERVICE,
  type BackendService,
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
