import { inject, Injectable } from '@angular/core';

import { EXTENDER_BACKEND_SERVICE } from '@kompakkt/extender';
import { Institution, MediaAgent, Tag, WikibaseItem } from './metadata-wizard/metadata';

import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, ITag } from '../common';
import { IAnnotationLinkChoices, IMetadataChoices } from '../common/wikibase.common';

export type InstanceInfo = {
  instance: string;
};

const sortWikibaseItemsById = (a: WikibaseItem, b: WikibaseItem) => {
  if (!a.id || !b.id) return 0;
  const aID = +a.id.slice(1);
  const bID = +b.id.slice(1);
  return aID - bID;
};

@Injectable({
  providedIn: 'root',
})
export class ContentProviderService {
  #backend = inject(EXTENDER_BACKEND_SERVICE);

  // Existing server content
  private serverInstitutions = new BehaviorSubject<Institution[]>([]);
  private serverTags = new BehaviorSubject<Tag[]>([]);
  private serverPersons = new BehaviorSubject<WikibaseItem[]>([]);
  private serverSoftware = new BehaviorSubject<WikibaseItem[]>([]);
  private serverTechniques = new BehaviorSubject<WikibaseItem[]>([]);
  private serverBibRefs = new BehaviorSubject<WikibaseItem[]>([]);
  private serverPhyObjs = new BehaviorSubject<WikibaseItem[]>([]);
  private serverConcepts = new BehaviorSubject<WikibaseItem[]>([]);
  private serverMedia = new BehaviorSubject<WikibaseItem[]>([]);
  private serverAgents = new BehaviorSubject<WikibaseItem[]>([]);
  private serverLicenses = new BehaviorSubject<WikibaseItem[]>([]);

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
  bibrefs$ = this.serverBibRefs.asObservable();
  physicalobjects$ = this.serverPhyObjs.asObservable();
  concepts$ = this.serverConcepts.asObservable();
  media$ = this.serverMedia.asObservable();
  agents$ = this.serverAgents.asObservable();
  licenses$ = this.serverLicenses.asObservable();

  constructor() {
    this.updateContent();
    (window as any)['updateWikibaseContent'] = () => this.updateContent();
  }

  public async updateContent() {
    // TODO: refetch on some occasions, e.g. after wizard completion
    await Promise.allSettled([
      this.updateMetadataChoices(),
      this.updateAnnotationLinkChoices(),
      // this.updateInstitutions(),
      this.updateTags(),
      // this.updateSoftware(),
      // this.updateTechniques(),
      // this.updateRoles(),
      this.updateInstanceInfo(),
    ]);
    // await Promise.all([this.updatePersons()]);
  }

  public async updateInstanceInfo() {
    return this.#backend
      .get(`wikibase/instance/info`)
      .then(result => result as InstanceInfo)
      .then(result => {
        console.debug('instance info', result);
        this.instanceInfo.next(result);
        return result;
      });
  }

  public async updateAnnotationLinkChoices() {
    return this.#backend
      .get(`/wikibase/choices/annotation-link`)
      .then(result => result as IAnnotationLinkChoices)
      .then(result => {
        console.debug('annotation link choices', result);
        if (result.relatedAgents !== undefined && Array.isArray(result.relatedAgents)) {
          this.serverAgents.next(
            result.relatedAgents.map(ra => new WikibaseItem(ra)).sort(sortWikibaseItemsById),
          );
        }
        if (result.relatedConcepts !== undefined && Array.isArray(result.relatedConcepts)) {
          this.serverConcepts.next(
            result.relatedConcepts.map(rc => new WikibaseItem(rc)).sort(sortWikibaseItemsById),
          );
        }
        if (result.relatedMedia !== undefined && Array.isArray(result.relatedMedia)) {
          this.serverMedia.next(
            result.relatedMedia.map(rm => new WikibaseItem(rm)).sort(sortWikibaseItemsById),
          );
        }
        if (result.licenses !== undefined && Array.isArray(result.licenses)) {
          this.serverLicenses.next(
            result.licenses.map(rl => new WikibaseItem(rl)).sort(sortWikibaseItemsById),
          );
        }
        return result;
      });
  }

  public async updateMetadataChoices() {
    return this.#backend
      .get(`wikibase/choices/metadata`)
      .then(result => result as IMetadataChoices)
      .then(result => {
        console.debug('metadata choices', result);
        if (result.persons !== undefined && Array.isArray(result.persons)) {
          this.serverPersons.next(
            result.persons.map(p => new WikibaseItem(p)).sort(sortWikibaseItemsById),
          );
        }
        if (result.techniques !== undefined && Array.isArray(result.techniques)) {
          this.serverTechniques.next(
            result.techniques.map(t => new WikibaseItem(t)).sort(sortWikibaseItemsById),
          );
        }
        if (result.software !== undefined && Array.isArray(result.software)) {
          this.serverSoftware.next(
            result.software.map(s => new WikibaseItem(s)).sort(sortWikibaseItemsById),
          );
        }
        if (result.bibliographic_refs !== undefined && Array.isArray(result.bibliographic_refs)) {
          this.serverBibRefs.next(
            result.bibliographic_refs.map(r => new WikibaseItem(r)).sort(sortWikibaseItemsById),
          );
        }
        if (result.physical_objs !== undefined && Array.isArray(result.physical_objs)) {
          this.serverPhyObjs.next(
            result.physical_objs.map(o => new WikibaseItem(o)).sort(sortWikibaseItemsById),
          );
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
