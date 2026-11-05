import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { ButtonComponent } from '@kompakkt/komponents';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { isAnnotation } from '@kompakkt/common';
import { IWikibaseItem, WikibaseExtendedAnnotation } from '../../../common/wikibase.common';
import { getWikibaseItemAddress } from '../../wikibase-item-address.pipe';
import { ContentProviderService } from '../../content-provider.service';

@Component({
  selector: 'lib-open-in-wikibase-button',
  imports: [ButtonComponent, MatIconModule],
  templateUrl: './open-in-wikibase-button.component.html',
  styleUrl: './open-in-wikibase-button.component.scss',
})
export class OpenInWikibaseButtonComponent
  extends createExtenderComponent()
  implements OnInit, OnDestroy
{
  #content = inject(ContentProviderService);
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
