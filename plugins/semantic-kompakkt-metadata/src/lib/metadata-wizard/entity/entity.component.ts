import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  effect
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioButton } from '@angular/material/radio';
import { MatTab, MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, startWith, withLatestFrom } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { createExtenderComponent } from '@kompakkt/extender';
import { IDigitalEntity, IMediaAgent, IWikibaseItem, isDigitalEntity } from '../../../common';
import { AutocompleteOptionComponent } from '../../autocomplete/autocomplete-option.component';
import { ContentProviderService } from '../../content-provider.service';
import {
  CreationTuple,
  DescriptionValueTuple,
  DigitalEntity,
  DimensionTuple,
  FileTuple,
  Institution,
  MediaAgent,
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
    MatAutocompleteModule,
    MatSidenavModule,
    MatTabsModule,
    MatFormField,
    MatListModule,
    MatLabel,
    MatError,
    MatIcon,
    MatRadioButton,
    AutocompleteOptionComponent,
    MatInputModule,
  ],
})
export class EntityComponent extends createExtenderComponent() {
  // Just for the first steps ofimpelementing locales
  public locales = ['german', 'english'];
  private entitySubject = new BehaviorSubject<IDigitalEntity | undefined>(undefined);

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

  // Autocomplete Inputs
  public availablePersons = new BehaviorSubject<WikibaseItem[]>([]);
  public availableTechniques = new BehaviorSubject<WikibaseItem[]>([]);
  public availableSoftware = new BehaviorSubject<WikibaseItem[]>([]);
  public availableTags = new BehaviorSubject<Tag[]>([]);
  public availableRoles = new BehaviorSubject<WikibaseItem[]>([]);
  public availableBibRefs = new BehaviorSubject<WikibaseItem[]>([]);
  public availablePhyObjs = new BehaviorSubject<WikibaseItem[]>([]);
  public searchPerson = new FormControl('');
  public searchTechnique = new FormControl('');
  public searchBibRef = new FormControl('');
  public searchPhyObjs = new FormControl('');
  public searchSoftware = new FormControl('');
  public searchTag = new FormControl('');
  public filteredPersons$: Observable<WikibaseItem[]>;
  public filteredTechniques$: Observable<WikibaseItem[]>;
  public filteredSoftware$: Observable<WikibaseItem[]>;
  public filteredBibRefs$: Observable<WikibaseItem[]>;
  public filteredPhyObjs$: Observable<WikibaseItem[]>;
  public selectedPerson$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedTechnique$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedSoftware$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedBibRef$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public selectedPhyObj$ = new BehaviorSubject<WikibaseItem | undefined>(undefined);
  public filteredTags$: Observable<Tag[]>;
  public separatorKeysCodes: number[] = [ENTER, COMMA];

  public selectedRole: number | undefined = undefined;
  public customEquipment: string = '';
  public creationDate: string = '';
  public externalLink: string = '';

  public metaDataIndex = 0;
  public errorOnFinish: any = undefined;

  public touchedElements = {
    title: false,
    description: false,
  };

  private anyRoleSelected = new BehaviorSubject(false);

  public availableRolesKompakkt = [
    {
      type: 'RIGHTS_OWNER',
      value: 'Rightsowner',
      checked: false,
      wb_value: 328,
      is_required: true,
    },
    { type: 'CREATOR', value: 'Creator', checked: false, wb_value: 340, is_required: true },
    { type: 'EDITOR', value: 'Editor', checked: false, wb_value: 329, is_required: false },
    {
      type: 'DATA_CREATOR',
      value: 'Data Creator',
      checked: false,
      wb_value: 341,
      is_required: false,
    },
    {
      type: 'CONTACT_PERSON',
      value: 'Contact Person',
      checked: false,
      wb_value: 342,
      is_required: false,
    },
  ];

  constructor(
    public content: ContentProviderService,
    public dialog: MatDialog,
  ) {
    super();
    (window as any)['printEntity'] = () => console.log(this.entitySubject.value);

    this.content.$Persons.subscribe(persons => {
      this.availablePersons.next(persons.map(p => new WikibaseItem(p)));
    });

    this.content.$Techniques.subscribe(techniques => {
      this.availableTechniques.next(techniques.map(t => new WikibaseItem(t)));
    });

    this.content.$Software.subscribe(software => {
      this.availableSoftware.next(software.map(s => new WikibaseItem(s)));
    });

    this.content.$Tags.subscribe(tags => {
      this.availableTags.next(tags.map(t => new Tag(t)));
    });

    this.content.$Roles.subscribe(roles => {
      this.availableRoles.next(roles.map(r => new WikibaseItem(r)));
    });

    this.content.$BibRefs.subscribe(ref => {
      this.availableBibRefs.next(ref.map(r => new WikibaseItem(r)));
    });

    this.content.$PhysicalObjects.subscribe(obj => {
      this.availablePhyObjs.next(obj.map(o => new WikibaseItem(o)));
    });

    this.filteredPersons$ = this.searchPerson.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (value) {
          return this.availablePersons.value.filter(p =>
            (p.label['en'] + p.description).toLowerCase().includes(value.toLowerCase()),
          );
        }
        return [];
      }),
    );
    this.filteredTechniques$ = this.searchTechnique.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (value) {
          return this.availableTechniques.value.filter(t =>
            (t.label['en'] + t.description).toLowerCase().includes(value.toLowerCase()),
          );
        }
        return [];
      }),
    );
    this.filteredBibRefs$ = this.searchBibRef.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (value) {
          return this.availableBibRefs.value.filter(r =>
            r.label['en'].toLowerCase().includes(value.toLowerCase()),
          );
        }
        return [];
      }),
    );
    this.filteredPhyObjs$ = this.searchPhyObjs.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (value) {
          return this.availablePhyObjs.value.filter(o =>
            o.label['en'].toLowerCase().includes(value.toLowerCase()),
          );
        }
        return [];
      }),
    );
    this.filteredSoftware$ = this.searchSoftware.valueChanges.pipe(
      startWith(''),
      map(value => {
        if (value) {
          return this.availableSoftware.value.filter(s =>
            s.label['en'].toLowerCase().includes(value.toLowerCase()),
          );
        }
        return [];
      }),
    );
    this.filteredTags$ = this.searchTag.valueChanges.pipe(
      startWith(''),
      map(value => (value as string).toLowerCase()),
      withLatestFrom(this.digitalEntity$),
      map(([value, digitalEntity]) =>
        this.availableTags.value
          .filter(t => !digitalEntity.tags.find(tt => tt.value === t.value))
          .filter(t => t.value.toLowerCase().includes(value)),
      ),
    );

    effect(() => {
      const slotData = this.slotData();
      console.log('EntityComponent', slotData, isDigitalEntity(slotData));
      this.entitySubject.next(isDigitalEntity(slotData) ? slotData : new DigitalEntity());
    });
  }

  get roles$() {
    return this.availableRoles.asObservable();
  }

  public setTouched(element: keyof typeof this.touchedElements) {
    this.touchedElements[element] = true;
  }

  public async selectTag(event: MatAutocompleteSelectedEvent, digitalEntity: DigitalEntity) {
    const tagId = event.option.value;
    const tag = this.availableTags.value.find(t => t._id === tagId);
    if (!tag) return console.warn(`Could not tag with id ${tagId}`);
    digitalEntity.addTag(tag);
  }

  public displayPersonName(person: WikibaseItem): string {
    if (person === undefined || person.label === undefined) return '';
    return person.label['en'] || '';
  }

  public displayWikibaseItemLabel(item: IWikibaseItem): string {
    if (item === undefined || item.label === undefined) return '';
    return item.label['en'] || '';
  }

  public selectPerson(event: MatAutocompleteSelectedEvent) {
    const person = this.availablePersons.value.find(p => p.id === event.option.value.id);
    if (!person) return console.warn(`Could not find person`);
    this.selectedPerson$.next(person);
  }

  public selectTechnique(event: MatAutocompleteSelectedEvent) {
    const technique = this.availableTechniques.value.find(t => t.id === event.option.value.id);
    if (!technique)
      return console.warn(`Could not find technique with id ${event.option.value.id}`);
    this.selectedTechnique$.next(technique);
  }

  public selectSoftware(event: MatAutocompleteSelectedEvent) {
    const software = this.availableSoftware.value.find(s => s.id === event.option.value.id);
    if (!software) return console.warn(`Could not find software with id ${event.option.value.id}`);
    this.selectedSoftware$.next(software);
  }

  public selectBibRef(event: MatAutocompleteSelectedEvent) {
    const ref = this.availableBibRefs.value.find(r => r.id === event.option.value.id);
    if (!ref)
      return console.warn(
        `Could not find bibliographic reference with id ${event.option.value.id}`,
      );
    this.selectedBibRef$.next(ref);
  }

  public selectPhyObjs(event: MatAutocompleteSelectedEvent) {
    const obj = this.availablePhyObjs.value.find(o => o.id === event.option.value.id);
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

    for (const role of this.availableRolesKompakkt.filter(role => role.checked)) {
      const copy = { ...person };
      copy.role = Number(role.wb_value);
      copy.roleTitle = role.value;
      // remove if already present in the list with this role
      this.removePerson(copy);
      if (this.entitySubject.value !== undefined) {
        (this.entitySubject.value as IDigitalEntity).agents.push(copy);
      }
    }

    this.searchPerson.setValue('', { emitEvent: false });
    this.selectedPerson$.next(undefined);
    this.selectedRole = undefined;

    //set availableRolesKompakkt to unchecked
    this.availableRolesKompakkt.forEach(role => (role.checked = false));
  }

  public removePerson(person: IMediaAgent) {
    const { id, role } = person;
    const idx = this.entitySubject.value?.agents.findIndex(p => p.id === id && p.role === role);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.agents.splice(idx, 1);
    }
  }

  public validCreationDate() {
    const exp = /\d\d\d\d-\d\d-\d\d/;
    return this.creationDate.match(exp);
  }

  public validExternalLink() {
    const exp = /^([-+.a-z\d]+):/i;
    const res = this.externalLink.match(exp);
    //res is a RegExpMatchArray or null
    return res !== null;
  }

  public addCreationData() {
    const technique = this.selectedTechnique$.value;
    if (technique !== undefined) {
      // remove to prevent dupes
      this.removeTechnique(technique);
      (this.entitySubject.value as IDigitalEntity).techniques.push(technique);
      this.searchTechnique.setValue('', { emitEvent: false });
      this.selectedTechnique$.next(undefined);
    }

    const software = this.selectedSoftware$.value;
    if (software !== undefined) {
      // remove to prevent dupes
      this.removeSoftware(software);
      (this.entitySubject.value as IDigitalEntity).software.push(software);
      this.searchSoftware.setValue('', { emitEvent: false });
      this.selectedSoftware$.next(undefined);
    }

    const equip = this.customEquipment;
    if (equip.length > 0) {
      // remove to prevent dupes
      this.removeEquipment(equip);
      this.entitySubject.value?.equipment.push(equip);
      this.customEquipment = '';
    }

    if (this.validCreationDate()) {
      if (this.entitySubject.value !== undefined) {
        this.entitySubject.value.creationDate = this.creationDate;
      }
      this.creationDate = '';
    }
  }

  public addExternalLink() {
    this.removeExternalLink(this.externalLink);
    if (this.entitySubject.value !== undefined) {
      this.entitySubject.value.externalLinks.push(this.externalLink);
    }
    console.log(this.entitySubject.value);
    this.externalLink = '';
  }

  public addBibRef() {
    const ref = this.selectedBibRef$.value;
    if (ref !== undefined) {
      // remove to prevent dupes
      this.removeBibRef(ref);
      this.entitySubject.value?.bibliographicRefs.push(ref);
      this.searchBibRef.setValue('', { emitEvent: false });
      this.selectedBibRef$.next(undefined);
    }
  }

  public addPhyObj() {
    const obj = this.selectedPhyObj$.value;
    if (obj !== undefined) {
      // remove to prevent dupes
      this.removePhyObj(obj);
      this.entitySubject.value?.physicalObjs.push(obj);
      this.searchPhyObjs.setValue('', { emitEvent: false });
      this.selectedPhyObj$.next(undefined);
    }
  }

  public removeTechnique(technique: IWikibaseItem) {
    const idx = this.entitySubject.value?.techniques.findIndex(p => p.id === technique.id);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.techniques.splice(idx, 1);
    }
  }

  public removeSoftware(software: IWikibaseItem) {
    const idx = this.entitySubject.value?.software.findIndex(p => p.id === software.id);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.software.splice(idx, 1);
    }
  }

  public removeEquipment(equipment: string) {
    const idx = this.entitySubject.value?.equipment.findIndex(p => p === equipment);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.equipment.splice(idx, 1);
    }
  }

  public removeCreationDate() {
    if (this.entitySubject.value !== undefined) {
      this.entitySubject.value.creationDate = undefined;
    }
  }

  public removeExternalLink(link: string) {
    const idx = this.entitySubject.value?.externalLinks.findIndex(p => p === link);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.externalLinks.splice(idx, 1);
    }
  }

  public removeBibRef(ref: IWikibaseItem) {
    const idx = this.entitySubject.value?.bibliographicRefs.findIndex(r => r.id === ref.id);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.bibliographicRefs.splice(idx, 1);
    }
  }

  public removePhyObj(obj: IWikibaseItem) {
    const idx = this.entitySubject.value?.physicalObjs.findIndex(o => o.id === obj.id);
    if (idx !== undefined && idx >= 0) {
      this.entitySubject.value?.physicalObjs.splice(idx, 1);
    }
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
      this.entitySubject.value?.metadata_files.push(metadataFile);
    }
  }

  // Entity access
  get entity$() {
    return this.entitySubject.pipe(
      filter(entity => !!entity),
      map(entity => entity as AnyEntity),
    );
  }

  get _id$() {
    return this.entity$.pipe(map(entity => entity._id.toString()));
  }

  get digitalEntity$() {
    return this.entitySubject.pipe(
      filter(entity => isDigitalEntity(entity)),
      map(entity => entity as DigitalEntity),
    );
  }
  // /Entity access

  // Validation

  public validationRelatedAgentsWB(): boolean {
    return false;
    /* let result = this.digitalEntity()?.checkValidRelatedAgents();
    if (typeof result === 'undefined') {
      return false;
    }

    return result; */
  }

  get generalInformationValid$() {
    return this.digitalEntity$.pipe(
      map(entity => entity.label['en'] !== '' && entity.description !== ''),
    );
  }

  get licenceValid$() {
    return this.digitalEntity$.pipe(map(digitalEntity => digitalEntity.licence));
  }

  get hasRightsOwner$() {
    return this.digitalEntity$.pipe(
      map(digitalEntity => DigitalEntity.hasRightsOwner(digitalEntity)),
    );
  }

  get hasContactPerson$() {
    return this.digitalEntity$.pipe(
      map(digitalEntity => DigitalEntity.hasContactPerson(digitalEntity)),
    );
  }

  get personsValid$() {
    return this.entity$.pipe(
      map(
        entity =>
          undefined === entity.persons.find(p => !Person.checkIsValid(p, entity._id.toString())),
      ),
    );
  }

  get institutionsValid$() {
    return this.entity$.pipe(
      map(
        entity =>
          undefined ===
          entity.institutions.find(i => !Institution.checkIsValid(i, entity._id.toString())),
      ),
    );
  }

  get dimensionsValid$() {
    return this.digitalEntity$.pipe(
      map(entity => undefined === entity.dimensions.find(d => !DimensionTuple.checkIsValid(d))),
    );
  }

  get creationValid$() {
    return this.digitalEntity$.pipe(
      map(entity => undefined === entity.creation.find(c => !CreationTuple.checkIsValid(c))),
    );
  }

  get externalIdValid$() {
    return this.entity$.pipe(
      map(entity => undefined === entity.externalId.find(c => !TypeValueTuple.checkIsValid(c))),
    );
  }

  get externalLinkValid$() {
    return this.entity$.pipe(
      map(
        entity =>
          undefined === entity.externalLink.find(c => !DescriptionValueTuple.checkIsValid(c)),
      ),
    );
  }

  get biblioRefsValid$() {
    return this.entity$.pipe(
      map(
        entity =>
          undefined === entity.biblioRefs.find(c => !DescriptionValueTuple.checkIsValid(c, false)),
      ),
    );
  }

  get otherValid$() {
    return this.entity$.pipe(
      map(entity => undefined === entity.other.find(c => !DescriptionValueTuple.checkIsValid(c))),
    );
  }

  get metadataFilesValid$() {
    return this.entity$.pipe(
      map(entity => undefined === entity.metadata_files.find(c => !FileTuple.checkIsValid(c))),
    );
  }

  get phyObjsValid$() {
    return this.digitalEntity$.pipe(
      map(entity => undefined === entity.phyObjs.find(p => !PhysicalEntity.checkIsValid(p))),
    );
  }
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
        return entity.institutions.push(this.content.addLocalInstitution(new Institution()));
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
          this.content.removeLocalPerson(removed as Person);
        } else if (property === 'institutions' && removed) {
          this.content.removeLocalInstitution(removed as Institution);
        }
      }*/
    } else {
      console.warn(`Could not remove ${property} at ${index} from ${entity}`);
    }
  }
}
