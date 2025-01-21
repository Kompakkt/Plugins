import { createExtenderPlugin } from "@kompakkt/extender";
import { EntityComponent } from "./metadata-wizard/entity/entity.component";
import { EntityDetailComponent } from "./metadata-entity/entity-detail/entity-detail.component";
import { RelatedContentComponent } from "./annotations/view/related-content/related-content.component";

export class SemanticKompakktMetadataPlugin extends createExtenderPlugin({
  name: "Semantic Kompakkt Metadata",
  description: "Plugin adding Semantic Kompakkt Metadata",
  version: "0.0.1",
  tokenName: "SemanticKompakktMetadataPlugin",
  viewerComponents: {
    "annotation-embeddables": [RelatedContentComponent],
  },
  repoComponents: {
    "entity-wizard": [EntityComponent],
    "entity-detail": [EntityDetailComponent],
  },
}) {
  // Custom logic
}
