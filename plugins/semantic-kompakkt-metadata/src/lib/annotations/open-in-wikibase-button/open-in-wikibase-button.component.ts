import { Component, signal, computed, inject, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { ButtonComponent } from '@kompakkt/komponents';
import { isAnnotation } from '@kompakkt/common';
import { WikibaseExtendedAnnotation } from '../../../common/wikibase.common';
import { getWikibaseItemAddress } from '../../wikibase-item-address.pipe';
import { ContentProviderService } from '../../content-provider.service';

@Component({
  selector: 'lib-open-in-wikibase-button',
  imports: [ButtonComponent, MatIconModule],
  templateUrl: './open-in-wikibase-button.component.html',
  styleUrl: './open-in-wikibase-button.component.scss',
})
export class OpenInWikibaseButtonComponent extends createExtenderComponent() {
  #content = inject(ContentProviderService);
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

  wikibaseUrl = computed(() => {
    const annotation = this.annotation();
    const instanceInfo = this.#content.instanceInfo();
    const extensionData = annotation?.extensions?.wikibase;
    if (!extensionData?.id) return undefined;
    if (!extensionData?.address) return undefined;
    const url = getWikibaseItemAddress(
      { id: extensionData.id, label: {} },
      { address: extensionData.address },
      instanceInfo,
    );
    return url;
  });

  openInWikibase(url: string) {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.open(window.location.origin + url, '_blank');
    }
  }
}
