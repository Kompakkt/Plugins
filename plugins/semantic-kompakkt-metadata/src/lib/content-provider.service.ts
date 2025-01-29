import { inject, Injectable } from '@angular/core';

import { EXTENDED_BACKEND_SERVICE } from '@kompakkt/extender';
import { Institution, MediaAgent, Tag, WikibaseItem } from './metadata-wizard/metadata';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, ITag } from '../common';
import { IMetadataChoices } from '../common/wikibase.common';

type InstanceInfo = {
  instance: string;
};

@Injectable({
  providedIn: 'root',
})
export class ContentProviderService {
  #backend = inject(EXTENDED_BACKEND_SERVICE);

  // Existing server content
  private serverInstitutions = new BehaviorSubject<Institution[]>([]);
  private serverTags = new BehaviorSubject<Tag[]>([]);
  private serverPersons = new BehaviorSubject<WikibaseItem[]>([]);
  private serverSoftware = new BehaviorSubject<WikibaseItem[]>([]);
  private serverTechniques = new BehaviorSubject<WikibaseItem[]>([]);
  private serverRoles = new BehaviorSubject<WikibaseItem[]>([]);
  private serverBibRefs = new BehaviorSubject<WikibaseItem[]>([]);
  private serverPhyObjs = new BehaviorSubject<WikibaseItem[]>([]);

  // Newly added content
  private localPersons = new BehaviorSubject<WikibaseItem[]>([]);
  private localInstitutions = new BehaviorSubject<Institution[]>([]);
  // There are no cases where local tags are needed
  // private LocalTags = new BehaviorSubject<Tag[]>([]);

  public readonly instanceInfo = new BehaviorSubject<InstanceInfo | undefined>(undefined);

  persons$ = combineLatest([this.serverPersons, this.localPersons]).pipe(
    map(([serverPersons, localPersons]) => serverPersons.concat(localPersons)),
  );
  institutions$ = combineLatest([this.serverInstitutions, this.localInstitutions]).pipe(
    map(([serverInstitutions, localInstitutions]) => serverInstitutions.concat(localInstitutions)),
  );
  tags$ = this.serverTags.asObservable();
  techniques$ = this.serverTechniques.asObservable();
  software$ = this.serverSoftware.asObservable();
  roles$ = this.serverRoles.asObservable();
  bibrefs$ = this.serverBibRefs.asObservable();
  physicalobjects$ = this.serverPhyObjs.asObservable();

  constructor() {
    this.updateContent();
  }

  public async updateContent() {
    // TODO: refetch on some occasions, e.g. after wizard completion
    await Promise.allSettled([
      this.updateMetadataChoices(),
      // this.updateInstitutions(),
      this.updateTags(),
      // this.updateSoftware(),
      // this.updateTechniques(),
      // this.updateRoles(),
      this.updateWikibaseMetadata(),
    ]);
    // await Promise.all([this.updatePersons()]);
  }

  public async updateWikibaseMetadata() {
    return this.#backend
      .get(`wikibase/instance/info`)
      .then(result => result as InstanceInfo)
      .then(result => {
        this.instanceInfo.next(result);
      });
  }

  public async updateMetadataChoices() {
    return this.#backend
      .get(`wikibase/choices/metadata`)
      .then(result => result as IMetadataChoices)
      .then(result => {
        if (result.persons !== undefined && Array.isArray(result.persons)) {
          console.debug('fetched persons');
          console.debug(result.persons);
          this.serverPersons.next(result.persons.map(p => new WikibaseItem(p)));
        }
        if (result.techniques !== undefined && Array.isArray(result.techniques)) {
          console.debug('fetched techniques');
          console.debug(result.techniques);
          this.serverTechniques.next(result.techniques.map(t => new WikibaseItem(t)));
        }
        if (result.software !== undefined && Array.isArray(result.software)) {
          console.debug('fetched software');
          console.debug(result.software);
          this.serverSoftware.next(result.software.map(s => new WikibaseItem(s)));
        }
        if (result.roles !== undefined && Array.isArray(result.roles)) {
          console.debug('fetched roles');
          console.debug(result.roles);
          this.serverRoles.next(result.roles.map(r => new WikibaseItem(r)));
        }
        if (result.bibliographic_refs !== undefined && Array.isArray(result.bibliographic_refs)) {
          console.debug('fetched bib refs');
          console.debug(result.bibliographic_refs);
          this.serverBibRefs.next(result.bibliographic_refs.map(r => new WikibaseItem(r)));
        }
        if (result.physical_objs !== undefined && Array.isArray(result.physical_objs)) {
          console.debug('fetched physical_objs');
          console.debug(result.physical_objs);
          this.serverPhyObjs.next(result.physical_objs.map(o => new WikibaseItem(o)));
        }
      })
      .catch(() => {});
  }

  // public async updateSoftware() {
  //   this.backend
  //     .getAllSoftware()
  //     .then(result => {
  //       console.debug("fetched software:");
  //       console.debug(result);
  //       if (Array.isArray(result)) {
  //         this.serverSoftware.next(result.map(s => new WikibaseItem(s)));
  //       }
  //     })
  //     .catch(() => {});
  // }
  //
  // public async updateTechniques() {
  //   this.backend
  //     .getAllTechniques()
  //     .then(result => {
  //       console.debug("fetched techniques:");
  //       console.debug(result);
  //       if (Array.isArray(result)) {
  //         this.serverTechniques.next(result.map(t => new WikibaseItem(t)));
  //       }
  //     })
  //     .catch(() => {});
  // }
  //
  // public async updateRoles() {
  //   this.backend
  //     .getAllRoles()
  //     .then(result => {
  //       console.debug("fetched roles:");
  //       console.debug(result);
  //       if (Array.isArray(result)) {
  //         this.serverRoles.next(result.map(t => new WikibaseItem(t)));
  //       }
  //     })
  //     .catch(() => {});
  // }
  //
  // public async updateInstitutions() {
  //   this.backend
  //     .getAllInstitutions()
  //     .then(result => {
  //       if (Array.isArray(result)) {
  //         this.serverInstitutions.next(result.map(i => new Institution(i)));
  //       }
  //     })
  //     .catch(() => {});
  // }
  //
  public async updateTags() {
    return this.#backend
      .get(`api/v1/get/findall/${Collection.tag}`)
      .then(result => result as ITag[])
      .then(result => {
        const map = new Map<string, Tag>();
        for (const tag of result) {
          map.set(tag._id.toString(), new Tag(tag));
        }
        const tags = Array.from(map.values()).sort((a, b) => (a.value > b.value ? 1 : -1));
        this.serverTags.next(tags);
      })
      .catch(() => {});
  }

  public addLocalPerson(person: WikibaseItem) {
    this.localPersons.next(this.localPersons.value.concat(person));
    return this.localPersons.value[this.localPersons.value.length - 1];
  }

  public removeLocalPerson(person: MediaAgent) {
    const persons = [...this.localPersons.value];
    const index = persons.findIndex(p => p.id.toString() === person.id.toString());
    if (index < 0) {
      console.warn(`Couldn't find person in LocalPersons`, person, persons);
      return false;
    }
    persons.splice(index, 1);
    this.localPersons.next(persons);
    return true;
  }

  public addLocalInstitution(institution: Institution) {
    this.localInstitutions.next(this.localInstitutions.value.concat(institution));
    return this.localInstitutions.value[this.localInstitutions.value.length - 1];
  }

  public removeLocalInstitution(institution: Institution) {
    const institutions = [...this.localInstitutions.value];
    const index = institutions.findIndex(i => i._id.toString() === institution._id.toString());
    if (index < 0) {
      console.warn(`Couldn't find institution in LocalInstitutions`, institution, institutions);
      return false;
    }
    institutions.splice(index, 1);
    this.localInstitutions.next(institutions);
    return true;
  }
}
