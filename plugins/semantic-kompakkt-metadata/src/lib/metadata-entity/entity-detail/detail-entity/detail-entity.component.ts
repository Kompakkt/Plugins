import { Component, computed, input } from '@angular/core';

import { AsyncPipe, CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import type { IDigitalEntity } from '../../../../common';
import type {
  IMediaHierarchy,
  IWikibaseDigitalEntityExtension,
} from '../../../../common/wikibase.common';
import { GetLabelPipe } from '../../../get-label.pipe';

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
    imports: [AsyncPipe, CommonModule, MatExpansionModule, MatIconModule, GetLabelPipe]
})
export class DetailEntityComponent {
  digitalEntity = input.required<IDigitalEntity<IWikibaseDigitalEntityExtension>>();
  wikibaseData = computed(() => {
    const digitalEntity = this.digitalEntity();
    if (!digitalEntity?.extensions?.wikibase) return undefined;
    return digitalEntity.extensions.wikibase;
  });

  public Licenses: { [key: number]: ILicence } = {
    46: {
      title: 'CC0',
      src: 'assets/licence/CC0.png',
      description: 'No Rights Reserved (CC0)',
      link: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    47: {
      title: 'BY',
      src: 'assets/licence/BY.png',
      description: 'Attribution 4.0 International (CC BY 4.0)',
      link: 'https://creativecommons.org/licenses/by/4.0',
    },
    48: {
      title: 'BY-SA',
      src: 'assets/licence/BY-SA.png',
      description: 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
    51: {
      title: 'BY-ND',
      src: 'assets/licence/BY-ND.png',
      description: 'Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nd/4.0',
    },
    49: {
      title: 'BYNC',
      src: 'assets/licence/BYNC.png',
      description: 'Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc/4.0',
    },
    52: {
      title: 'BYNCSA',
      src: 'assets/licence/BYNCSA.png',
      description: 'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-sa/4.0',
    },
    50: {
      title: 'BYNCND',
      src: 'assets/licence/BYNCND.png',
      description: 'Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-nd/4.0',
    },
    54: {
      title: 'AR',
      src: 'assets/licence/AR.png',
      description: 'All rights reserved',
      link: 'https://en.wikipedia.org/wiki/All_rights_reserved',
    },
  };

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
