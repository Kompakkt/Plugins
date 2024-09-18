import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { map, filter } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';

import {
  IDigitalEntity,
  isDigitalEntity,
  isInstitution,
  IAddress,
  IMediaHierarchy,
} from  '../../../../common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, CommonModule } from '@angular/common';

interface ILicence {
  title: string;
  src: string;
  description: string;
  link: string;
}

// TODO: Kompakkt/Common typeguard
const isAddress = (obj: IAddress): obj is IAddress => {
  return (
    !!obj?.building ||
    !!obj?.city ||
    !!obj?.country ||
    !!obj?.number ||
    !!obj?.street ||
    !!obj?.postcode
  );
};

@Component({
  selector: 'app-detail-entity',
  templateUrl: './detail-entity.component.html',
  styleUrls: ['../../../theme.scss', './detail-entity.component.scss'],
  standalone: true,
  imports: [AsyncPipe, CommonModule, MatExpansionModule, MatIconModule],
})
export class DetailEntityComponent implements OnChanges {
  @Input('digitalEntity')
  public digitalEntity: IDigitalEntity | undefined = undefined;

  private entitySubject = new BehaviorSubject<IDigitalEntity | undefined>(undefined);

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
      description:
        'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-sa/4.0',
    },
    50: {
      title: 'BYNCND',
      src: 'assets/licence/BYNCND.png',
      description:
        'Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-nd/4.0',
    },
    54: {
      title: 'AR',
      src: 'assets/licence/AR.png',
      description: 'All rights reserved',
      link: 'https://en.wikipedia.org/wiki/All_rights_reserved',
    },
  };

  get agents$() {
    return this.digitalEntity$.pipe(map(entity => entity.agents));
  }

  get techniques$() {
    return this.digitalEntity$.pipe(map(entity => entity.techniques));
  }

  get software$() {
    return this.digitalEntity$.pipe(map(entity => entity.software));
  }

  get equipment$() {
    return this.digitalEntity$.pipe(map(entity => entity.equipment));
  }

  get creationDate$() {
    return this.digitalEntity$.pipe(map(entity => new Date(entity.creationDate || '')));
  }

  get externalLinks$() {
    return this.digitalEntity$.pipe(map(entity => entity.externalLinks));
  }

  get bibliographicRefs$() {
    return this.digitalEntity$.pipe(map(entity => entity.bibliographicRefs));
  }

  get hierarchies$() {
    return this.digitalEntity$.pipe(map(entity => entity.hierarchies));
  }

  get physicalObjects$() {
    return this.digitalEntity$.pipe(map(entity => entity.physicalObjs));
  }

  get hasAgents$() {
    return this.agents$.pipe(
      map(agents => agents.length > 0),
    );
  }

  get hasCreationData$() {
    return this.digitalEntity$.pipe(map(entity => {
      return entity.techniques?.length ||
             entity.software?.length ||
             entity.equipment?.length ||
             entity.creationDate;
    }));
  }

  get hasExternalLinks$() {
    return this.externalLinks$.pipe(
      map(links => links.length > 0),
    );
  }

  get hasBibliograpicRefs$() {
    return this.bibliographicRefs$.pipe(
      map(refs => refs.length > 0),
    );
  }

  get hasHierarchies$() {
    return this.hierarchies$.pipe(
      map(hs => hs.length > 0),
    );
  }

  get digitalEntity$() {
    return this.entitySubject.pipe(
      filter(entity => isDigitalEntity(entity)),
      map(entity => entity as IDigitalEntity),
    );
  }

  isHierarchyEmpty(hierarchy: IMediaHierarchy) {
    return hierarchy.parents.length === 0 && hierarchy.siblings.length === 0;
  }

  // get place$() {
  //   return this.physicalEntity$.pipe(map(physicalEntity => physicalEntity.place));
  // }

  // get address$() {
  //   return this.place$.pipe(
  //     map(place => place.address),
  //     filter(
  //       address => isAddress(address),
  //       map(address => address as IAddress),
  //     ),
  //   );
  // }

  ngOnChanges(changes: SimpleChanges) {
    const digitalEntity = changes['digitalEntity']?.currentValue as IDigitalEntity | undefined;

    if (digitalEntity) this.entitySubject.next(digitalEntity);
  }
}
