import type { IDigitalEntity } from '@kompakkt/common';
import type {
  IMediaAgent,
  IWikibaseDigitalEntityExtension,
  IWikibaseItem,
  WikibaseExtendedBaseEntity,
  WikibaseExtendedDigitalEntity,
  WikibaseExtendedPhysicalEntity,
} from '../../common/wikibase.common';
import ObjectId from 'bson-objectid';

type UndoPartial<T> = T extends Partial<infer R> ? R : T;

export const getObjectId = () => new ObjectId().toString();

const empty = (value: unknown): boolean => {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return true;
    return value <= 0;
  }
  if (typeof value === 'string') return value.length === 0;
  if (value === null || typeof value === 'undefined') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return true;
};
const emptyProps = (arr: any[], props?: string[]) =>
  !empty(arr) &&
  arr.find(el => {
    for (const prop of props ?? Object.keys(el)) if (empty(el[prop])) return true;
    return false;
  });

export const emptyWikibaseItem = (): IWikibaseItem =>
  ({
    id: '',
    label: {},
    internalID: '',
    description: '',
    media: '',
  }) satisfies IWikibaseItem;

export const emptyMediaAgent = (): IMediaAgent =>
  ({
    ...emptyWikibaseItem(),
    roleTitle: undefined,
  }) satisfies IMediaAgent;

export const createWikibaseExtension = (): UndoPartial<IWikibaseDigitalEntityExtension> => {
  const wikibase: IWikibaseDigitalEntityExtension['wikibase'] = {
    label: {},
    description: {},
    agents: [],
    techniques: [],
    software: [],
    equipment: [],
    externalLinks: [],
    bibliographicRefs: [],
    physicalObjs: [],
    creationDate: undefined,
    claims: {},
    hierarchies: [],
    licence: undefined,
    id: undefined,
    address: undefined,
  };
  return { wikibase };
};

export const mergeExistingEntityWikibaseExtension = (
  entity: IDigitalEntity | WikibaseExtendedDigitalEntity,
): WikibaseExtendedDigitalEntity => {
  const extensionData = createWikibaseExtension();
  const clone = { ...emptyDigitalEntity(), ...entity } as WikibaseExtendedDigitalEntity;
  clone.extensions ??= {};
  clone.extensions.wikibase ??= {};
  if (!('wikibase' in clone.extensions)) {
    clone.extensions.wikibase = extensionData.wikibase;
    return clone;
  }
  console.debug('mergeExistingEntityWikibaseExtension', extensionData);
  for (const [key, value] of Object.entries(extensionData.wikibase)) {
    if (Object.hasOwn(clone.extensions.wikibase, key)) continue;
    (clone.extensions.wikibase as any)[key] = value;
  }
  return clone;
};

export const transformOldWikibaseEntityToExtension = <
  T extends WikibaseExtendedDigitalEntity | WikibaseExtendedPhysicalEntity,
>(
  entity: T,
): T => {
  const extensionData = createWikibaseExtension();
  if (!!entity.extensions?.wikibase) {
    return entity;
  }
  entity.extensions = extensionData;
  for (const [key, value] of Object.entries(extensionData.wikibase)) {
    (entity.extensions.wikibase as any)[key] = (entity as any)[key] ?? value;
  }
  entity.extensions.wikibase!.id = (entity as any).wikibase_id ?? entity.extensions.wikibase!.label;
  entity.extensions.wikibase!.address =
    (entity as any).wikibase_address ?? entity.extensions.wikibase!.agents;
  return entity;
};

const emptyBaseEntity = (): WikibaseExtendedBaseEntity =>
  ({
    _id: getObjectId(),
    extensions: {},
    title: '',
    description: '',
    externalId: [],
    externalLink: [],
    biblioRefs: [],
    other: [],
    metadata_files: [],
    persons: [],
    institutions: [],
  }) satisfies WikibaseExtendedBaseEntity;
export const isBaseEntityValid = (entity: WikibaseExtendedBaseEntity): boolean => {
  // Every entity needs a title
  if (empty(entity.title)) return false;

  // Every entity needs a description
  if (empty(entity.description)) return false;

  // Any existing external identifier needs all fields filled
  if (emptyProps(entity.externalId)) return false;

  // Any existing external link needs all fields filled
  if (emptyProps(entity.externalLink)) return false;

  // Any existing bibliographic reference needs a value
  if (emptyProps(entity.biblioRefs, ['value'])) return false;

  // Any additional information added as 'other' needs all fields filled
  if (emptyProps(entity.other)) return false;

  // Any added metadata file needs correctly filled fields
  if (emptyProps(entity.metadata_files)) return false;

  return true;
};

export const emptyDigitalEntity = (): WikibaseExtendedDigitalEntity =>
  ({
    ...emptyBaseEntity(),
    type: '',
    licence: '',
    licenceAttribution: '',
    discipline: [],
    tags: [],
    dimensions: [],
    creation: [],
    files: [],
    statement: '',
    objecttype: '',
    phyObjs: [],
  }) satisfies WikibaseExtendedDigitalEntity;
export const isDigitalEntityValid = (entity: WikibaseExtendedDigitalEntity): boolean => {
  if (!isBaseEntityValid(entity)) return false;

  if (empty(entity.extensions.wikibase?.label?.['en'])) return false;
  if (empty(entity.extensions.wikibase?.description?.['en'])) return false;

  const licence = entity.extensions.wikibase?.licence;
  if (!licence || licence.trim().length === 0) return false;

  let hasCreator = false;
  let hasRightsOwner = false;
  for (const agent of entity.extensions.wikibase?.agents ?? []) {
    if (hasCreator && hasRightsOwner) {
      return true;
    }
    if (agent.roleTitle === 'Creator') {
      hasCreator = true;
    }
    if (agent.roleTitle === 'Rightsowner') {
      hasRightsOwner = true;
    }
  }
  if (!hasCreator || !hasRightsOwner) return false;

  return true;
};
