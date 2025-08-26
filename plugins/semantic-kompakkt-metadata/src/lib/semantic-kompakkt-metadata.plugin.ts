import { createExtenderPlugin, ExtenderTransformer } from '@kompakkt/extender';
import { RelatedContentComponent } from './annotations/related-content/related-content.component';
import { ContentProviderService } from './content-provider.service';
import { EntityDetailComponent } from './metadata-entity/entity-detail/entity-detail.component';
import { EntityComponent } from './metadata-wizard/entity/entity.component';
import { IWikibaseAnnotationExtension } from '../common/wikibase.common';
import { IAnnotation, isAnnotation } from '../common';
import { AddRelatedContentComponent } from './annotations/add-related-content/add-related-content.component';
import { OpenInWikibaseButtonComponent } from './annotations/open-in-wikibase-button/open-in-wikibase-button.component';
import { FinalizeOverviewComponent } from './finalize-overview/finalize-overview.component';

export class SemanticKompakktMetadataPlugin extends createExtenderPlugin({
  name: 'Semantic Kompakkt Metadata',
  description: 'Plugin adding Semantic Kompakkt Metadata',
  version: '0.0.1',
  tokenName: 'SemanticKompakktMetadataPlugin',
  viewerComponents: {
    'annotation-embeddables': [RelatedContentComponent],
    'annotation-editor-embeddables': [AddRelatedContentComponent],
    'annotation-preview-buttons': [OpenInWikibaseButtonComponent],
  },
  repoComponents: {
    'entity-wizard': [EntityComponent],
    'entity-wizard-finalize': [FinalizeOverviewComponent],
    'entity-detail': [EntityDetailComponent],
  },
  services: {
    ContentProviderService,
  },
}) {
  constructor() {
    super();
    console.log('SemanticKompakktMetadataPlugin initialized', ExtenderTransformer);
    ExtenderTransformer.registerTransformer<IAnnotation>('annotation', annotation => {
      if (!isAnnotation(annotation)) return annotation;
      const extensions: IWikibaseAnnotationExtension = {
        wikibase: {
          id: undefined,
          label: undefined,
          description: undefined,
          address: undefined,
          authors: [],
          entities: [],
          licenses: [],
          media: [],
          mediaUrls: [],
        },
      };
      const transformed: IAnnotation<IWikibaseAnnotationExtension> = {
        ...annotation,
        extensions: {
          ...annotation.extensions,
          wikibase: {
            ...extensions.wikibase,
            ...(annotation.extensions?.['wikibase'] ?? {}),
          },
        },
      };
      return transformed;
    });
  }
}
