import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/extender';
import { map } from 'rxjs';
import { IAnnotation, isAnnotation } from '../../../common';
import { IWikibaseAnnotationExtension, IWikibaseItem } from '../../../common/wikibase.common';
import { WikibaseItemCardComponent } from '../wikibase-item-card/wikibase-item-card.component';

@Component({
  selector: 'lib-related-content',
  imports: [MatIconModule, AsyncPipe, WikibaseItemCardComponent],
  templateUrl: './related-content.component.html',
  styleUrl: './related-content.component.scss',
})
export class RelatedContentComponent extends createExtenderComponent() {
  annotation$ = this.dataSubject.pipe(
    map(data => {
      if (!isAnnotation(data)) return;
      return data as IAnnotation<IWikibaseAnnotationExtension>;
    }),
  );

  relatedMediaUrls$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.mediaUrls ?? []),
          ...(annotation?.body?.content?.['relatedMediaUrls'] ?? []),
        ] as string[],
    ),
  );

  relatedMedia$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.media ?? []),
          ...(annotation?.body?.content?.['relatedMedia'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  relatedConcepts$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.entities ?? []),
          ...(annotation?.body?.content?.['relatedEntities'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  relatedAgents$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.authors ?? []),
          ...(annotation?.body?.content?.['relatedAgents'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  relatedLicenses$ = this.annotation$.pipe(
    map(
      annotation =>
        [
          ...(annotation?.extensions?.wikibase?.licenses ?? []),
          ...(annotation?.body?.content?.['relatedLicenses'] ?? []),
        ] as IWikibaseItem[],
    ),
  );

  extensionData$ = this.annotation$.pipe(map(annotation => annotation?.extensions?.wikibase));
}
