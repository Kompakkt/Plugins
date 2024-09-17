import { inject, Injectable } from '@angular/core';

import { EXTENDED_BACKEND_SERVICE } from '@kompakkt/extender';
import { MediaAgent, Institution, Tag, WikibaseItem } from './metadata-wizard/metadata';

import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Collection, IMetadataChoices, ITag } from '../common';

@Injectable({
  providedIn: 'root',
})
export class ContentProviderService {
  #backend = inject(EXTENDED_BACKEND_SERVICE);

  // Existing server content
  private ServerInstitutions = new BehaviorSubject<Institution[]>([]);
  private ServerTags = new BehaviorSubject<Tag[]>([]);
  private ServerPersons = new BehaviorSubject<WikibaseItem[]>([]);
  private ServerSoftware = new BehaviorSubject<WikibaseItem[]>([]);
  private ServerTechniques = new BehaviorSubject<WikibaseItem[]>([]);
  private ServerRoles = new BehaviorSubject<WikibaseItem[]>([]);
  private ServerBibRefs = new BehaviorSubject<WikibaseItem[]>([]);
  private ServerPhyObjs = new BehaviorSubject<WikibaseItem[]>([]);

  // Newly added content
  private LocalPersons = new BehaviorSubject<WikibaseItem[]>([]);
  private LocalInstitutions = new BehaviorSubject<Institution[]>([]);
  // There are no cases where local tags are needed
  // private LocalTags = new BehaviorSubject<Tag[]>([]);

  constructor() {
    this.updateContent();
  }

  get $Persons() {
    return combineLatest([this.ServerPersons, this.LocalPersons]).pipe(
      map(([serverPersons, localPersons]) => serverPersons.concat(localPersons)),
    );
  }

  get $Institutions() {
    return combineLatest([this.ServerInstitutions, this.LocalInstitutions]).pipe(
      map(([serverInstitutions, localInstitutions]) =>
        serverInstitutions.concat(localInstitutions),
      ),
    );
  }

  get $Tags() {
    return this.ServerTags.asObservable();
  }

  get $Techniques() {
    return this.ServerTechniques.asObservable();
  }

  get $Software() {
    return this.ServerSoftware.asObservable();
  }

  get $Roles() {
    return this.ServerRoles.asObservable();
  }

  get $BibRefs() {
    return this.ServerBibRefs.asObservable();
  }

  get $PhysicalObjects() {
    return this.ServerPhyObjs.asObservable();
  }

  public async updateContent() {
    // TODO: refetch on some occasions, e.g. after wizard completion
    await Promise.all([
      this.updateMetadataChoices(),
      // this.updateInstitutions(),
      this.updateTags(),
      // this.updateSoftware(),
      // this.updateTechniques(),
      // this.updateRoles(),
    ]);
    // await Promise.all([this.updatePersons()]);
  }

  public async updateMetadataChoices() {
    this.#backend
      .get(`api/v1/get/findall/${Collection.metadata}`)
      .then(result => result as IMetadataChoices)
      .then(result => {
        if (result.persons !== undefined && Array.isArray(result.persons)) {
          console.debug("fetched persons");
          console.debug(result.persons);
          this.ServerPersons.next(result.persons.map(p => new WikibaseItem(p)));
        }
        if (result.techniques !== undefined && Array.isArray(result.techniques)) {
          console.debug("fetched techniques");
          console.debug(result.techniques);
          this.ServerTechniques.next(result.techniques.map(t => new WikibaseItem(t)));
        }
        if (result.software !== undefined && Array.isArray(result.software)) {
          console.debug("fetched software");
          console.debug(result.software);
          this.ServerSoftware.next(result.software.map(s => new WikibaseItem(s)));
        }
        if (result.roles !== undefined && Array.isArray(result.roles)) {
          console.debug("fetched roles");
          console.debug(result.roles);
          this.ServerRoles.next(result.roles.map(r => new WikibaseItem(r)));
        }
        if (result.bibliographic_refs !== undefined && Array.isArray(result.bibliographic_refs)) {
          console.debug("fetched bib refs");
          console.debug(result.bibliographic_refs);
          this.ServerBibRefs.next(result.bibliographic_refs.map(r => new WikibaseItem(r)));
        }
        if (result.physical_objs !== undefined && Array.isArray(result.physical_objs)) {
          console.debug("fetched physical_objs");
          console.debug(result.physical_objs);
          this.ServerPhyObjs.next(result.physical_objs.map(o => new WikibaseItem(o)));
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
  //         this.ServerSoftware.next(result.map(s => new WikibaseItem(s)));
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
  //         this.ServerTechniques.next(result.map(t => new WikibaseItem(t)));
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
  //         this.ServerRoles.next(result.map(t => new WikibaseItem(t)));
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
  //         this.ServerInstitutions.next(result.map(i => new Institution(i)));
  //       }
  //     })
  //     .catch(() => {});
  // }
  //
  public async updateTags() {
    this.#backend
      .get(`api/v1/get/findall/${Collection.tag}`)
      .then(result => result as ITag[])
      .then(result => {
        const map = new Map<string, Tag>();
        for (const tag of result) {
          map.set(tag._id.toString(), new Tag(tag));
        }
        const tags = Array.from(map.values()).sort((a, b) => (a.value > b.value ? 1 : -1));
        this.ServerTags.next(tags);
      })
      .catch(() => {});
  }

  public addLocalPerson(person: WikibaseItem) {
    this.LocalPersons.next(this.LocalPersons.value.concat(person));
    return this.LocalPersons.value[this.LocalPersons.value.length - 1];
  }

  public removeLocalPerson(person: MediaAgent) {
    const persons = [...this.LocalPersons.value];
    const index = persons.findIndex(p => p.id.toString() === person.id.toString());
    if (index >= 0) {
      persons.splice(index, 1);
      this.LocalPersons.next(persons);
    } else {
      console.warn(`Couldn't find person in LocalPersons`, person, persons);
    }
  }

  public addLocalInstitution(institution: Institution) {
    this.LocalInstitutions.next(this.LocalInstitutions.value.concat(institution));
    return this.LocalInstitutions.value[this.LocalInstitutions.value.length - 1];
  }

  public removeLocalInstitution(institution: Institution) {
    const institutions = [...this.LocalInstitutions.value];
    const index = institutions.findIndex(i => i._id.toString() === institution._id.toString());
    if (index >= 0) {
      institutions.splice(index, 1);
      this.LocalInstitutions.next(institutions);
    } else {
      console.warn(`Couldn't find institution in LocalInstitutions`, institution, institutions);
    }
  }
}
