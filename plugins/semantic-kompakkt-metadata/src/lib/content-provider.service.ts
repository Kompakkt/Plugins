import { inject, Service } from '@angular/core';
import { EXTENDER_BACKEND_SERVICE } from '@kompakkt/plugins/extender';
import { BehaviorSubject } from 'rxjs';
import {
  IAnnotationLinkChoices,
  IMediaAgent,
  IMetadataChoices,
  IWikibaseItem,
} from '../common/wikibase.common';
import { toSignal } from '@angular/core/rxjs-interop';
import { emptyMediaAgent, emptyWikibaseItem } from './metadata-wizard/metadata';

export type InstanceInfo = {
  instance: string;
};

const sortWikibaseItemsById = (a: IWikibaseItem, b: IWikibaseItem) => {
  if (!a.id || !b.id) return 0;
  const aID = +a.id.slice(1);
  const bID = +b.id.slice(1);
  return aID - bID;
};

@Service()
export class ContentProviderService {
  #backend = inject(EXTENDER_BACKEND_SERVICE);
  #serverAgents = new BehaviorSubject<IMediaAgent[]>([]);
  #serverSoftware = new BehaviorSubject<IWikibaseItem[]>([]);
  #serverTechniques = new BehaviorSubject<IWikibaseItem[]>([]);
  #serverBibRefs = new BehaviorSubject<IWikibaseItem[]>([]);
  #serverPhyObjs = new BehaviorSubject<IWikibaseItem[]>([]);
  #serverConcepts = new BehaviorSubject<IWikibaseItem[]>([]);
  #serverMedia = new BehaviorSubject<IWikibaseItem[]>([]);
  #serverLicenses = new BehaviorSubject<IWikibaseItem[]>([]);
  #instanceInfo$ = new BehaviorSubject<InstanceInfo | undefined>(undefined);

  agents = toSignal(this.#serverAgents, { initialValue: [] });
  techniques = toSignal(this.#serverTechniques, { initialValue: [] });
  software = toSignal(this.#serverSoftware, { initialValue: [] });
  bibrefs = toSignal(this.#serverBibRefs, { initialValue: [] });
  physicalobjects = toSignal(this.#serverPhyObjs, { initialValue: [] });
  concepts = toSignal(this.#serverConcepts, { initialValue: [] });
  media = toSignal(this.#serverMedia, { initialValue: [] });
  licenses = toSignal(this.#serverLicenses, { initialValue: [] });
  instanceInfo = toSignal(this.#instanceInfo$, { initialValue: undefined });

  constructor() {
    void this.updateContent();
    (window as any)['updateWikibaseContent'] = () => this.updateContent();
  }

  public async updateContent() {
    // TODO: refetch on some occasions, e.g. after wizard completion
    await Promise.allSettled([
      this.updateMetadataChoices(),
      this.updateAnnotationLinkChoices(),
      this.updateInstanceInfo(),
    ]);
  }

  public async updateInstanceInfo() {
    return this.#backend
      .get(`wikibase/instance/info`)
      .then(result => result as InstanceInfo)
      .then(result => {
        console.debug('instance info', result);
        this.#instanceInfo$.next(result);
        return result;
      });
  }

  public async updateAnnotationLinkChoices() {
    return this.#backend
      .get(`wikibase/choices/annotation-link`)
      .then(result => result as IAnnotationLinkChoices)
      .then(result => {
        console.debug('annotation link choices', result);
        /** Returned by metadata choices
        if (result.relatedAgents !== undefined && Array.isArray(result.relatedAgents)) {
          this.#serverAgents.next(
            result.relatedAgents.map(ra => ({...emptyWikibaseItem(), ...ra})).sort(sortWikibaseItemsById),
          );
        }
         */
        if (result.relatedConcepts !== undefined && Array.isArray(result.relatedConcepts)) {
          this.#serverConcepts.next(
            result.relatedConcepts
              .map(rc => ({ ...emptyWikibaseItem(), ...rc }))
              .sort(sortWikibaseItemsById),
          );
        }
        if (result.relatedMedia !== undefined && Array.isArray(result.relatedMedia)) {
          this.#serverMedia.next(
            result.relatedMedia
              .map(rm => ({ ...emptyWikibaseItem(), ...rm }))
              .sort(sortWikibaseItemsById),
          );
        }
        if (result.licenses !== undefined && Array.isArray(result.licenses)) {
          this.#serverLicenses.next(
            result.licenses
              .map(rl => ({ ...emptyWikibaseItem(), ...rl }))
              .sort(sortWikibaseItemsById),
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
          this.#serverAgents.next(
            result.persons.map(p => ({ ...emptyMediaAgent(), ...p })).sort(sortWikibaseItemsById),
          );
        }
        if (result.techniques !== undefined && Array.isArray(result.techniques)) {
          this.#serverTechniques.next(
            result.techniques
              .map(t => ({ ...emptyWikibaseItem(), ...t }))
              .sort(sortWikibaseItemsById),
          );
        }
        if (result.software !== undefined && Array.isArray(result.software)) {
          this.#serverSoftware.next(
            result.software
              .map(s => ({ ...emptyWikibaseItem(), ...s }))
              .sort(sortWikibaseItemsById),
          );
        }
        if (result.bibliographic_refs !== undefined && Array.isArray(result.bibliographic_refs)) {
          this.#serverBibRefs.next(
            result.bibliographic_refs
              .map(r => ({ ...emptyWikibaseItem(), ...r }))
              .sort(sortWikibaseItemsById),
          );
        }
        if (result.physical_objs !== undefined && Array.isArray(result.physical_objs)) {
          this.#serverPhyObjs.next(
            result.physical_objs
              .map(o => ({ ...emptyWikibaseItem(), ...o }))
              .sort(sortWikibaseItemsById),
          );
        }
      })
      .catch(() => {});
  }
}
