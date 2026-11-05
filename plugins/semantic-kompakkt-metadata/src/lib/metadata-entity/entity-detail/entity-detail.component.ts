import {
  type AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';

import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { type IDigitalEntity, IEntityResolved, isDigitalEntity, isEntity } from '@kompakkt/common';
import type {
  IWikibaseDigitalEntityExtensionData,
  IWikibaseLabel,
  WikibaseExtendedDigitalEntity,
} from '../../../common/wikibase.common';
import { getLabel } from '../../get-label.pipe';
import {
  mergeExistingEntityWikibaseExtension,
  transformOldWikibaseEntityToExtension,
} from '../../metadata-wizard/metadata';
import { DetailEntityComponent } from './detail-entity/detail-entity.component';
import { ContentProviderService } from '../../content-provider.service';
import {
  getWikibaseItemAddress,
  GetWikibaseItemAddressPipe,
} from '../../wikibase-item-address.pipe';
import { distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['../../theme.scss', './entity-detail.component.scss'],
  imports: [DetailEntityComponent],
})
export class EntityDetailComponent extends createExtenderComponent() implements OnInit, OnDestroy {
  #subscription?: Subscription;
  ngOnInit(): void {
    this.#subscription = this.dataSubject
      .pipe(
        // TODO: Use fast-is-equal library or similar?
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
      )
      .subscribe(entity => {
        if (!isEntity(entity)) {
          return console.warn('Entity does not suffice as Entity', entity);
        }
        this.entity.set(entity as IEntityResolved);
      });
  }
  ngOnDestroy(): void {
    this.#subscription?.unsubscribe();
  }

  content = inject(ContentProviderService);
  entity = signal<IEntityResolved | undefined>(undefined);
  digitalEntity = computed(() => {
    const entity = this.entity();
    if (!isDigitalEntity(entity?.relatedDigitalEntity)) return undefined;
    const clone = structuredClone(entity.relatedDigitalEntity) as WikibaseExtendedDigitalEntity;
    clone.extensions ??= {};
    clone.extensions.wikibase ??= {};
    const digitalEntity = transformOldWikibaseEntityToExtension(structuredClone(clone));
    return digitalEntity;
  });
  wikibaseData = computed<IWikibaseDigitalEntityExtensionData | undefined>(
    () => this.digitalEntity()?.extensions.wikibase,
  );

  entityUrl = computed(() => {
    const wikibaseData = this.wikibaseData();
    const instanceInfo = this.content.instanceInfo();

    const id = wikibaseData?.id;
    if (!id) return undefined;
    const address = getWikibaseItemAddress(id, wikibaseData, instanceInfo);
    return address;
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
}
