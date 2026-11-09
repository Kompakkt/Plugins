import { Component, signal, computed, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { isAnnotation } from '@kompakkt/common';
import { IWikibaseItem, WikibaseExtendedAnnotation } from '../../../common/wikibase.common';
import { WikibaseItemCardComponent } from '../wikibase-item-card/wikibase-item-card.component';

@Component({
  selector: 'lib-related-content',
  imports: [MatIconModule, WikibaseItemCardComponent],
  templateUrl: './related-content.component.html',
  styleUrl: './related-content.component.scss',
})
export class RelatedContentComponent extends createExtenderComponent() {
  annotation = signal<WikibaseExtendedAnnotation | undefined>(undefined);

  _dataChangedEffectRef = effect(() => {
    const value = this.dataSignal();
    if (!isAnnotation(value))
      return console.warn('Annotation does not suffice as annotation', value);
    const extendedAnnotation = structuredClone(value) as WikibaseExtendedAnnotation;
    extendedAnnotation.extensions ??= {};
    extendedAnnotation.extensions.wikibase ??= {};
    this.annotation.set(extendedAnnotation);
  });

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
