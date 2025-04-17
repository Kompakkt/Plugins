import { type AfterViewInit, Component, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createExtenderComponent } from '@kompakkt/extender';
import { type IDigitalEntity, isDigitalEntity, isEntity } from '../../../common';
import type {
  IWikibaseDigitalEntityExtension,
  IWikibaseLabel,
} from '../../../common/wikibase.common';
import { getLabel } from '../../get-label.pipe';
import { transformOldWikibaseEntityToExtension } from '../../metadata-wizard/metadata';
import { DetailEntityComponent } from './detail-entity/detail-entity.component';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['../../theme.scss', './entity-detail.component.scss'],
  imports: [CommonModule, DetailEntityComponent],
})
export class EntityDetailComponent extends createExtenderComponent() implements AfterViewInit {
  entity = computed(() => {
    const slotData = this.slotData();
    console.log('EntityDetailComponentPlugin', slotData, isEntity(slotData));
    return isEntity(slotData) ? slotData : undefined;
  });
  digitalEntity = computed(() => {
    const entity = this.entity();
    if (!isDigitalEntity(entity?.relatedDigitalEntity)) return undefined;
    return entity.relatedDigitalEntity as IDigitalEntity<IWikibaseDigitalEntityExtension>;
  });
  wikibaseData = computed(() => {
    let digitalEntity = this.digitalEntity();
    if (!digitalEntity) return undefined;
    digitalEntity = transformOldWikibaseEntityToExtension(digitalEntity);
    if (!digitalEntity?.extensions?.wikibase) return undefined;
    return digitalEntity.extensions.wikibase;
  });

  label = computed(() => {
    const wikibaseData = this.wikibaseData();
    if (!wikibaseData?.label) return 'No label';
    return getLabel(wikibaseData as { label: IWikibaseLabel });
  });
  description = computed(() => {
    const wikibaseData = this.wikibaseData();
    if (!wikibaseData?.description) return 'No description';
    return getLabel({ label: wikibaseData.description });
  });

  constructor() {
    super();
    effect(() => {
      console.log({
        entity: this.entity(),
        digitalEntity: this.digitalEntity(),
        wikibaseData: this.wikibaseData(),
      });
    });
  }

  public copyId() {
    const _id = this.entity()?._id;
    if (!_id) throw new Error('Could not copy id');
    const copyIdEvent = new CustomEvent('copy-to-clipboard', {
      detail: _id.toString(),
    });
    window.dispatchEvent(copyIdEvent);
  }

  ngAfterViewInit() {
    // Workaround for https://github.com/angular/components/issues/11478
    const interval = setInterval(
      () => document.querySelectorAll('mat-tooltip-component').forEach(item => item.remove()),
      50,
    );

    setTimeout(() => clearInterval(interval), 500);
  }
}
