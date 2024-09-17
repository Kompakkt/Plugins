export {
  type ExtenderOptions,
  PLUGIN_COMPONENT_SET,
  PLUGIN_MANAGER,
  EXTENDED_BACKEND_SERVICE,
  type BackendService,
  provideExtender,
} from "./lib/extender";
export {
  createExtenderComponent,
  createExtenderPlugin,
  type ExtenderPluginBaseComponent,
} from "./lib/factory";
export { ExtenderSlotDirective } from "./lib/slot.directive";
export { type ExtenderAddonProviderPlugin, type ExtenderDataProviderPlugin } from "./lib/provider";
export { type ExtenderPluginManager } from "./lib/manager";
