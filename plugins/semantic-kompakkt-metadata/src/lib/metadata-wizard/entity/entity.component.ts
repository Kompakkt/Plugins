import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, computed, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioButton, MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { BehaviorSubject, combineLatest, firstValueFrom, interval } from 'rxjs';
import { combineLatestWith, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { createExtenderComponent } from '@kompakkt/extender';
import { isDigitalEntity, isPhysicalEntity } from '../../../common';
import { IMediaAgent, IWikibaseItem } from '../../../common/wikibase.common';
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
  standalone: true,
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
    MatLabel,
    MatError,
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
  entity = computed(() => {
    const slotData = this.slotData();
    console.log('EntityComponent', slotData, isDigitalEntity(slotData), isPhysicalEntity(slotData));
    const entity = isDigitalEntity(slotData)
      ? mergeExistingEntityWikibaseExtension(slotData as DigitalEntity)
      : isPhysicalEntity(slotData)
        ? mergeExistingEntityWikibaseExtension(slotData as PhysicalEntity)
        : new DigitalEntity();
    return entity;
    /*const proxy = new Proxy(entity, {
      set: (target, prop, value) => {
        return Reflect.set(target, prop, value);
      },
      get: (target, prop) => {
        this.event.emit(new CustomEvent('entity-changed', { detail: target }));
        return Reflect.get(target, prop);
      },
    });
    return proxy;*/
  });
  entity$ = toObservable(this.entity);
  digitalEntity$ = this.entity$.pipe(filter(entity => isDigitalEntity(entity)));
  physicalEntity$ = this.entity$.pipe(filter(entity => isPhysicalEntity(entity)));

  emitEntityInterval = interval(500).pipe(switchMap(() => this.entity$));

  public availableLicences = [
    {
      title: 'CC0',
      src: 'assets/licence/CC0.png',
      description: 'No Rights Reserved (CC0)',
      link: 'https://creativecommons.org/publicdomain/zero/1.0/',
      wikibase_item: 46,
    },
    {
      title: 'BY',
      src: 'assets/licence/BY.png',
      description: 'Attribution 4.0 International (CC BY 4.0)',
      link: 'https://creativecommons.org/licenses/by/4.0',
      wikibase_item: 47,
    },
    {
      title: 'BY-SA',
      src: 'assets/licence/BY-SA.png',
      description: 'Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-sa/4.0',
      wikibase_item: 48,
    },
    {
      title: 'BY-ND',
      src: 'assets/licence/BY-ND.png',
      description: 'Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nd/4.0',
      wikibase_item: 51,
    },
    {
      title: 'BYNC',
      src: 'assets/licence/BYNC.png',
      description: 'Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc/4.0',
      wikibase_item: 49,
    },
    {
      title: 'BYNCSA',
      src: 'assets/licence/BYNCSA.png',
      description: 'Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-sa/4.0',
      wikibase_item: 52,
    },
    {
      title: 'BYNCND',
      src: 'assets/licence/BYNCND.png',
      description: 'Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)',
      link: 'https://creativecommons.org/licenses/by-nc-nd/4.0',
      wikibase_item: 50,
    },
    //Copyrighted - All rights reserved
    {
      title: 'AR',
      src: 'assets/licence/AR.png',
      description: 'All rights reserved',
      link: 'https://en.wikipedia.org/wiki/All_rights_reserved',
      wikibase_item: 54,
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
  public searchPerson = new FormControl<string | WikibaseItem | null>('');
  public searchTechnique = new FormControl<string | WikibaseItem | null>('');
  public searchBibRef = new FormControl<string | WikibaseItem | null>('');
  public searchPhyObjs = new FormControl<string | WikibaseItem | null>('');
  public searchSoftware = new FormControl<string | WikibaseItem | null>('');
  public searchTag = new FormControl<string | WikibaseItem | null>('');

  // Autocomplete Inputs
  public availablePersons$ = this.#content.$Persons.pipe(
    map(persons => persons.map(p => new WikibaseItem(p))),
  );
  public availableTechniques$ = this.#content.$Techniques.pipe(
    map(techniques => techniques.map(t => new WikibaseItem(t))),
  );
  public availableSoftware$ = this.#content.$Software.pipe(
    map(software => software.map(s => new WikibaseItem(s))),
  );
  public availableTags$ = this.#content.$Tags.pipe(map(tags => tags.map(t => new Tag(t))));
  public availableRoles$ = this.#content.$Roles.pipe(
    map(roles => roles.map(r => new WikibaseItem(r))),
  );
  public availableBibRefs$ = this.#content.$BibRefs.pipe(
    map(ref => ref.map(r => new WikibaseItem(r))),
  );
  public availablePhyObjs$ = this.#content.$PhysicalObjects.pipe(
    map(obj => obj.map(r => new WikibaseItem(r))),
  );

  public filteredPersons$ = this.searchPerson.valueChanges.pipe(
    filter((v): v is string => typeof v === 'string' || v instanceof String),
    startWith(''),
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
    map(v => v?.toLowerCase()),
    combineLatestWith(this.digitalEntity$, this.availableTags$),
    map(([value, digitalEntity, availableTags]) =>
      availableTags
        .filter(t => !digitalEntity.tags.find(tt => tt.value === t.value))
        .filter(t => t.value.toLowerCase().includes(value)),
    ),
  );
  public selectedPerson$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
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
    validators: [Validators.pattern(/[0-9]{4}-[0-9]{2}-[0-9]{2}/)],
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

  public availableRolesKompakkt = [
    {
      type: 'RIGHTS_OWNER',
      value: 'Rightsowner',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      wb_value: 328,
      is_required: true,
    },
    {
      type: 'CREATOR',
      value: 'Creator',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      wb_value: 340,
      is_required: true,
    },
    {
      type: 'EDITOR',
      value: 'Editor',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      wb_value: 329,
      is_required: false,
    },
    {
      type: 'DATA_CREATOR',
      value: 'Data Creator',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      wb_value: 341,
      is_required: false,
    },
    {
      type: 'CONTACT_PERSON',
      value: 'Contact Person',
      checked: new FormControl<boolean>(false, { nonNullable: true }),
      wb_value: 342,
      is_required: false,
    },
  ];

  public override async getSlotOutput() {
    return this.entity();
  }

  constructor() {
    super();
    (window as any)['printEntity'] = () => console.log(this.entity());

    const subscription = this.emitEntityInterval.subscribe(entity => {
      try {
        const customEvent = new CustomEvent('entity-changed', {
          detail: {
            entity,
            isValid: entity.isDigital
              ? DigitalEntity.checkIsValid(entity as DigitalEntity)
              : PhysicalEntity.checkIsValid(entity as PhysicalEntity),
          },
        });
        this.event.emit(customEvent);
      } catch (error) {
        console.warn('Could not emit. Unsubscribing');
        subscription.unsubscribe();
      }
    });

    combineLatest({
      entity: this.entity$,
      title: this.title.valueChanges,
      description: this.description.valueChanges,
    }).subscribe(args => {
      if (!args.entity) return;
      console.log(args);
      args.entity.title = args.title;
      args.entity.description = args.description;
      args.entity.extensions.wikibase.description = { en: args.description };
      args.entity.extensions.wikibase.label = { en: args.title };
    });
  }

  public async selectTag(event: MatAutocompleteSelectedEvent, digitalEntity: DigitalEntity) {
    const tagId = event.option.value;
    const tag = await firstValueFrom(this.availableTags$).then(tags =>
      tags.find(t => t._id === tagId),
    );
    if (!tag) return console.warn(`Could not tag with id ${tagId}`);
    digitalEntity.addTag(tag);
  }

  public displayPersonName(person: WikibaseItem): string {
    if (person === undefined || person.label === undefined) return '';
    return person.label['en'] || '';
  }

  public displayWikibaseItemLabel(item: IWikibaseItem): string {
    if (item === undefined || item.label === undefined) return '';
    return getLabel(item);
  }

  public async selectPerson(event: MatAutocompleteSelectedEvent) {
    const person = await firstValueFrom(this.availablePersons$).then(arr =>
      arr.find(p => p.id === event.option.value.id),
    );
    if (!person) return console.warn(`Could not find person`);
    this.selectedPerson$.next(person);
  }

  public async selectTechnique(event: MatAutocompleteSelectedEvent) {
    const technique = await firstValueFrom(this.availableTechniques$).then(arr =>
      arr.find(t => t.id === event.option.value.id),
    );
    if (!technique)
      return console.warn(`Could not find technique with id ${event.option.value.id}`);
    this.selectedTechnique$.next(technique);
  }

  public async selectSoftware(event: MatAutocompleteSelectedEvent) {
    const software = await firstValueFrom(this.availableSoftware$).then(arr =>
      arr.find(s => s.id === event.option.value.id),
    );
    if (!software) return console.warn(`Could not find software with id ${event.option.value.id}`);
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

  public addPerson() {
    const person = this.selectedPerson$.value as MediaAgent;
    if (person === undefined) {
      return;
    }

    for (const role of this.availableRolesKompakkt.filter(role => role.checked.value)) {
      const copy = { ...person };
      copy.role = Number(role.wb_value);
      copy.roleTitle = role.value;
      // remove if already present in the list with this role
      this.removePerson(copy);
      this.entity().extensions.wikibase?.agents?.push(copy);
    }

    this.searchPerson.setValue('', { emitEvent: false });
    this.selectedPerson$.next(undefined);
    this.selectedRole = undefined;

    //set availableRolesKompakkt to unchecked
    this.availableRolesKompakkt.forEach(role => role.checked.reset());
  }

  public removePerson(person: IMediaAgent) {
    const { id, role } = person;
    const idx = this.entity().extensions?.wikibase?.agents?.findIndex(
      p => p.id === id && p.role === role,
    );
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.agents?.splice(idx, 1);
    }
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
      return [techniques, software, equipment, creationDate].some(v => v && v.length > 0);
    }),
  );

  public addCreationData() {
    const technique = this.selectedTechnique$.value;
    if (technique !== undefined) {
      // remove to prevent dupes
      this.removeTechnique(technique);
      this.entity().extensions?.wikibase?.techniques?.push(technique);
      this.searchTechnique.setValue('', { emitEvent: false });
      this.selectedTechnique$.next(undefined);
    }

    const software = this.selectedSoftware$.value;
    if (software !== undefined) {
      // remove to prevent dupes
      this.removeSoftware(software);
      this.entity().extensions?.wikibase?.software?.push(software);
      this.searchSoftware.setValue('', { emitEvent: false });
      this.selectedSoftware$.next(undefined);
    }

    const equip = this.customEquipment;
    if (equip.value.length > 0) {
      // remove to prevent dupes
      /* this.removeEquipment(equip);
      this.entity().extensions?.wikibase?.equipment?.push(equip); */
      this.customEquipment.reset();
    }

    if (this.creationDate.valid) {
      if (this.entity().extensions?.wikibase) {
        this.entity().extensions.wikibase!.creationDate = this.creationDate.value;
      }
      this.creationDate.reset();
    }
  }

  public addExternalLink() {
    this.removeExternalLink(this.externalLink.value);
    this.entity().extensions?.wikibase?.externalLinks?.push(this.externalLink.value);
    console.log(this.entity());
    this.externalLink.reset();
  }

  public addBibRef() {
    const ref = this.selectedBibRef$.value;
    if (ref !== undefined) {
      // remove to prevent dupes
      this.removeBibRef(ref);
      this.entity().extensions?.wikibase?.bibliographicRefs?.push(ref);
      this.searchBibRef.setValue('', { emitEvent: false });
      this.selectedBibRef$.next(undefined);
    }
  }

  public addPhyObj() {
    const obj = this.selectedPhyObj$.value;
    if (obj !== undefined) {
      // remove to prevent dupes
      this.removePhyObj(obj);
      this.entity().extensions?.wikibase?.physicalObjs?.push(obj);
      this.searchPhyObjs.setValue('', { emitEvent: false });
      this.selectedPhyObj$.next(undefined);
    }
  }

  public removeTechnique(technique: IWikibaseItem) {
    const idx = this.entity().extensions?.wikibase?.techniques?.findIndex(
      p => p.id === technique.id,
    );
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.techniques?.splice(idx, 1);
    }
  }

  public removeSoftware(software: IWikibaseItem) {
    const idx = this.entity().extensions?.wikibase?.software?.findIndex(p => p.id === software.id);
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.software?.splice(idx, 1);
    }
  }

  public removeEquipment(equipment: IWikibaseItem) {
    // TODO: this only works if equipment is not a string
    const idx = this.entity().extensions?.wikibase?.equipment?.findIndex(
      p => typeof p === 'object' && p.id === equipment.id,
    );
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.equipment?.splice(idx, 1);
    }
  }

  public removeCreationDate() {
    if (this.entity().extensions?.wikibase) {
      this.entity().extensions.wikibase!.creationDate = undefined;
    }
  }

  public removeExternalLink(link: string) {
    const idx = this.entity().extensions?.wikibase?.externalLinks?.findIndex(p => p === link);
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.externalLinks?.splice(idx, 1);
    }
  }

  public removeBibRef(ref: IWikibaseItem) {
    const idx = this.entity().extensions?.wikibase?.bibliographicRefs?.findIndex(
      r => r.id === ref.id,
    );
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.bibliographicRefs?.splice(idx, 1);
    }
  }

  public removePhyObj(obj: IWikibaseItem) {
    const idx = this.entity().extensions?.wikibase?.physicalObjs?.findIndex(o => o.id === obj.id);
    if (idx !== undefined && idx >= 0) {
      this.entity().extensions?.wikibase?.physicalObjs?.splice(idx, 1);
    }
  }

  public selectLicence(change: MatRadioChange) {
    const value = change.value;
    if (typeof value !== 'number') return;
    const licence = this.availableLicences.find(l => l.wikibase_item === value);
    if (!licence) return console.warn(`Could not find licence with id ${value}`);
    this.entity().extensions.wikibase!.licence = licence.wikibase_item;
  }

  public async handleFileInput(fileInput: HTMLInputElement) {
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
      this.entity().metadata_files.push(metadataFile);
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
  }

  public addSimpleProperty(event: MouseEvent, entity: AnyEntity, property: string) {
    event.preventDefault();
    event.stopPropagation();
    if (isDigitalEntity(entity)) {
      switch (property) {
        case 'dimensions':
          return entity.dimensions.push(new DimensionTuple());
        case 'creation':
          return entity.creation.push(new CreationTuple());
        case 'tags':
          return entity.tags.push(new Tag());
        case 'phyObjs':
          return entity.phyObjs.push(new PhysicalEntity());
      }
    }
    switch (property) {
      case 'institutions':
        return entity.institutions.push(this.#content.addLocalInstitution(new Institution()));
      case 'externalId':
        return entity.externalId.push(new TypeValueTuple());
      case 'externalLink':
        return entity.externalLink.push(new DescriptionValueTuple());
      case 'biblioRefs':
        return entity.biblioRefs.push(new DescriptionValueTuple());
      case 'other':
        return entity.other.push(new DescriptionValueTuple());
      case 'metadata_files':
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.hidden = true;
        document.body.appendChild(input);
        input.onchange = () => this.handleFileInput(input).then(() => input.remove());
        input.click();
        return;
    }
    return undefined;
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
    } else {
      console.warn(`Could not remove ${property} at ${index} from ${entity}`);
    }
  }
}
