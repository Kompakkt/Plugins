import {
  IEntity,
  IAddress,
  IDocument,
  IGroup,
  ITag,
  IDigitalEntity,
  ICompilation,
  IAnnotation,
  IInstitution,
  IContact,
} from './interfaces';

const isDefined = (value: any) => value != null && value != undefined;

// TODO: allow dot notation
const checkProps = (props: string[], obj: any) => {
  if (!isDefined(obj)) return false;
  let valid = true;
  for (const prop of props) {
    if (!isDefined(obj[prop])) {
      valid = false;
      break;
    }
  }
  return valid;
};

/**
 * Checks whether a document received from the backend is still unresolved
 * @type {Boolean}
 */
const isUnresolved = (obj: any): obj is IDocument =>
  Object.keys(obj).length === 1 && obj._id !== undefined;

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
 * Checks whether an object is a digital entity
 * @type {Boolean}
 */
const isDigitalEntity = (obj: any): obj is IDigitalEntity =>
  checkProps(DIG_ENTITY_PROPS, obj);
const DIG_ENTITY_PROPS = ['description', 'agents'];

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
  isUnresolved,
  isGroup,
  isTag,
  isCompilation,
  isEntity,
  isResolvedEntity,
  isAnnotation,
  isDigitalEntity,
  isInstitution,
  isAddress,
  isContact,
};
