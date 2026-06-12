import { signal } from '@angular/core';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  createExtenderComponent,
  createExtenderPlugin,
  ExtenderTransformer,
} from '@kompakkt/plugins/extender';
import { BehaviorSubject } from 'rxjs';
import { Collection, isEntity } from '@kompakkt/common';

type DfgMetsExtensionData = {
  dfgMets?: {
    sharingEnabled?: boolean;
  };
};

@Component({
  template: `
    <div class="toggle-row">
      <mat-icon>open_in_browser</mat-icon>
      <p>{{ 'Allow usage in DFG 3D-Viewer' }}</p>
      <mat-slide-toggle
        [checked]="allowUsage()"
        (change)="setUsage($event.checked)"
        name="allowDfg3dViewerUsage"
      />
    </div>
  `,
  styles: `
    p {
      margin: 0;
    }

    .toggle-row {
      display: flex;
      flex-direction: row;
      gap: 16px;
    }
  `,
  imports: [MatSlideToggleModule, MatIconModule],
})
class Dfg3dMetsToggleComponent extends createExtenderComponent() {
  allowUsage = signal(false);
  setUsage(allowed: boolean) {
    this.allowUsage.set(allowed);
    this.event.emit(new CustomEvent<boolean>('dfg3d-mets-usage-changed', { detail: allowed }));
  }

  /*#transformerId = ExtenderTransformer.registerTransformer(Collection.entity, async entity => {
    entity.extensions ??= {};
    (entity.extensions as DfgMetsExtensionData).dfgMets ??= {};
    (entity.extensions as DfgMetsExtensionData).dfgMets!.sharingEnabled = this.allowUsage();
    return entity;
  });*/

  constructor() {
    super();
    this.dataSubject.subscribe(data => {
      // Data from Visibility & Access will either be an array of Entities, or an array of Comilations.
      // We are only interested in the Entity case
      if (Array.isArray(data)) {
        const entities = data.filter(isEntity);
        if (entities.length === 0) {
          this.allowUsage.set(false);
          return;
        }
        const isAnyEnabled = entities.some(entity => {
          const extensionData = entity.extensions as DfgMetsExtensionData;
          return (
            'dfgMets' in extensionData &&
            typeof extensionData.dfgMets === 'object' &&
            'sharingEnabled' in extensionData.dfgMets &&
            extensionData.dfgMets.sharingEnabled === true
          );
        });
        this.allowUsage.set(isAnyEnabled);
        return;
      }
    });
  }

  override ngOnDestroy(): void {
    // ExtenderTransformer.unregisterTransformer(Collection.entity, this.#transformerId);
    super.ngOnDestroy();
  }
}

export class Dfg3dMetsPlugin extends createExtenderPlugin({
  name: 'DFG 3D METS',
  description: 'Adds compatibility for marking metadata as consumable by the DFG 3D Viewer.',
  version: '0.0.1',
  tokenName: 'Dfg3dMetsPlugin',
  viewerComponents: {},
  repoComponents: {
    'visibility-and-access-toggles': [Dfg3dMetsToggleComponent],
  },
}) {}
