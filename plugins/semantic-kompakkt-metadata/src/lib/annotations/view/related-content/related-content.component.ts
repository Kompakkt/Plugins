import { Component, computed } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/extender';
import { IAnnotation, isAnnotation } from '../../../../common';
import { IWikibaseAnnotationExtension, IWikibaseItem } from '../../../../common/wikibase.common';
import { GetLabelPipe } from "../../../get-label.pipe";
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-related-content',
  standalone: true,
  imports: [GetLabelPipe, MatIconModule],
  templateUrl: './related-content.component.html',
  styleUrl: './related-content.component.css',
})
export class RelatedContentComponent extends createExtenderComponent() {
  annotation = computed(() => {
    const slotData = this.slotData();
    console.log('RelatedContentComponent', slotData);
    return isAnnotation(slotData)
      ? (slotData as IAnnotation<IWikibaseAnnotationExtension>)
      : undefined;
  });

  relatedMediaUrls = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.mediaUrls ?? []),
      ...(annotation?.body?.content?.['relatedMediaUrls'] ?? []),
    ] as string[];
  });

  relatedMedia = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.media ?? []),
      ...(annotation?.body?.content?.['relatedMedia'] ?? []),
    ] as IWikibaseItem[];
  });

  relatedEntities = computed(() => {
    const annotation = this.annotation();
    return [
      ...(annotation?.extensions?.wikibase?.entities ?? []),
      ...(annotation?.body?.content?.['relatedEntities'] ?? []),
    ] as IWikibaseItem[];
  });
}
