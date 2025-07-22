import { Component, computed, inject, input, output } from '@angular/core';
import { IWikibaseItem } from '../../../common/wikibase.common';
import { ContentProviderService } from '../../content-provider.service';
import { getWikibaseItemAddress } from '../../wikibase-item-address.pipe';
import { ButtonComponent, ButtonRowComponent } from 'komponents';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'k-wikibase-item-card',
  imports: [ButtonComponent, ButtonRowComponent, MatIconModule],
  templateUrl: './wikibase-item-card.component.html',
  styleUrl: './wikibase-item-card.component.scss',
})
export class WikibaseItemCardComponent {
  showOpenButton = input<boolean>(true);
  showDeleteButton = input<boolean>(false);

  showButtons = computed(() => {
    return this.showOpenButton() || this.showDeleteButton();
  });

  context = input<string>();

  #content = inject(ContentProviderService);
  item = input.required<IWikibaseItem>();
  trimmedDescription = computed(() => {
    return this.item().description?.trim() ?? '';
  });

  async openInNewTab() {
    const item = this.item();
    const instanceInfo = this.#content.instanceInfo();
    const url = getWikibaseItemAddress(item, instanceInfo);
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      window.open(window.location.origin + url, '_blank');
    }
  }

  onDelete = output<IWikibaseItem>();
  deleteItem() {
    this.onDelete.emit(this.item());
  }
}
