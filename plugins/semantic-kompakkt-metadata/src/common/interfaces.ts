// Expose MongoDB ObjectId to be used in Repo and Viewer
import { ObjectId } from 'bson';
export { ObjectId };

import { Collection, UserRank } from './enums';

/**
 * Database model for any document saved in the database.
 * Should be used as a base interface for other database models.
 */
export interface IDocument {
  _id: string | ObjectId;
}

export interface ITypeValueTuple {
  type: string;
  value: string;
}

export interface IDimensionTuple {
  type: string;
  value: string;
  name: string;
}

export interface ICreationTuple {
  technique: string;
  program: string;
  equipment: string;
  date: string;
}

export interface IDescriptionValueTuple {
  description: string;
  value: string;
}

export interface IPlaceTuple {
  name: string;
  geopolarea: string;
  address: IAddress;
}

/**
 * Database model for addresses.
 */
export interface IAddress extends IDocument {
  building: string;
  number: string;
  street: string;
  postcode: string;
  city: string;
  country: string;

  // Internal & only used to sort addresses
  creation_date: number;
}

/**
 * Database model for contact references.
 */
export interface IContact extends IDocument {
  mail: string;
  phonenumber: string;
  note: string;

  // Internal & only used to sort contact references
  creation_date: number;
}

/**
 * Generic object-based pseudo-map (not to be confused with Map).
 * Key is always the _id of a metadata entity (DigitalEntity | PhysicalEntity)
 * Value is whatever data is connected to the entity described by key
 */
export interface IRelatedMap<T> {
  [relatedEntityId: string]: T | undefined;
}

/**
 * Database model of a person. Makes use of IRelatedMap for roles,
 * institutions and contact references.
 */

/**
 * Database model of an institution. Makes use of IRelatedMap for roles,
 * notes and addresses.
 */
export interface IInstitution extends IDocument {
  name: string;
  university: string;

  // relatedEntityId refers to the _id
  // of the digital or physical entity
  // a person refers to
  roles: IRelatedMap<string[]>;
  notes: IRelatedMap<string>;
  addresses: IRelatedMap<IAddress | IDocument>;
}

/**
 * Database model of a tag
 */
export interface ITag extends IDocument {
  value: string;
}

export interface IWikibaseItem {
  id: string;
  internalID?: string;
  label: { [key: string] : string };
  description?: string;
  media?: string;
}

export interface IMediaAgent extends IWikibaseItem {
  role: number;
  roleTitle: string | undefined;
}

export interface IMetadataChoices {
  persons: IWikibaseItem[],
  techniques: IWikibaseItem[],
  software: IWikibaseItem[],
  roles: IWikibaseItem[],
  bibliographic_refs: IWikibaseItem[],
  physical_objs: IWikibaseItem[],
}

export interface IAnnotationLinkChoices {
  relatedConcepts: IWikibaseItem[],
  relatedMedia: IWikibaseItem[],
  relatedAgents: IWikibaseItem[],
  licenses: IWikibaseItem[],
}

export interface IMediaHierarchy {
  parents: IWikibaseItem[],
  siblings: IWikibaseItem[],
}

/**
 * Database model of a digital entity. Uses IBaseEntity.
 */
export interface IDigitalEntity extends IDocument {
  externalId: ITypeValueTuple[];
  externalLink: IDescriptionValueTuple[];
  biblioRefs: IDescriptionValueTuple[];
  other: IDescriptionValueTuple[];

  label: { [key: string] : string };
  description: string;

  agents: IMediaAgent[];
  techniques: IWikibaseItem[];
  software: IWikibaseItem[];
  equipment: string[];
  creationDate: string | undefined;
  externalLinks: string[];
  bibliographicRefs: IWikibaseItem[];
  physicalObjs: IWikibaseItem[];

  metadata_files: IFile[];

  type: string;
  licence: number;

  discipline: string[];
  tags: ITag[];

  dimensions: IDimensionTuple[];
  creation: ICreationTuple[];
  files: IFile[];

  statement: string;
  objecttype: string;

  hierarchies: IMediaHierarchy[],
  wikibase_id?: string;
  wikibase_address?: string;
}

/**
 * Userdata reduced to fullname, username and _id.
 * May be displayed in public
 */
export interface IStrippedUserData extends IDocument {
  fullname: string;
  username: string;
}

// TODO: deprecate by only asking for password.
// take username from current logged in user. Don't cache
/**
 * Logindata cached in memory, for confirmation on actions of concern.
 * @deprecated
 */
export interface ILoginData {
  username: string;
  password: string;
  isCached: boolean;
}

/**
 * Database model for users. Should not be displayed in public,
 * as it contains the sessionID.
 */
export interface IUserData extends IDocument {
  username: string;
  sessionID: string;
  fullname: string;
  prename: string;
  surname: string;
  mail: string;
  bot_username: string;
  bot_password: string;
  role: UserRank;

  data: {
    [key in Collection]: Array<string | null | any | ObjectId>;
  };
}

/**
 * Database model for groups. May be displayed in public,
 * as it only contains stripped user data.
 */
export interface IGroup extends IDocument {
  name: string;
  creator: IStrippedUserData;
  owners: IStrippedUserData[];
  members: IStrippedUserData[];
}

/**
 * Database model of an annotation.
 */
export interface IAnnotation extends IDocument {
  validated: boolean;

  identifier: string;
  ranking: number;
  creator: IAgent;
  created: string;
  generator: IAgent;
  generated?: string;
  motivation: string;
  lastModificationDate?: string;
  lastModifiedBy: IAgent;

  body: IBody;
  target: ITarget;

  wikibase_id?: string;

  positionXOnView?: number;
  positionYOnView?: number;
}

export interface IAgent extends IDocument {
  type: string;
  name: string;
  homepage?: string;
}

export interface IBody {
  type: string;
  content: IContent;
}

export interface IContent {
  type: string;
  title: string;
  description: string;
  descriptionAuthors: IWikibaseItem[];
  descriptionLicenses: IWikibaseItem[];
  link?: string;
  relatedPerspective: ICameraPerspective;
  relatedMedia: IWikibaseItem[];
  relatedMediaUrls: string[];
  relatedEntities: IWikibaseItem[];
  [key: string]: any;
}

export interface ICameraPerspective {
  cameraType: string;
  position: IVector3;
  target: IVector3;
  preview: string;
}

export interface IVector3 {
  x: number;
  y: number;
  z: number;
}

export interface ITarget {
  source: ISource;
  selector: ISelector;
}

export interface ISource {
  link?: string;
  relatedEntity: string;
  relatedCompilation?: string;
}

export interface ISelector {
  referencePoint: IVector3;
  referenceNormal: IVector3;
}

// Entity related
// TODO: remove file_ prefix and add migration
export interface IFile {
  file_name: string;
  file_link: string;
  file_size: number;
  file_format: string;
}

/**
 * Describes any database model that can be protected by a whitelist of users
 * or groups.
 * Should not be used on its own.
 */
export interface IWhitelist {
  whitelist: {
    enabled: boolean;
    persons: IStrippedUserData[];
    groups: IGroup[];
  };
}

export interface IColor {
  r: number;
  b: number;
  g: number;
  a: number;
}

export interface IPosition {
  x: number;
  y: number;
  z: number;
}

export interface IEntitySettings {
  preview: string;
  cameraPositionInitial: {
    position: IPosition;
    target: IPosition;
  };
  background: {
    color: IColor;
    effect: boolean;
  };
  lights: IEntityLight[];
  rotation: IPosition;
  scale: number;
}

export interface IEntityLight {
  type: string;
  position: IPosition;
  intensity: number;
}

/**
 * Describes any database model that can be annotated/receive annotations.
 * Should not be used on its own.
 */
interface IAnnotationList {
  annotations: {
    [id: string]: IAnnotation | IDocument;
  };
}

/**
 * Database model of an entity.
 *
 * An entity is what a user creates during the upload process and contains
 * information about the files uploaded as well as a reference to the
 * digital entity described/connected to the uploaded entity.
 *
 * Makes use of IWhitelist and IAnnotationList.
 */
export interface IEntity extends IWhitelist, IAnnotationList, IDocument {
  name: string;

  files: IFile[];
  externalFile?: string;

  relatedDigitalEntity: IDocument | IDigitalEntity;

  creator: IStrippedUserData;

  online: boolean;
  finished: boolean;
  isBeingEdited: boolean;

  mediaType: string;

  dataSource: {
    isExternal: boolean;
    service: string;
  };

  processed: {
    low: string;
    medium: string;
    high: string;
    raw: string;
  };

  settings: IEntitySettings;
}

/**
 * Database model of a compilation.
 *
 * A compilation contains a list of entities aswell as information on
 * who created the compilation.
 *
 * Makes use of IWhitelist and IAnnotationList.
 */
export interface ICompilation extends IWhitelist, IAnnotationList, IDocument {
  name: string;
  description: string;
  creator: IStrippedUserData;
  password?: string | boolean;
  entities: {
    [id: string]: IEntity | IDocument;
  };
}

// Socket related
export interface ISocketAnnotation {
  annotation: any;
  user: ISocketUser;
}

export interface ISocketMessage {
  message: string;
  user: ISocketUser;
}

export interface ISocketUser extends IDocument {
  socketId: string;
  username: string;
  fullname: string;
  room: string;
}

export interface ISocketUserInfo {
  user: ISocketUser;
  annotations: any[];
}

export interface ISocketChangeRoom {
  newRoom: string;
  annotations: any[];
}

export interface ISocketChangeRanking {
  user: ISocketUser;
  oldRanking: any[];
  newRanking: any[];
}

export interface ISocketRoomData {
  requester: ISocketUserInfo;
  recipient: string;
  info: ISocketUserInfo;
}

export interface ISizedEvent {
  width: number;
  height: number;
}
