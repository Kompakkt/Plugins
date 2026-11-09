import { Component, computed, effect, inject, signal } from '@angular/core';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { IEntityResolved, isDigitalEntity, isEntity } from '@kompakkt/common';
import type {
  IMediaHierarchy,
  IWikibaseDigitalEntityExtensionData,
  IWikibaseItem,
  IWikibaseLabel,
  WikibaseExtendedDigitalEntity,
} from '../../../common/wikibase.common';
import { getLabel, GetLabelPipe } from '../../get-label.pipe';
import { transformOldWikibaseEntityToExtension } from '../../metadata-wizard/metadata';
import { ContentProviderService } from '../../content-provider.service';
import {
  getWikibaseItemAddress,
  GetWikibaseItemAddressPipe,
} from '../../wikibase-item-address.pipe';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

interface ILicence {
  title: string;
  src: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-entity-detail',
  templateUrl: './entity-detail.component.html',
  styleUrls: ['../../theme.scss', './entity-detail.component.scss'],
  imports: [MatDividerModule, MatIconModule, GetLabelPipe, GetWikibaseItemAddressPipe],
})
export class EntityDetailComponent extends createExtenderComponent() {
  _dataChangedEffectRef = effect(() => {
    const value = this.dataSignal();
    if (!isEntity(value)) return console.info('Signal value does not suffice as entity', value);
    const current = this.entity();
    // TODO: Use fast-is-equal library or similar?
    if (JSON.stringify(current) === JSON.stringify(value)) return;
    this.entity.set(value as IEntityResolved);
  })

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

  Licenses: { [key: string]: ILicence } = {
    CC0: {
      title: 'CC0',
      src: 'assets/licence/CC0.png',
      description: 'No Rights Reserved (CC0)',
      link: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    BY: {
      title: 'BY',
      src: 'assets/licence/BY.png',
      description: 'Attribution 4.0 International (CC BY 4.0)',
      link: 'https://creativecommons.org/licenses/by/4.0',
    },
    BYSA: {
      title: 'BY-SA',
      src: 'assets/licence/BY-SA.png',
      description: 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
    BYND: {
      title: 'BY-ND',
      src: 'assets/licence/BY-ND.png',
      description: 'Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nd/4.0',
    },
    BYNC: {
      title: 'BY-NC',
      src: 'assets/licence/BYNC.png',
      description: 'Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc/4.0',
    },
    BYNCSA: {
      title: 'BY-NC-SA',
      src: 'assets/licence/BYNCSA.png',
      description: 'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-sa/4.0',
    },
    BYNCND: {
      title: 'BY-NC-ND',
      src: 'assets/licence/BYNCND.png',
      description: 'Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-nd/4.0',
    },
    AR: {
      title: 'AR',
      src: 'assets/licence/AR.png',
      description: 'All rights reserved',
      link: 'https://en.wikipedia.org/wiki/All_rights_reserved',
    },
  } as const;

  usedLicense = computed(() => {
    const wikibaseData = this.wikibaseData();
    const license = wikibaseData?.licence?.replace('-', '');
    if (!license) return undefined;
    return this.Licenses[license];
  });

  hasAgents = computed(() => {
    const agents = this.wikibaseData()?.agents?.length;
    return agents ? agents > 0 : false;
  });

  creationDate = computed<string | IWikibaseItem | undefined>(() => {
    const wikibaseData = this.wikibaseData();
    if (!wikibaseData?.creationDate) return undefined;
    return Array.isArray(wikibaseData.creationDate)
      ? wikibaseData.creationDate.join(' - ')
      : wikibaseData.creationDate;
  });

  hasCreationData = computed(() => {
    const techniques = this.wikibaseData()?.techniques?.length;
    const software = this.wikibaseData()?.software?.length;
    const equipment = this.wikibaseData()?.equipment?.length;
    const creationDate = this.creationDate();
    return !!(techniques || software || equipment || creationDate);
  });

  hasExternalLinks = computed(() => {
    const links = this.wikibaseData()?.externalLinks?.length;
    return links ? links > 0 : false;
  });

  hasBibliograpicRefs = computed(() => {
    const refs = this.wikibaseData()?.bibliographicRefs?.length;
    return refs ? refs > 0 : false;
  });

  hasHierarchies = computed(() => {
    const hierarchies = this.wikibaseData()?.hierarchies?.length;
    return hierarchies ? hierarchies > 0 : false;
  });

  isHierarchyEmpty(hierarchy: IMediaHierarchy) {
    return hierarchy.parents.length === 0 && hierarchy.siblings.length === 0;
  }
}
