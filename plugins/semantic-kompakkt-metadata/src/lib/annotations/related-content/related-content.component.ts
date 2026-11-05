import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { isAnnotation } from '@kompakkt/common';
import { IWikibaseItem, WikibaseExtendedAnnotation } from '../../../common/wikibase.common';
import { WikibaseItemCardComponent } from '../wikibase-item-card/wikibase-item-card.component';

@Component({
  selector: 'lib-related-content',
  imports: [MatIconModule, WikibaseItemCardComponent],
  templateUrl: './related-content.component.html',
  styleUrl: './related-content.component.scss',
})
export class RelatedContentComponent
  extends createExtenderComponent()
  implements OnInit, OnDestroy
{
  annotation = signal<WikibaseExtendedAnnotation | undefined>(undefined);

  #subscription?: Subscription;
  ngOnInit(): void {
    this.#subscription = this.dataSubject
      .pipe(
        // TODO: Use fast-is-equal library or similar?
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
      )
      .subscribe(annotation => {
        if (!isAnnotation(annotation)) {
          return console.warn('Annotation does not suffice as annotation', annotation);
        }
        const extendedAnnotation = structuredClone(annotation) as WikibaseExtendedAnnotation;
        extendedAnnotation.extensions ??= {};
        extendedAnnotation.extensions.wikibase ??= {};
        this.annotation.set(extendedAnnotation);
      });
  }
  ngOnDestroy(): void {
    this.#subscription?.unsubscribe();
  }

  relatedMediaUrls = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.mediaUrls ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedMediaUrls'] ?? []) as string[]),
    ];
  });

  relatedMedia = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.media ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedMedia'] ?? []) as IWikibaseItem[]),
    ];
  });

  relatedConcepts = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.entities ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedEntities'] ?? []) as IWikibaseItem[]),
    ];
  });

  relatedAgents = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.authors ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedAgents'] ?? []) as IWikibaseItem[]),
    ];
  });

  relatedLicenses = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.licenses ?? []),
      // @ts-ignore - this is for backward compatibility, we should remove it in the future
      ...((annotation?.body?.content?.['relatedLicenses'] ?? []) as IWikibaseItem[]),
    ];
  });
}
