import type {
  IAddress,
  IAnnotation,
  ICompilation,
  IContact,
  IDigitalEntity,
  IDocument,
  IEntity,
  IEntitySettings,
  IGroup,
  IInstitution,
  IPerson,
  IPhysicalEntity,
  ITag,
} from './interfaces';

const isDefined = (value: any) => value != null && value != undefined;

const checkProps = (props: string[], obj: unknown) => {
  if (typeof obj !== 'object' || obj === null) return false;
  if (!isDefined(obj)) return false;
  if (Array.isArray(obj)) return false;
  let valid = true;
  for (const prop of props) {
    if (!Object.hasOwn(obj, prop) || !isDefined((obj as Record<string, unknown>)[prop])) {
      valid = false;
      break;
    }
  }
  return valid;
};

/**
 * Checks whether a from the server returned document is equal to another.
 * While strings might be equal, they are not documents.
 * @param a - The first document to compare.
 * @param b - The second document to compare.
 * @returns True if the documents are equal and are documents, false otherwise.
 */
const areDocumentsEqual = (a: string | IDocument | null, b: string | IDocument | null) => {
  if (typeof a === 'string' || typeof b === 'string') return false;
  if (a === null || b === null) return false;
  if (a._id !== b._id) return false;
  return true;
};

/**
 * Checks whether a document received from the backend is still unresolved
 * @type {Boolean}
 */
const isUnresolved = (obj: any): obj is IDocument =>
  Object.keys(obj).length === 1 && obj._id !== undefined;

const isDocument = (obj: any): obj is IDocument =>
  typeof obj === 'object' && obj !== null && obj._id !== undefined;

/**
 * Checks whether an object has extensions
 * @param obj
 * @returns
 */
const hasExtensions = (obj: any): obj is { extensions: Record<string, unknown> } => {
  if (!isDefined(obj)) return false;
  return checkProps(['extensions'], obj);
};

/**
 * Checks whether an object is a group entry
 * @type {Boolean}
 */
const isGroup = (obj: any): obj is IGroup => checkProps(GROUP_PROPS, obj);
const GROUP_PROPS = ['name', 'creator', 'owners', 'members'];

/**
 * Checks whether an object is a tag entry
 * @type {Boolean}
 */
const isTag = (obj: any): obj is ITag => checkProps(TAG_PROPS, obj);
const TAG_PROPS = ['value'];

/**
 * Checks whether an object is a digital/physical entity
 * @type {Boolean}
 */
const isMetadataEntity = (obj: any): obj is IDigitalEntity | IPhysicalEntity =>
  checkProps(META_ENTITY_PROPS, obj);
const META_ENTITY_PROPS = ['title', 'description', 'persons', 'institutions'];

/**
 * Checks whether an object is a compilation
 * @type {Boolean}
 */
const isCompilation = (obj: any): obj is ICompilation => checkProps(COMP_PROPS, obj);
const COMP_PROPS = ['entities', 'name', 'description'];

/**
 * Checks whether an object is an entity
 * @type {Boolean}
 */
const isEntity = (obj: any): obj is IEntity => checkProps(ENTITY_PROPS, obj);
const ENTITY_PROPS = ['name', 'mediaType', 'online', 'finished'];

/**
 *
 */
const isEntitySettings = (obj: any): obj is IEntitySettings =>
  checkProps(ENTITY_SETTINGS_PROPS, obj);
const ENTITY_SETTINGS_PROPS = ['preview', 'cameraPositionInitial', 'background', 'lights'];

/**
 * Checks whether an <IEntity | IDocument> is fully resolved
 * @type {Boolean}
 */
const isResolvedEntity = (obj: any): obj is IEntity & { relatedDigitalEntity: IDigitalEntity } =>
  isEntity(obj) && isDigitalEntity(obj.relatedDigitalEntity);

/**
 * Checks whether an object is an annotation
 * @type {Boolean}
 */
const isAnnotation = (obj: any): obj is IAnnotation => checkProps(ANNO_PROPS, obj);
const ANNO_PROPS = ['body', 'target'];

/**
 * Checks whether an object is a digital entity
 * @type {Boolean}
 */
const isDigitalEntity = (obj: any): obj is IDigitalEntity =>
  isMetadataEntity(obj) && checkProps(DIG_ENTITY_PROPS, obj);
const DIG_ENTITY_PROPS = ['type', 'licence'];

/**
 * Checks whether an object is a physical entity
 * @type {Boolean}
 */
const isPhysicalEntity = (obj: any): obj is IPhysicalEntity =>
  isMetadataEntity(obj) && checkProps(PHY_ENTITY_PROPS, obj);
const PHY_ENTITY_PROPS = ['place', 'collection'];

/**
 * Checks whether an object is a person
 * @type {Boolean}
 */
const isPerson = (obj: any): obj is IPerson => checkProps(PERSON_PROPS, obj);
const PERSON_PROPS = ['prename', 'name'];

/**
 * Checks whether an object is an institution
 * @type {Boolean}
 */
const isInstitution = (obj: any): obj is IInstitution => checkProps(INST_PROPS, obj);
const INST_PROPS = ['name', 'addresses'];

/**
 * Checks whether an object is an address
 * @type {Boolean}
 */
const isAddress = (obj: any): obj is IAddress => checkProps(ADDR_PROPS, obj);
const ADDR_PROPS = ['building', 'city', 'country', 'number', 'postcode', 'street'];

/**
 * Checks whether an object is a contact reference
 * @type {Boolean}
 */
const isContact = (obj: any): obj is IContact => checkProps(CONTACT_PROPS, obj);
const CONTACT_PROPS = ['mail', 'note', 'phonenumber'];

export {
  areDocumentsEqual,
  hasExtensions,
  isAddress,
  isAnnotation,
  isCompilation,
  isContact,
  isDigitalEntity,
  isDocument,
  isEntity,
  isEntitySettings,
  isGroup,
  isInstitution,
  isMetadataEntity,
  isPerson,
  isPhysicalEntity,
  isResolvedEntity,
  isTag,
  isUnresolved,
};
