import { Component, computed } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { isDigitalEntity } from '@kompakkt/common';
import { isWikibaseExtendedDigitalEntity } from '../../common/wikibase.common';
import { DetailEntityComponent } from '../metadata-entity/entity-detail/detail-entity/detail-entity.component';

@Component({
  selector: 'app-finalize-overview',
  imports: [DetailEntityComponent],
  templateUrl: './finalize-overview.component.html',
  styleUrl: './finalize-overview.component.css',
})
export class FinalizeOverviewComponent extends createExtenderComponent() {
  entity = computed(() => {
    const slotData = this.slotData();
    console.log('EntityDetailComponentPlugin', {
      slotData,
      isDigital: isDigitalEntity(slotData),
      isWikibaseExtendedDigital: isWikibaseExtendedDigitalEntity(slotData),
    });
    return isWikibaseExtendedDigitalEntity(slotData) ? slotData : undefined;
  });
}
