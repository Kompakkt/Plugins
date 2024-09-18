import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, effect } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { isDigitalEntity, IEntity, IDigitalEntity, isEntity } from '../../../common';
import { createExtenderComponent } from '@kompakkt/extender';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DetailEntityComponent } from './detail-entity/detail-entity.component';

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['../../theme.scss', './entity-detail.component.scss'],
  standalone: true,
  imports: [AsyncPipe, CommonModule, DetailEntityComponent],
})
export class EntityDetailComponent extends createExtenderComponent() implements AfterViewInit {
  private entitySubject = new BehaviorSubject<IEntity | undefined>(undefined);

  constructor() {
    super();
    effect(() => {
      const slotData = this.slotData();
      console.log('EntityDetailComponentPlugin', slotData, isEntity(slotData));
      this.entitySubject.next(isEntity(slotData) ? slotData : undefined);
    });
  }

  get entity$() {
    return this.entitySubject.asObservable();
  }

  get digitalEntity$() {
    return this.entity$.pipe(
      map(entity => entity?.relatedDigitalEntity),
      map(digitalEntity => ({
        ...digitalEntity,
        agents: (digitalEntity as any)?.['agents'] ?? [],
        externalLinks: [],
        bibliographicRefs: [],
        hierarchies: [],
        label: { en: (digitalEntity as any).title },
      })),
      filter(digitalEntity => isDigitalEntity(digitalEntity)),
      map(digitalEntity => digitalEntity as IDigitalEntity),
    );
  }

  // get physicalEntites$() {
  //   return this.digitalEntity$.pipe(map(digitalEntity => digitalEntity.phyObjs));
  // }

  public copyId() {
    const _id = this.entitySubject.value?._id;
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
