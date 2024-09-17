import { createExtenderPlugin } from "@kompakkt/extender";
import { EntityComponent } from "./metadata-wizard/entity/entity.component";

export class TemplatePlugin extends createExtenderPlugin({
  name: "Template",
  description: "Template plugin",
  version: "0.0.1",
  tokenName: "TemplatePlugin",
  viewerComponents: {},
  repoComponents: {
    "entity-wizard": [EntityComponent]
  },
}) {
  // Custom logic
}
