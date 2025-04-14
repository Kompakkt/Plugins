import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { createExtenderComponent } from '@kompakkt/extender';
import { ButtonComponent } from 'komponents';
import { map } from 'rxjs';
import { IAnnotation, isAnnotation } from '../../../common';
import { IWikibaseAnnotationExtension, IWikibaseItem } from '../../../common/wikibase.common';
import { getWikibaseItemAddress } from '../../wikibase-item-address.pipe';

@Component({
  selector: 'lib-open-in-wikibase-button',
  imports: [ButtonComponent, MatIconModule, AsyncPipe],
  templateUrl: './open-in-wikibase-button.component.html',
  styleUrl: './open-in-wikibase-button.component.scss',
})
export class OpenInWikibaseButtonComponent extends createExtenderComponent() {
  annotation$ = this.dataSubject.pipe(
    map(data => {
      if (!isAnnotation(data)) return;
      return data as IAnnotation<IWikibaseAnnotationExtension>;
    }),
  );

  wikibaseUrl$ = this.annotation$.pipe(
    map(annotation => {
      const extensionData = annotation?.extensions?.wikibase as IWikibaseItem & { address: string };
      if (!extensionData?.id) return undefined;
      if (!extensionData?.address) return undefined;
      const url = getWikibaseItemAddress(extensionData, extensionData);
      return url;
    }),
  );

  async openInWikibase(url: string) {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.open(window.location.origin + url, '_blank');
    }
  }
}
