import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  model,
  effect,
  computed,
} from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { createExtenderComponent } from '@kompakkt/plugins/extender';
import { isDigitalEntity } from '@kompakkt/common';
import { getWikibaseItemID, IMediaAgent, IWikibaseItem } from '../../../common/wikibase.common';
import { AutocompleteOptionComponent } from '../../autocomplete/autocomplete-option.component';
import { ContentProviderService } from '../../content-provider.service';
import { getLabel, GetLabelPipe } from '../../get-label.pipe';
import { emptyDigitalEntity, mergeExistingEntityWikibaseExtension } from '../metadata';
import {
  form,
  FormField,
  maxLength,
  minLength,
  required,
  validate,
  validateTree,
  ValidationError,
} from '@angular/forms/signals';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';

const filterWikibaseItem = (query: string) => (item: IWikibaseItem) =>
  (Object.values(item.label).join('') + (item.description ?? '')).toLowerCase().includes(query);

const ROLES = [
  {
    type: 'RIGHTS_OWNER',
    value: 'Rightsowner',
    is_required: true,
  },
  {
    type: 'CREATOR',
    value: 'Creator',
    is_required: true,
  },
  {
    type: 'EDITOR',
    value: 'Editor',
    is_required: false,
  },
  {
    type: 'DATA_CREATOR',
    value: 'Data Creator',
    is_required: false,
  },
  {
    type: 'CONTACT_PERSON',
    value: 'Contact Person',
    is_required: false,
  },
] as const;

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['../../theme.scss', './entity.component.scss'],
  imports: [
    CommonModule,
    FormField,
    MatButtonModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatTabsModule,
    MatFormFieldModule,
    MatListModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule,
    AutocompleteOptionComponent,
    MatInputModule,
    GetLabelPipe,
  ],
  providers: [provideNativeDateAdapter()],
})
export class EntityComponent extends createExtenderComponent() implements OnInit, OnDestroy {
  #content = inject(ContentProviderService);
  dialog = inject(MatDialog);

  entityModel = model(emptyDigitalEntity());
  entityForm = form(this.entityModel, path => {
    validateTree(path.extensions, ctx => {
      const wikibase = ctx.value().wikibase;
      if (!wikibase)
        return {
          kind: 'required',
          message: 'Wikibase extension data is required',
        };
      const errors = new Array<ValidationError>();

      if (!wikibase.label?.['en'])
        errors.push({
          kind: 'General Information',
          message: 'Title is required',
        });

      if (!wikibase.description?.['en'])
        errors.push({
          kind: 'General Information',
          message: 'Description is required',
        });

      if (wikibase.description?.['en'] === wikibase.label?.['en'])
        errors.push({
          kind: 'General Information',
          message: 'Title and description cannot be the same',
        });

      if (!wikibase.agents?.some(a => a.roleTitle === 'Rightsowner'))
        errors.push({
          kind: 'Related Agents',
          message: 'Rightsowner is required',
        });

      if (!wikibase.agents?.some(a => a.roleTitle === 'Creator'))
        errors.push({
          kind: 'Related Agents',
          message: 'Creator is required',
        });

      console.log('Validation', wikibase);
      if (!wikibase.licence?.trim().length)
        errors.push({
          kind: 'License',
          message: 'License is required',
        });

      return errors;
    });
  });
  generalValid = computed(
    () =>
      !this.entityForm()
        .errorSummary()
        .some(e => e.kind === 'General Information'),
  );
  agentsValid = computed(
    () =>
      !this.entityForm()
        .errorSummary()
        .some(e => e.kind === 'Related Agents'),
  );
  licenceValid = computed(
    () =>
      !this.entityForm()
        .errorSummary()
        .some(e => e.kind === 'License'),
  );

  #subscription?: Subscription;
  ngOnInit(): void {
    this.#subscription = this.dataSubject
      .pipe(
        // TODO: Use fast-is-equal library or similar?
        distinctUntilChanged((prev, next) => JSON.stringify(prev) === JSON.stringify(next)),
      )
      .subscribe(entity => {
        if (!isDigitalEntity(entity)) {
          return console.warn('Entity does not suffice as Digital Entity', entity);
        }
        const merged = mergeExistingEntityWikibaseExtension(entity);
        console.info('Entity after merging', merged);

        if (merged.extensions.wikibase) {
          if (merged.licence && !merged.extensions.wikibase.licence) {
            console.log('Setting K licence to SK');
            merged.extensions.wikibase.licence = merged.licence;
          } else if (!merged.licence && merged.extensions.wikibase.licence) {
            console.log('Setting SK licence to K');
            merged.licence = merged.extensions.wikibase.licence;
          }
        }

        this.entityModel.set({ ...emptyDigitalEntity(), ...merged });
      });
  }
  ngOnDestroy(): void {
    this.#subscription?.unsubscribe();
  }

  availableLicences = [
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
    {
      title: 'AR',
      src: 'assets/licence/AR.png',
      description: 'All rights reserved',
      link: 'https://en.wikipedia.org/wiki/All_rights_reserved',
    },
  ];

  searchModel = model({
    agent: '',
    technique: '',
    bibref: '',
    phyObj: '',
    software: '',
  });
  searchForm = form(this.searchModel);

  filteredAgents = computed(() => {
    const search = (this.searchForm.agent().value() ?? '').trim().toLowerCase();
    const content = this.#content.agents();
    return content.filter(filterWikibaseItem(search));
  });
  filteredTechniques = computed(() => {
    const search = (this.searchForm.technique().value() ?? '').trim().toLowerCase();
    const content = this.#content.techniques();
    return content.filter(filterWikibaseItem(search));
  });
  filteredSoftware = computed(() => {
    const search = (this.searchForm.software().value() ?? '').trim().toLowerCase();
    const content = this.#content.software();
    return content.filter(filterWikibaseItem(search));
  });
  filteredBibRefs = computed(() => {
    const search = (this.searchForm.bibref().value() ?? '').trim().toLowerCase();
    const content = this.#content.bibrefs();
    return content.filter(filterWikibaseItem(search));
  });
  filteredPhyObjs = computed(() => {
    const search = (this.searchForm.phyObj().value() ?? '').trim().toLowerCase();
    const content = this.#content.physicalobjects();
    return content.filter(filterWikibaseItem(search));
  });

  selectedAgent = signal<IMediaAgent | undefined>(undefined);
  selectedTechnique = signal<IWikibaseItem | undefined>(undefined);
  selectedSoftware = signal<IWikibaseItem | undefined>(undefined);
  selectedBibRef = signal<IWikibaseItem | undefined>(undefined);
  selectedPhyObj = signal<IWikibaseItem | undefined>(undefined);

  separatorKeysCodes: number[] = [ENTER, COMMA];

  dataModel = model({ title: '', description: '', equipment: '', creationDate: '', link: '' });
  dataForm = form(this.dataModel, path => {
    required(path.title);
    minLength(path.title, 1);
    required(path.description);
    minLength(path.description, 1);
    maxLength(path.description, 255);
    validate(path.link, ctx => {
      try {
        new URL(ctx.value());
        return null;
      } catch (_) {
        return { kind: 'invalidUrl', message: `Not a valid URL: ${ctx.value()}` };
      }
    });
  });

  canSaveCreationData = computed(() => {
    const { creationDate, equipment } = this.dataForm().value();
    const technique = this.selectedTechnique();
    const software = this.selectedSoftware();
    return technique || software || creationDate.length > 0 || equipment.length > 0;
  });

  tabIndex = signal(0);

  availableRolesModel = model(ROLES.map(role => ({ ...role, checked: false })));
  availableRolesForm = form(this.availableRolesModel);

  constructor() {
    super();
    (window as any)['printSKEntity'] = () =>
      console.log({
        entity: this.entityForm().value(),
        errors: this.entityForm().errorSummary(),
      });

    effect(() => {
      const title = this.dataForm.title().value();
      const description = this.dataForm.description().value();
      this.entityForm().value.update(entity => {
        const clone = structuredClone(entity);
        if (clone.extensions.wikibase) {
          clone.extensions.wikibase.label ??= {};
          clone.extensions.wikibase.label['en'] = title;
          clone.extensions.wikibase.description ??= {};
          clone.extensions.wikibase.description['en'] = description;
        }
        clone.title = title;
        clone.description = description;
        return clone;
      });
    });

    effect(() => {
      const entity = this.entityForm().value();
      const isValid = this.entityForm().valid();
      const validationErrors = this.entityForm().errorSummary();
      const customEvent = new CustomEvent('entity-changed', {
        detail: { entity, isValid, validationErrors },
      });
      this.event.emit(customEvent);
    });
  }

  selectAgent(option: MatOption<IMediaAgent>) {
    this.selectedAgent.set(option.value);
  }
  selectTechnique(option: MatOption<IWikibaseItem>) {
    this.selectedTechnique.set(option.value);
  }
  selectSoftware(option: MatOption<IWikibaseItem>) {
    this.selectedSoftware.set(option.value);
  }
  selectBibRef(option: MatOption<IWikibaseItem>) {
    this.selectedBibRef.set(option.value);
  }
  selectPhyObj(option: MatOption<IWikibaseItem>) {
    this.selectedPhyObj.set(option.value);
  }

  isUpdatingContent = signal(false);
  async updateContent() {
    this.isUpdatingContent.set(true);
    await this.#content.updateMetadataChoices().catch(err => {
      console.warn('Failed updating content', err);
    });
    this.isUpdatingContent.set(false);
  }

  displayPersonName(person: IWikibaseItem): string {
    if (person === undefined || person.label === undefined) return '';
    return person.label['en'] || '';
  }

  displayWikibaseItemLabel(item?: IWikibaseItem | string): string {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (item.label === undefined) return '';
    return item.id + ' ' + getLabel(item);
  }

  addAgent() {
    const agent = this.selectedAgent();
    if (!agent) return;
    const checkedRoles = this.availableRolesForm()
      .value()
      .filter(role => role.checked);

    const copies = checkedRoles.map(role => {
      const clone = structuredClone(agent);
      clone.roleTitle = role.value;
      return clone;
    });
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.agents ??= [];
        clone.extensions.wikibase.agents = clone.extensions.wikibase.agents.filter(
          a => !copies.some(c => a.id === c.id && a.roleTitle === c.roleTitle),
        );
        clone.extensions.wikibase?.agents?.push(...copies);
      }
      return clone;
    });

    this.searchForm().value.update(data => ({ ...data, agent: '' }));
    this.selectedAgent.set(undefined);
    this.availableRolesForm().value.update(arr =>
      [...arr].map(role => ({ ...role, checked: false })),
    );
  }

  toggleRole(value: string, state: boolean) {
    this.availableRolesForm().value.update(roles =>
      [...roles].map(r => ({ ...r, checked: r.type === value ? state : r.checked })),
    );
  }

  removePerson({ id, roleTitle }: IMediaAgent) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.agents ??= [];
        clone.extensions.wikibase.agents = clone.extensions.wikibase.agents.filter(
          a => !(a.id === id && a.roleTitle === roleTitle),
        );
      }
      return clone;
    });
  }

  addCreationData() {
    const technique = this.selectedTechnique();
    const software = this.selectedSoftware();
    const equipment = this.dataForm.equipment().value().trim();
    const creationDate = this.dataForm.creationDate().value();
    console.log('addCreationData', {
      technique,
      software,
      equipment,
      creationDate,
    });

    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        if (technique) {
          const index = this.#findItemIndex(
            clone.extensions?.wikibase?.techniques,
            getWikibaseItemID(technique),
          );
          if (index < 0) clone.extensions?.wikibase?.techniques?.push(technique);
          this.searchForm().value.update(data => ({ ...data, technique: '' }));
          this.selectedTechnique.set(undefined);
        }

        if (software) {
          const index = this.#findItemIndex(
            clone.extensions?.wikibase?.software,
            getWikibaseItemID(software),
          );
          if (index < 0) clone.extensions?.wikibase?.software?.push(software);
          this.searchForm().value.update(data => ({ ...data, software: '' }));
          this.selectedSoftware.set(undefined);
        }

        if (equipment.length > 0) {
          const index = this.#findItemIndex(
            clone.extensions?.wikibase?.equipment,
            getWikibaseItemID(equipment),
          );
          if (index < 0) clone.extensions?.wikibase?.equipment?.push(equipment);
          this.dataForm().value.update(data => ({ ...data, equipment: '' }));
        }

        if (creationDate.length > 0) {
          clone.extensions.wikibase.creationDate = creationDate;
          this.dataForm().value.update(data => ({ ...data, creationDate: '' }));
        }
      }

      return clone;
    });
  }

  addExternalLink() {
    const link = this.dataForm.link().value();
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.externalLinks ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.externalLinks,
          getWikibaseItemID(link),
        );
        if (index >= 0) clone.extensions.wikibase.externalLinks.splice(index, 1);
        clone.extensions.wikibase.externalLinks.push(link);
      }
      return clone;
    });
    this.dataForm().value.update(data => ({ ...data, link: '' }));
  }

  addBibRef() {
    const ref = this.selectedBibRef();
    if (!ref) return;
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.bibliographicRefs ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.bibliographicRefs,
          getWikibaseItemID(ref),
        );
        if (index >= 0) clone.extensions.wikibase.bibliographicRefs.splice(index, 1);
        clone.extensions.wikibase.bibliographicRefs?.push(ref);
      }
      return clone;
    });
    this.searchForm().value.update(data => ({ ...data, bibref: '' }));
    this.selectedBibRef.set(undefined);
  }

  addPhyObj() {
    const ref = this.selectedPhyObj();
    if (!ref) return;
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.physicalObjs ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.physicalObjs,
          getWikibaseItemID(ref),
        );
        if (index >= 0) clone.extensions.wikibase.physicalObjs.splice(index, 1);
        clone.extensions.wikibase.physicalObjs?.push(ref);
      }
      return clone;
    });
    this.searchForm().value.update(data => ({ ...data, phyObj: '' }));
    this.selectedPhyObj.set(undefined);
  }

  #findItemIndex(items: (string | IWikibaseItem)[] | undefined, value: string): number {
    if (!items) return -1;
    return items.findIndex(item => {
      if (typeof item === 'string') {
        return item === value;
      } else {
        return item.id === value;
      }
    });
  }

  removeTechnique(technique: IWikibaseItem | string) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.techniques ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.techniques,
          getWikibaseItemID(technique),
        );
        if (index >= 0) clone.extensions.wikibase.techniques.splice(index, 1);
      }
      return clone;
    });
  }

  removeSoftware(software: IWikibaseItem | string) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.software ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.software,
          getWikibaseItemID(software),
        );
        if (index >= 0) clone.extensions.wikibase.software.splice(index, 1);
      }
      return clone;
    });
  }

  removeEquipment(equipment: IWikibaseItem | string) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.equipment ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.equipment,
          getWikibaseItemID(equipment),
        );
        if (index >= 0) clone.extensions.wikibase.equipment.splice(index, 1);
      }
      return clone;
    });
  }

  removeCreationDate() {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.creationDate = undefined;
      }
      return clone;
    });
  }

  removeExternalLink(link: IWikibaseItem | string) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.externalLinks ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.externalLinks,
          getWikibaseItemID(link),
        );
        if (index >= 0) clone.extensions.wikibase.externalLinks.splice(index, 1);
      }
      return clone;
    });
  }

  removeBibRef(ref: IWikibaseItem | string) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.bibliographicRefs ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.bibliographicRefs,
          getWikibaseItemID(ref),
        );
        if (index >= 0) clone.extensions.wikibase.bibliographicRefs.splice(index, 1);
      }
      return clone;
    });
  }

  removePhyObj(obj: IWikibaseItem | string) {
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase.physicalObjs ??= [];
        const index = this.#findItemIndex(
          clone.extensions?.wikibase?.physicalObjs,
          getWikibaseItemID(obj),
        );
        if (index >= 0) clone.extensions.wikibase.physicalObjs.splice(index, 1);
      }
      return clone;
    });
  }

  selectLicence(change: MatRadioChange<string>) {
    const licenceTitle = change.value;
    const licence = this.availableLicences.find(l => l.title === licenceTitle);
    if (!licence) return console.warn(`Could not find licence with title ${licenceTitle}`);
    this.entityForm().value.update(entity => {
      const clone = structuredClone(entity);
      if (clone.extensions.wikibase) {
        clone.extensions.wikibase!.licence = licence.title;
      }
      clone.licence = licence.title;
      return clone;
    });
  }
}
