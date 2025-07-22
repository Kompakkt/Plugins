import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatOption,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { BehaviorSubject, combineLatest, firstValueFrom } from 'rxjs';
import {
  combineLatestWith,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  startWith,
} from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { createExtenderComponent } from '@kompakkt/extender';
import { isDigitalEntity, isPhysicalEntity } from '../../../common';
import { getWikibaseItemID, IMediaAgent, IWikibaseItem } from '../../../common/wikibase.common';
import { AutocompleteOptionComponent } from '../../autocomplete/autocomplete-option.component';
import { ContentProviderService } from '../../content-provider.service';
import { getLabel, GetLabelPipe } from '../../get-label.pipe';
import {
  CreationTuple,
  DescriptionValueTuple,
  DigitalEntity,
  DimensionTuple,
  FileTuple,
  Institution,
  MediaAgent,
  mergeExistingEntityWikibaseExtension,
  Person,
  PhysicalEntity,
  PlaceTuple,
  Tag,
  TypeValueTuple,
  WikibaseItem,
} from '../metadata';

type AnyEntity = DigitalEntity | PhysicalEntity;

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['../../theme.scss', './entity.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatTabsModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatRadioModule,
    AutocompleteOptionComponent,
    MatInputModule,
    GetLabelPipe,
  ],
})
export class EntityComponent extends createExtenderComponent() {
  #content = inject(ContentProviderService);
  dialog = inject(MatDialog);

  // Just for the first steps ofimpelementing locales
  public locales = ['german', 'english'];

  entity$ = this.dataSubject.pipe(
    distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
    map(entity => {
      /*console.debug(
        'EntityComponent',
        JSON.stringify((entity as any)?.extensions?.wikibase ?? {}, null, 2),
      );*/
      return isDigitalEntity(entity)
        ? mergeExistingEntityWikibaseExtension(entity as DigitalEntity)
        : isPhysicalEntity(entity)
          ? mergeExistingEntityWikibaseExtension(entity as PhysicalEntity)
          : new DigitalEntity();
    }),
  );
  digitalEntity$ = this.entity$.pipe(filter(entity => isDigitalEntity(entity)));
  physicalEntity$ = this.entity$.pipe(filter(entity => isPhysicalEntity(entity)));

  public availableLicences = [
    {
      title: 'CC0',
      src: 'assets/licence/CC0.png',
      description: 'No Rights Reserved (CC0)',
      link: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
    {
      title: 'BY',
      src: 'assets/licence/BY.png',
      description: 'Attribution 4.0 International (CC BY 4.0)',
      link: 'https://creativecommons.org/licenses/by/4.0',
    },
    {
      title: 'BY-SA',
      src: 'assets/licence/BY-SA.png',
      description: 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
    {
      title: 'BY-ND',
      src: 'assets/licence/BY-ND.png',
      description: 'Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nd/4.0',
    },
    {
      title: 'BYNC',
      src: 'assets/licence/BYNC.png',
      description: 'Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc/4.0',
    },
    {
      title: 'BYNCSA',
      src: 'assets/licence/BYNCSA.png',
      description: 'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-sa/4.0',
    },
    {
      title: 'BYNCND',
      src: 'assets/licence/BYNCND.png',
      description: 'Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-nd/4.0',
    },
    //Copyrighted - All rights reserved
    {
      title: 'AR',
      src: 'assets/licence/AR.png',
      description: 'All rights reserved',
      link: 'https://en.wikipedia.org/wiki/All_rights_reserved',
    },
  ];

  // Public for validation
  public DigitalEntity = DigitalEntity;
  public PhysicalEntity = PhysicalEntity;
  public DimensionTuple = DimensionTuple;
  public PlaceTuple = PlaceTuple;
  public CreationTuple = CreationTuple;
  public TypeValueTuple = TypeValueTuple;
  public DescriptionValueTuple = DescriptionValueTuple;
  public WikibaseItem = WikibaseItem;
  public Person = Person;
  public Institution = Institution;
  public Tag = Tag;
  public FileTuple = FileTuple;

  // Search FormControls
  public searchPerson = new FormControl<string | WikibaseItem>('', { nonNullable: true });
  public searchTechnique = new FormControl<string | WikibaseItem>('', { nonNullable: true });
  public searchBibRef = new FormControl<string | WikibaseItem>('', { nonNullable: true });
  public searchPhyObjs = new FormControl<string | WikibaseItem>('', { nonNullable: true });
  public searchSoftware = new FormControl<string | WikibaseItem>('', { nonNullable: true });
  public searchTag = new FormControl<string | WikibaseItem>('', { nonNullable: true });

  // Autocomplete Inputs
  public availablePersons$ = this.#content.persons$.pipe(
    map(persons => persons.map(p => new MediaAgent(p))),
  );
  public availableTechniques$ = this.#content.techniques$.pipe(
    map(techniques => techniques.map(t => new WikibaseItem(t))),
  );
  public availableSoftware$ = this.#content.software$.pipe(
    map(software => software.map(s => new WikibaseItem(s))),
  );
  public availableTags$ = this.#content.tags$.pipe(map(tags => tags.map(t => new Tag(t))));
  public availableBibRefs$ = this.#content.bibrefs$.pipe(
    map(ref => ref.map(r => new WikibaseItem(r))),
  );
  public availablePhyObjs$ = this.#content.physicalobjects$.pipe(
    map(obj => obj.map(r => new WikibaseItem(r))),
  );
  public combinedWikibaseItems$ = combineLatest([
    this.availablePersons$,
    this.availableTechniques$,
    this.availableSoftware$,
    this.availableBibRefs$,
    this.availablePhyObjs$,
  ]).pipe(
    map(([persons, techniques, software, bibrefs, phyObjs]) => {
      return [...persons, ...techniques, ...software, ...bibrefs, ...phyObjs];
    }),
  );

  public filteredPersons$ = this.searchPerson.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
    distinctUntilChanged(),
    map(v => v?.toLowerCase()),
    combineLatestWith(this.availablePersons$),
    map(([value, persons]) => {
      if (!value) return persons;
      return persons.filter(p => (p.label['en'] + p.description).toLowerCase().includes(value));
    }),
  );
  public filteredTechniques$ = this.searchTechnique.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
    distinctUntilChanged(),
    map(v => v?.toLowerCase()),
    combineLatestWith(this.availableTechniques$),
    map(([value, techniques]) => {
      if (!value) return techniques;
      return techniques.filter(t => (t.label['en'] + t.description).toLowerCase().includes(value));
    }),
  );
  public filteredSoftware$ = this.searchSoftware.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
    distinctUntilChanged(),
    map(v => v?.toLowerCase()),
    combineLatestWith(this.availableSoftware$),
    map(([value, software]) => {
      if (!value) return software;
      return software.filter(s => s.label['en'].toLowerCase().includes(value));
    }),
  );
  public filteredBibRefs$ = this.searchBibRef.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
    distinctUntilChanged(),
    map(v => v?.toLowerCase()),
    combineLatestWith(this.availableBibRefs$),
    map(([value, bibrefs]) => {
      if (!value) return bibrefs;
      return bibrefs.filter(r => r.label['en'].toLowerCase().includes(value));
    }),
  );
  public filteredPhyObjs$ = this.searchPhyObjs.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
    distinctUntilChanged(),
    map(v => v?.toLowerCase()),
    combineLatestWith(this.availablePhyObjs$),
    map(([value, phyobjs]) => {
      if (!value) return phyobjs;
      return phyobjs.filter(o => o.label['en'].toLowerCase().includes(value));
    }),
  );
  public filteredTags$ = this.searchTag.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
    distinctUntilChanged(),
    map(v => v?.toLowerCase()),
    combineLatestWith(this.digitalEntity$, this.availableTags$),
    map(([value, digitalEntity, availableTags]) =>
      availableTags
        .filter(t => !digitalEntity.tags.find(tt => tt.value === t.value))
        .filter(t => t.value.toLowerCase().includes(value)),
    ),
  );
  public selectedPerson$ = new BehaviorSubject<MediaAgent | undefined>(undefined);
  public selectedTechnique$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedSoftware$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedBibRef$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedPhyObj$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);

  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public title = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.minLength(1), Validators.required],
  });
  public description = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.minLength(1), Validators.required],
  });
  public selectedRole: number | undefined = undefined;
  public customEquipment = new FormControl<string>('', {
    nonNullable: true,
  });
  public creationDate = new FormControl<string>('', {
    nonNullable: true,
    validators: [Validators.minLength(1), Validators.pattern(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)],
  });
  public externalLink = new FormControl<string>('', {
    nonNullable: true,
    validators: [
      control => {
        try {
          new URL(control.value);
          return null;
        } catch (_) {
          return { invalidUrl: true };
        }
      },
    ],
  });

  public metaDataIndex = 0;
  public errorOnFinish: any = undefined;

  public availableRolesKompakkt: {
    type: string;
    value: NonNullable<IMediaAgent['roleTitle']>;
    checked: FormControl<boolean>;
    is_required: boolean;
  }[] = [
    {
      type: 'RIGHTS_OWNER',
      value: 'Rightsowner',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      is_required: true,
    },
    {
      type: 'CREATOR',
      value: 'Creator',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      is_required: true,
    },
    {
      type: 'EDITOR',
      value: 'Editor',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      is_required: false,
    },
    {
      type: 'DATA_CREATOR',
      value: 'Data Creator',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      is_required: false,
    },
    {
      type: 'CONTACT_PERSON',
      value: 'Contact Person',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      is_required: false,
    },
  ];

  private emitEntitySubject = new BehaviorSubject<void>(undefined);
  private emitEntity() {
    this.emitEntitySubject.next();
  }

  constructor() {
    super();
    (window as any)['printSKEntity'] = () =>
      firstValueFrom(this.entity$).then(entity => console.log(entity));

    combineLatest([this.emitEntitySubject, this.entity$])
      .pipe(debounceTime(500))
      .subscribe(([_, entity]) => {
        /*console.debug(
          'emitEntity',
          JSON.stringify(entity),
          entity.isDigital,
          entity.isDigital
            ? DigitalEntity.checkIsValid(entity as DigitalEntity)
            : PhysicalEntity.checkIsValid(entity as PhysicalEntity),
        );*/
        const customEvent = new CustomEvent('entity-changed', {
          detail: {
            entity,
            isValid: entity.isDigital
              ? DigitalEntity.checkIsValid(entity as DigitalEntity)
              : PhysicalEntity.checkIsValid(entity as PhysicalEntity),
          },
        });
        this.event.emit(customEvent);
      });

    this.entity$.subscribe(entity => {
      console.log('firstValueFrom(entity$)', entity);
      let changed = false;
      if (entity.title && this.title.untouched) {
        console.log('Setting title value');
        this.title.setValue(entity.title);
        this.title.markAsTouched();
        changed = true;
      }
      if (entity.description && this.description.untouched) {
        console.log('Setting description value');
        this.description.setValue(entity.description);
        this.description.markAsTouched();
        changed = true;
      }
      if (isDigitalEntity(entity)) {
        if (entity.licence && !entity.extensions.wikibase.licence) {
          console.log('Setting K licence to SK');
          entity.extensions.wikibase.licence = entity.licence;
          changed = true;
        } else if (!entity.licence && entity.extensions.wikibase.licence) {
          console.log('Setting SK licence to K');
          entity.licence = entity.extensions.wikibase.licence;
          changed = true;
        }
      }

      if (changed) {
        console.log('Committing changes');
        this.emitEntity();
      }
    });

    this.title.valueChanges.pipe(combineLatestWith(this.entity$)).subscribe(([title, entity]) => {
      if (
        title === entity.title &&
        entity.extensions.wikibase.label &&
        entity.extensions.wikibase.label['en'] === title
      )
        return;
      entity.title = title;
      entity.extensions.wikibase.label ??= {};
      entity.extensions.wikibase.label['en'] = title;
      this.emitEntity();
    });

    this.description.valueChanges
      .pipe(combineLatestWith(this.entity$))
      .subscribe(([description, entity]) => {
        if (
          description === entity.description &&
          entity.extensions.wikibase.description &&
          entity.extensions.wikibase.description['en'] === description
        )
          return;
        entity.description = description;
        entity.extensions.wikibase.description ??= {};
        entity.extensions.wikibase.description['en'] = description;
        this.emitEntity();
      });
  }

  public async selectTag(event: MatAutocompleteSelectedEvent, digitalEntity: DigitalEntity) {
    const tagId = event.option.value;
    const tag = await firstValueFrom(this.availableTags$).then(tags =>
      tags.find(t => t._id === tagId),
    );
    if (!tag) return console.warn(`Could not tag with id ${tagId}`);
    digitalEntity.addTag(tag);

    this.emitEntity();
  }

  public displayPersonName(person: WikibaseItem): string {
    if (person === undefined || person.label === undefined) return '';
    return person.label['en'] || '';
  }

  public displayWikibaseItemLabel(item?: IWikibaseItem | string): string {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (item.label === undefined) return '';
    return item.id + ' ' + getLabel(item);
  }

  public async selectPerson(event: MatAutocompleteSelectedEvent) {
    const person = await firstValueFrom(this.availablePersons$).then(arr =>
      arr.find(p => p.id === event.option.value.id),
    );
    if (!person) return console.warn(`Could not find person`);
    this.selectedPerson$.next(person);
  }

  public async selectTechnique(option: MatOption<IWikibaseItem>) {
    const technique = await firstValueFrom(this.availableTechniques$).then(arr =>
      arr.find(t => t.id === option.value.id),
    );
    if (!technique) return console.warn(`Could not find technique with id ${option.value}`);
    this.selectedTechnique$.next(technique);
  }

  public async selectSoftware(option: MatOption<IWikibaseItem>) {
    const software = await firstValueFrom(this.availableSoftware$).then(arr =>
      arr.find(s => s.id === option.value.id),
    );
    if (!software) return console.warn(`Could not find software with id ${option.value}`);
    this.selectedSoftware$.next(software);
  }

  public async selectBibRef(event: MatAutocompleteSelectedEvent) {
    const ref = await firstValueFrom(this.availableBibRefs$).then(arr =>
      arr.find(r => r.id === event.option.value.id),
    );
    if (!ref)
      return console.warn(
        `Could not find bibliographic reference with id ${event.option.value.id}`,
      );
    this.selectedBibRef$.next(ref);
  }

  public async selectPhyObjs(event: MatAutocompleteSelectedEvent) {
    const obj = await firstValueFrom(this.availablePhyObjs$).then(arr =>
      arr.find(o => o.id === event.option.value.id),
    );
    if (!obj)
      return console.warn(`Could not find physical object with id ${event.option.value.id}`);
    this.selectedPhyObj$.next(obj);
  }
  // /Autocomplete methods

  public async addPerson() {
    const entity = await firstValueFrom(this.entity$);
    const person = this.selectedPerson$.getValue();
    const checkedRoles = this.availableRolesKompakkt.filter(role => role.checked.value);

    if (person === undefined) {
      return;
    }

    for (const role of checkedRoles) {
      const copy = { ...person };
      copy.roleTitle = role.value;
      // remove if already present in the list with this role
      await this.removePerson(copy);
      entity.extensions.wikibase?.agents?.push(copy);
    }

    this.searchPerson.setValue('', { emitEvent: false });
    this.selectedPerson$.next(undefined);
    this.selectedRole = undefined;

    //set availableRolesKompakkt to unchecked
    this.availableRolesKompakkt.forEach(role => role.checked.reset());

    this.emitEntity();
  }

  public async removePerson(person: IMediaAgent) {
    const entity = await firstValueFrom(this.entity$);
    const { id, roleTitle } = person;
    const idx = entity.extensions?.wikibase?.agents?.findIndex(
      p => p.id === id && p.roleTitle === roleTitle,
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.agents?.splice(idx, 1);
    }

    this.emitEntity();
  }

  canSaveCreationData$ = combineLatest([
    this.selectedTechnique$,
    this.selectedSoftware$,
    this.customEquipment.valueChanges,
    this.creationDate.valueChanges,
  ]).pipe(map(arr => arr.some(v => !!v)));
  disableSaveCreationData$ = this.canSaveCreationData$.pipe(map(v => !v));
  hasAnyCreationData$ = this.digitalEntity$.pipe(
    map(digitalEntity => {
      const { techniques, software, equipment, creationDate } = digitalEntity.extensions.wikibase;
      if (techniques && techniques.length > 0) return true;
      if (software && software.length > 0) return true;
      if (equipment && equipment.length > 0) return true;
      return creationDate !== undefined;
    }),
  );

  public async addCreationData() {
    const entity = await firstValueFrom(this.entity$);
    const technique = this.selectedTechnique$.getValue();
    const software = this.selectedSoftware$.getValue();
    const equipment = this.customEquipment.value.trim();
    const creationDate = this.creationDate.value;
    console.log('addCreationData', {
      technique,
      software,
      equipment,
      creationDate,
    });

    if (technique) {
      const idx = this.#findItemIndex(
        entity.extensions?.wikibase?.techniques,
        getWikibaseItemID(technique),
      );
      if (idx < 0) entity.extensions?.wikibase?.techniques?.push(technique);
      this.searchTechnique.reset();
      this.selectedTechnique$.next(undefined);
    }

    if (software) {
      const idx = this.#findItemIndex(
        entity.extensions?.wikibase?.software,
        getWikibaseItemID(software),
      );
      if (idx < 0) entity.extensions?.wikibase?.software?.push(software);
      this.searchSoftware.reset();
      this.selectedSoftware$.next(undefined);
    }

    if (equipment.length > 0) {
      const idx = this.#findItemIndex(
        entity.extensions?.wikibase?.equipment,
        getWikibaseItemID(equipment),
      );
      if (idx < 0) entity.extensions?.wikibase?.equipment?.push(equipment);
      this.customEquipment.reset();
    }

    if (this.creationDate.valid && creationDate.length > 0) {
      if (entity.extensions?.wikibase) {
        entity.extensions.wikibase!.creationDate = creationDate;
      }
      this.creationDate.reset();
    }

    this.emitEntity();
  }

  public async addExternalLink() {
    const entity = await firstValueFrom(this.entity$);
    await this.removeExternalLink(this.externalLink.value);
    entity.extensions?.wikibase?.externalLinks?.push(this.externalLink.value);
    console.log(entity);
    this.externalLink.reset();

    this.emitEntity();
  }

  public async addBibRef() {
    const entity = await firstValueFrom(this.entity$);
    const ref = this.selectedBibRef$.value;
    if (ref !== undefined) {
      // remove to prevent dupes
      await this.removeBibRef(ref);
      entity.extensions?.wikibase?.bibliographicRefs?.push(ref);
      this.searchBibRef.setValue('', { emitEvent: false });
      this.selectedBibRef$.next(undefined);
    }

    this.emitEntity();
  }

  public async addPhyObj() {
    const entity = await firstValueFrom(this.entity$);
    const obj = this.selectedPhyObj$.value;
    if (obj !== undefined) {
      // remove to prevent dupes
      await this.removePhyObj(obj);
      entity.extensions?.wikibase?.physicalObjs?.push(obj);
      this.searchPhyObjs.setValue('', { emitEvent: false });
      this.selectedPhyObj$.next(undefined);
    }

    this.emitEntity();
  }

  #findItemIndex(items: (string | IWikibaseItem)[] | undefined, value: string) {
    if (!items) return -1;
    return items.findIndex(item => {
      if (typeof item === 'string') {
        return item === value;
      } else {
        return item.id === value;
      }
    });
  }

  public async removeTechnique(technique: IWikibaseItem | string) {
    const entity = await firstValueFrom(this.entity$);
    const idx = this.#findItemIndex(
      entity.extensions?.wikibase?.techniques,
      getWikibaseItemID(technique),
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.techniques?.splice(idx, 1);
    }

    this.emitEntity();
  }

  public async removeSoftware(software: IWikibaseItem | string) {
    const entity = await firstValueFrom(this.entity$);
    const idx = this.#findItemIndex(
      entity.extensions?.wikibase?.software,
      getWikibaseItemID(software),
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.software?.splice(idx, 1);
    }

    this.emitEntity();
  }

  public async removeEquipment(equipment: IWikibaseItem | string) {
    const entity = await firstValueFrom(this.entity$);
    const idx = this.#findItemIndex(
      entity.extensions?.wikibase?.equipment,
      getWikibaseItemID(equipment),
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.equipment?.splice(idx, 1);
    }

    this.emitEntity();
  }

  public async removeCreationDate() {
    const entity = await firstValueFrom(this.entity$);
    if (entity.extensions?.wikibase) {
      entity.extensions.wikibase!.creationDate = undefined;
    }

    this.emitEntity();
  }

  public async removeExternalLink(link: IWikibaseItem | string) {
    const entity = await firstValueFrom(this.entity$);
    const idx = this.#findItemIndex(
      entity.extensions?.wikibase?.externalLinks,
      getWikibaseItemID(link),
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.externalLinks?.splice(idx, 1);
    }

    this.emitEntity();
  }

  public async removeBibRef(ref: IWikibaseItem | string) {
    const entity = await firstValueFrom(this.entity$);
    const idx = this.#findItemIndex(
      entity.extensions?.wikibase?.bibliographicRefs,
      getWikibaseItemID(ref),
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.bibliographicRefs?.splice(idx, 1);
    }

    this.emitEntity();
  }

  public async removePhyObj(obj: IWikibaseItem | string) {
    const entity = await firstValueFrom(this.entity$);
    const idx = this.#findItemIndex(
      entity.extensions?.wikibase?.physicalObjs,
      getWikibaseItemID(obj),
    );
    if (idx !== undefined && idx >= 0) {
      entity.extensions?.wikibase?.physicalObjs?.splice(idx, 1);
    }

    this.emitEntity();
  }

  public async selectLicence(change: MatRadioChange<string>) {
    const entity = await firstValueFrom(this.entity$);
    const licenceTitle = change.value;
    const licence = this.availableLicences.find(l => l.title === licenceTitle);
    if (!licence) return console.warn(`Could not find licence with title ${licenceTitle}`);
    if (isDigitalEntity(entity)) {
      entity.licence = licence.title;
    }
    entity.extensions.wikibase!.licence = licence.title;

    this.emitEntity();
  }

  public async handleFileInput(fileInput: HTMLInputElement) {
    const entity = await firstValueFrom(this.entity$);
    if (!fileInput.files) return alert('Failed getting files');
    const files: File[] = Array.from(fileInput.files);

    const readfile = (_fileToRead: File) =>
      new Promise<FileTuple | undefined>((resolve, _) => {
        const reader = new FileReader();
        reader.readAsText(_fileToRead);

        reader.onloadend = () => {
          const fileContent = reader.result as string | null;
          if (!fileContent) {
            console.error('Failed reading file content');
            return resolve(undefined);
          }

          const file_name = _fileToRead.name;
          const file_link = fileContent;
          const file_size = _fileToRead.size;
          const file_format = _fileToRead.name.includes('.')
            ? _fileToRead.name.slice(_fileToRead.name.indexOf('.'))
            : _fileToRead.name;

          const file = new FileTuple({
            file_name,
            file_link,
            file_size,
            file_format,
          });

          //console.log('Item content length:', fileContent.length);
          //console.log('File:', file);
          resolve(file);
        };
      });

    for (const file of files) {
      const metadataFile = await readfile(file);
      if (!metadataFile) continue;
      entity.metadata_files.push(metadataFile);
    }
  }

  // Validation

  public validationRelatedAgentsWB(): boolean {
    return false;
    /* let result = this.digitalEntity()?.checkValidRelatedAgents();
    if (typeof result === 'undefined') {
      return false;
    }

    return result; */
  }

  generalInformationValid$ = this.digitalEntity$.pipe(
    map(entity => entity.extensions.wikibase?.label?.['en'] !== '' && entity.description !== ''),
  );

  licenceValid$ = this.digitalEntity$.pipe(
    map(digitalEntity => DigitalEntity.checkValidLicence(digitalEntity)),
  );

  hasRightsOwner$ = this.digitalEntity$.pipe(
    map(digitalEntity => DigitalEntity.hasRightsOwner(digitalEntity)),
  );

  hasContactPerson$ = this.digitalEntity$.pipe(
    map(digitalEntity => DigitalEntity.hasContactPerson(digitalEntity)),
  );

  personsValid$ = this.entity$.pipe(
    map(
      entity =>
        undefined === entity.persons.find(p => !Person.checkIsValid(p, entity._id.toString())),
    ),
  );

  institutionsValid$ = this.entity$.pipe(
    map(
      entity =>
        undefined ===
        entity.institutions.find(i => !Institution.checkIsValid(i, entity._id.toString())),
    ),
  );

  dimensionsValid$ = this.digitalEntity$.pipe(
    map(entity => undefined === entity.dimensions.find(d => !DimensionTuple.checkIsValid(d))),
  );

  creationValid$ = this.digitalEntity$.pipe(
    map(entity => undefined === entity.creation.find(c => !CreationTuple.checkIsValid(c))),
  );

  externalIdValid$ = this.entity$.pipe(
    map(entity => undefined === entity.externalId.find(c => !TypeValueTuple.checkIsValid(c))),
  );

  externalLinkValid$ = this.entity$.pipe(
    map(
      entity => undefined === entity.externalLink.find(c => !DescriptionValueTuple.checkIsValid(c)),
    ),
  );

  biblioRefsValid$ = this.entity$.pipe(
    map(
      entity =>
        undefined === entity.biblioRefs.find(c => !DescriptionValueTuple.checkIsValid(c, false)),
    ),
  );

  otherValid$ = this.entity$.pipe(
    map(entity => undefined === entity.other.find(c => !DescriptionValueTuple.checkIsValid(c))),
  );

  metadataFilesValid$ = this.entity$.pipe(
    map(entity => undefined === entity.metadata_files.find(c => !FileTuple.checkIsValid(c))),
  );

  phyObjsValid$ = this.digitalEntity$.pipe(
    map(entity => undefined === entity.phyObjs.find(p => !PhysicalEntity.checkIsValid(p))),
  );

  // /Validation

  public addDiscipline(event: MatChipInputEvent, digitalEntity: DigitalEntity) {
    const discipline = event.value;
    digitalEntity.discipline.push(discipline);
    event.input.value = '';
  }

  public addTag(event: MatChipInputEvent, digitalEntity: DigitalEntity) {
    const tagText = event.value;
    const tag = new Tag();
    tag.value = tagText;
    digitalEntity.addTag(tag);
    this.searchTag.patchValue('');
    this.searchTag.setValue('');
    event.input.value = '';

    this.emitEntity();
  }

  public addSimpleProperty(event: MouseEvent, entity: AnyEntity, property: string) {
    event.preventDefault();
    event.stopPropagation();
    if (isDigitalEntity(entity)) {
      switch (property) {
        case 'dimensions':
          entity.dimensions.push(new DimensionTuple());
          break;
        case 'creation':
          entity.creation.push(new CreationTuple());
          break;
        case 'tags':
          entity.tags.push(new Tag());
          break;
        case 'phyObjs':
          entity.phyObjs.push(new PhysicalEntity());
          break;
      }
    }
    switch (property) {
      case 'institutions':
        entity.institutions.push(this.#content.addLocalInstitution(new Institution()));
        break;
      case 'externalId':
        entity.externalId.push(new TypeValueTuple());
        break;
      case 'externalLink':
        entity.externalLink.push(new DescriptionValueTuple());
        break;
      case 'biblioRefs':
        entity.biblioRefs.push(new DescriptionValueTuple());
        break;
      case 'other':
        entity.other.push(new DescriptionValueTuple());
        break;
      case 'metadata_files':
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.hidden = true;
        document.body.appendChild(input);
        input.onchange = () => this.handleFileInput(input).then(() => input.remove());
        input.click();
        break;
    }
    this.emitEntity();
  }

  public removeProperty(entity: AnyEntity, property: string, index: number) {
    if (Array.isArray((entity as any)[property])) {
      const removed = (entity as any)[property].splice(index, 1)[0];
      if (!removed) {
        return console.warn('No item removed');
      }
      // No reason to remove locally created persons and institutions
      /*if (isPerson(removed) || isInstitution(removed)) {
        if (property === 'persons' && removed) {
          this.#content.removeLocalPerson(removed as Person);
        } else if (property === 'institutions' && removed) {
          this.#content.removeLocalInstitution(removed as Institution);
        }
      }*/
      this.emitEntity();
    } else {
      console.warn(`Could not remove ${property} at ${index} from ${entity}`);
    }
  }
}
