import { Component, computed, HostBinding, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import type { IDigitalEntity } from '../../../../common';
import type {
  IMediaHierarchy,
  IWikibaseDigitalEntityExtension,
} from '../../../../common/wikibase.common';
import { GetLabelPipe } from '../../../get-label.pipe';
import { GetWikibaseItemAddressPipe } from '../../../wikibase-item-address.pipe';
import { ContentProviderService } from '../../../content-provider.service';

interface ILicence {
  title: string;
  src: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-detail-entity',
  templateUrl: './detail-entity.component.html',
  styleUrls: ['../../../theme.scss', './detail-entity.component.scss'],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    GetLabelPipe,
    GetWikibaseItemAddressPipe,
  ],
})
export class DetailEntityComponent {
  readonly content = inject(ContentProviderService);

  digitalEntity = input.required<IDigitalEntity<IWikibaseDigitalEntityExtension>>();
  finalizePreviewMode = input<boolean>(false);
  wikibaseData = computed(() => {
    const digitalEntity = this.digitalEntity();
    if (!digitalEntity?.extensions?.wikibase) return undefined;
    return digitalEntity.extensions.wikibase;
  });

  @HostBinding('class.is-finalize-preview')
  get isFinalizePreview() {
    return this.finalizePreviewMode();
  }

  public Licenses: { [key: string]: ILicence } = {
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
  };

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

  creationDate = computed(() => {
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
