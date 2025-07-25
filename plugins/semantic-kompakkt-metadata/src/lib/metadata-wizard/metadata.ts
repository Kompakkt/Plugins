import { debounceTime, ReplaySubject } from 'rxjs';
import type {
  IDigitalEntity,
  IPhysicalEntity,
  IBaseEntity,
  IPerson,
  IInstitution,
  ITag,
  IContact,
  IAddress,
  ITypeValueTuple,
  IDescriptionValueTuple,
  IDimensionTuple,
  ICreationTuple,
  IFile,
  IPlaceTuple,
  IRelatedMap,
} from '../../common';
import type {
  IMediaAgent,
  IWikibaseDigitalEntityExtension,
  IWikibaseItem,
} from '../../common/wikibase.common';
import ObjectId from 'bson-objectid';

type UndoPartial<T> = T extends Partial<infer R> ? R : T;

const getObjectId = () => new ObjectId().toString();

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

class WikibaseItem implements IWikibaseItem {
  id: string = '';

  label: Record<string, string> = {};
  internal_id = '';
  title = '';
  description = '';

  constructor(obj: Partial<IWikibaseItem> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      (this as any)[key] = value;
    }
  }
}

class MediaAgent extends WikibaseItem implements IMediaAgent {
  roleTitle: IMediaAgent['roleTitle'] = undefined;

  constructor(obj: Partial<IMediaAgent> = {}) {
    super(obj);
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      (this as any)[key] = value;
    }
  }
}

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

// TODO: check if this works as intended
export const mergeExistingEntityWikibaseExtension = <T extends DigitalEntity | PhysicalEntity>(
  entity: T,
): T => {
  const extensionData = createWikibaseExtension();
  if (!entity.extensions.wikibase) {
    entity.extensions = {
      ...entity.extensions,
      wikibase: extensionData.wikibase,
    };
    return entity;
  }
  console.debug('mergeExistingEntityWikibaseExtension', extensionData);
  for (const [key, value] of Object.entries(extensionData.wikibase)) {
    if (Object.hasOwn(entity.extensions.wikibase, key)) continue;
    (entity.extensions.wikibase as any)[key] = value;
  }
  return entity;
};

export const transformOldWikibaseEntityToExtension = <
  T extends
    | IDigitalEntity<IWikibaseDigitalEntityExtension>
    | IPhysicalEntity<IWikibaseDigitalEntityExtension>,
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

class BaseEntity implements IBaseEntity<IWikibaseDigitalEntityExtension> {
  _id: string = getObjectId();

  extensions = createWikibaseExtension();

  title = '';
  description = '';

  externalId = new Array<ITypeValueTuple>();
  externalLink = new Array<IDescriptionValueTuple>();
  biblioRefs = new Array<IDescriptionValueTuple>();
  other = new Array<IDescriptionValueTuple>();

  metadata_files = new Array<IFile>();

  persons = new Array<Person>();
  institutions = new Array<Institution>();

  constructor(obj: Partial<IBaseEntity> = {}) {
    this._id = obj._id ?? this._id;

    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      switch (key) {
        case 'persons':
          (value as IPerson[]).forEach(p => this.addPerson(p));
          break;
        case 'institutions':
          (value as IInstitution[]).forEach(i => this.addInstitution(i));
          break;
        case 'extensions':
          if ((value as any).wikibase) {
            this.extensions.wikibase = { ...this.extensions.wikibase, ...(value as any).wikibase };
          }
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[key] = value;
      }
    }
  }

  get properties() {
    return Object.keys(this);
  }

  public addPerson(person: Partial<IPerson> = {}) {
    this.persons.push(new Person(person));
  }

  public addInstitution(institution: Partial<IInstitution> = {}) {
    this.institutions.push(new Institution(institution));
  }

  public static checkIsValid(entity: BaseEntity): boolean {
    const {
      /* _id,
      persons,
      institutions, */
      title,
      description,
      externalId,
      externalLink,
      biblioRefs,
      other,
      metadata_files,
    } = entity;

    // Every entity needs a title
    if (empty(title)) return false;

    // Every entity needs a description
    if (empty(description)) return false;

    // Any existing external identifier needs all fields filled
    if (emptyProps(externalId)) return false;

    // Any existing external link needs all fields filled
    if (emptyProps(externalLink)) return false;

    // Any existing bibliographic reference needs a value
    if (emptyProps(biblioRefs, ['value'])) return false;

    // Any additional information added as 'other' needs all fields filled
    if (emptyProps(other)) return false;

    // Any added metadata file needs correctly filled fields
    if (emptyProps(metadata_files)) return false;

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: "Abstract methods can only appear within an abstract class"
  abstract get isPhysical(): this is IDigitalEntity;
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore: "Abstract methods can only appear within an abstract class"
  abstract get isDigital(): this is IPhysicalEntity;
}

class DigitalEntity extends BaseEntity implements IDigitalEntity<IWikibaseDigitalEntityExtension> {
  type = '';
  licence = '';

  discipline = new Array<string>();
  tags = new Array<Tag>();

  dimensions = new Array<IDimensionTuple>();
  creation = new Array<ICreationTuple>();
  files = new Array<IFile>();

  statement = '';
  objecttype = '';

  hierarchies = [];

  phyObjs = new Array<PhysicalEntity>();

  constructor(obj: Partial<IDigitalEntity> = {}) {
    super(obj);
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      switch (key) {
        case 'persons':
        case 'institutions':
          break;
        case 'tags':
          (value as ITag[]).forEach(t => this.addTag(t));
          break;
        case 'phyObjs':
          (value as IPhysicalEntity[]).forEach(p => this.addPhysicalEntity(p));
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[key] = value;
      }
    }
  }

  public addPhysicalEntity(physical: Partial<IPhysicalEntity>) {
    this.phyObjs.push(new PhysicalEntity(physical));
  }

  public addTag(tag: Partial<ITag>) {
    this.tags.push(new Tag(tag));
  }

  public static hasRightsOwner(entity: DigitalEntity): boolean {
    const { persons, institutions, _id } = entity;
    if (!persons.find(p => Person.hasRole(p, _id, 'RIGHTS_OWNER')))
      if (!institutions.find(i => Institution.hasRole(i, _id, 'RIGHTS_OWNER'))) return false;
    return true;
  }

  public static hasContactPerson(entity: DigitalEntity): boolean {
    const { persons, _id } = entity;
    return !!persons.find(p => Person.hasRole(p, _id, 'CONTACT_PERSON'));
  }

  public static checkValidLicence(entity: DigitalEntity) {
    const licence = entity.extensions.wikibase?.licence;
    if (!licence) return false;
    return true;
  }

  public static checkValidRelatedAgents(entity: DigitalEntity) {
    let has_creator = false;
    let has_rightsowner = false;
    for (const agent of entity.extensions.wikibase?.agents ?? []) {
      if (has_creator && has_rightsowner) {
        return true;
      }
      if (agent.roleTitle === 'Creator') {
        has_creator = true;
      }
      if (agent.roleTitle === 'Rightsowner') {
        has_rightsowner = true;
      }
    }

    return has_creator && has_rightsowner;
  }

  public static checkValidGeneralInfo(entity: DigitalEntity) {
    if (empty(entity.extensions.wikibase?.label?.['en'])) return false;
    if (empty(entity.extensions.wikibase?.description?.['en'])) return false;
    return true;
  }

  get isPhysical() {
    return false;
  }

  get isDigital() {
    return true;
  }

  public static override checkIsValid(entity: DigitalEntity): boolean {
    console.debug('DigitalEntity.checkIsValid', entity, {
      validGeneralInfo: DigitalEntity.checkValidGeneralInfo(entity),
      validRelatedAgents: DigitalEntity.checkValidRelatedAgents(entity),
      validLicence: DigitalEntity.checkValidLicence(entity),
    });
    return (
      DigitalEntity.checkValidGeneralInfo(entity) &&
      DigitalEntity.checkValidRelatedAgents(entity) &&
      DigitalEntity.checkValidLicence(entity)
    );
  }
}

class PhysicalEntity
  extends BaseEntity
  implements IPhysicalEntity<IWikibaseDigitalEntityExtension>
{
  place = new PlaceTuple();
  collection = '';

  constructor(obj: Partial<IPhysicalEntity> = {}) {
    super(obj);
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      switch (key) {
        case 'persons':
        case 'institutions':
          break;
        case 'place':
          this.place = new PlaceTuple(value as IPlaceTuple);
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[key] = value;
      }
    }
  }

  public setAddress(address: Partial<IAddress>) {
    this.place.setAddress(address);
  }

  public static override checkIsValid(entity: PhysicalEntity): boolean {
    if (!BaseEntity.checkIsValid(entity)) return false;

    if (!entity.place.isValid) return false;

    return true;
  }

  get isPhysical() {
    return true;
  }

  get isDigital() {
    return false;
  }
}

class Person implements IPerson {
  _id: string = getObjectId();

  prename = '';
  name = '';

  roles: IRelatedMap<string[]> = {};
  institutions: IRelatedMap<Institution[]> = {};
  contact_references: IRelatedMap<IContact> = {};

  constructor(obj: Partial<IPerson> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      switch (key) {
        case 'institutions':
          for (const [id, insts] of Object.entries(value as IRelatedMap<Institution[]>)) {
            insts?.forEach(i => this.addInstitution(i, id));
          }
          break;
        case 'contact_references':
          for (const [id, contact] of Object.entries(value as IRelatedMap<IContact>)) {
            if (!contact) continue;
            this.setContactRef(contact, id);
          }
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[key] = value;
      }
    }
  }

  get fullName() {
    return `${this.prename} ${this.name}`;
  }

  public addInstitution(inst: IInstitution, relatedId: string) {
    relatedId = relatedId.toString();
    if (!this.institutions[relatedId]) this.institutions[relatedId] = new Array<Institution>();
    (this.institutions[relatedId] as Institution[]).push(new Institution(inst));
  }

  public static getRelatedInstitutions(person: Person, relatedId: string) {
    return person.institutions[relatedId.toString()] ?? new Array<Institution>();
  }

  public static getMostRecentContactRef(person: Person) {
    let mostRecent: ContactReference | undefined;
    for (const contact of Object.values(person.contact_references)) {
      if (!contact) continue;
      const patched = new ContactReference(contact);
      if (!ContactReference.checkIsValid(contact)) continue;
      if (patched.creation_date > (mostRecent?.creation_date ?? 0)) mostRecent = patched;
    }
    return mostRecent ? mostRecent : new ContactReference();
  }

  public static getValidContactRefs(person: Person) {
    const map = new Map<string, ContactReference>();
    for (const contact of Object.values(person.contact_references)) {
      if (!contact) continue;
      const patched = new ContactReference(contact);
      if (!ContactReference.checkIsValid(contact)) continue;
      map.set(patched._id.toString(), patched);
    }
    return Array.from(map.values());
  }

  public setContactRef(contact: IContact, relatedId: string) {
    this.contact_references[relatedId.toString()] = new ContactReference(contact);
  }

  public static getRelatedContactRef(person: Person, relatedId: string) {
    return person.contact_references[relatedId.toString()] ?? new ContactReference();
  }

  public static getRelatedRoles(person: Person, relatedId: string) {
    return person.roles[relatedId.toString()] ?? new Array<string>();
  }

  public static hasRole(person: Person, relatedId: string, role: string) {
    return Person.getRelatedRoles(person, relatedId).includes(role);
  }

  public setRoles(roles: string[], relatedId: string) {
    relatedId = relatedId.toString();
    this.roles[relatedId] = roles;
  }

  public static checkIsValid(person: Person, relatedId: string): boolean {
    const { prename, name } = person;

    // Every person needs a prename
    if (empty(prename)) return false;

    // Every person needs a name
    if (empty(name)) return false;

    // Every person needs atleast 1 role
    const roles = Person.getRelatedRoles(person, relatedId);
    if (empty(roles)) return false;

    // Contact persons need a mail address
    const contact = Person.getRelatedContactRef(person, relatedId);
    const mail = contact?.mail ?? '';
    if (roles?.includes('CONTACT_PERSON') && empty(mail)) return false;

    // Every institution attached to a person needs to be valid
    // Institutions in persons should only be shallow references, so they don't
    // actually need to be valid
    /*const institutions = Person.getRelatedInstitutions(person, relatedId);
    if (institutions.find(i => !Institution.checkIsValid(i, relatedId))) return false;*/

    return true;
  }
}

class Institution implements IInstitution {
  _id: string = getObjectId();

  name = '';
  university = '';

  roles: IRelatedMap<string[]> = {};
  notes: IRelatedMap<string> = {};
  addresses: IRelatedMap<Address> = {};

  constructor(obj: Partial<IInstitution> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      switch (key) {
        case 'addresses':
          for (const [id, addr] of Object.entries(value as IRelatedMap<Address>)) {
            if (!addr) continue;
            this.setAddress(addr, id);
          }
          break;
        default:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any)[key] = value;
      }
    }
  }

  public setAddress(inst: IAddress, relatedId: string) {
    relatedId = relatedId.toString();
    this.addresses[relatedId] = new Address(inst);
  }

  public setRoles(roles: string[], relatedId: string) {
    relatedId = relatedId.toString();
    this.roles[relatedId] = roles;
  }

  public static getMostRecentAddress(inst: Institution) {
    let mostRecent: Address | undefined;
    for (const address of Object.values(inst.addresses)) {
      if (!address) continue;
      const patched = new Address(address);
      if (!Address.checkIsValid(address)) continue;
      if (patched.creation_date > (mostRecent?.creation_date ?? 0)) mostRecent = patched;
    }
    return mostRecent ? mostRecent : new Address();
  }

  public static getValidAddresses(inst: Institution) {
    const map = new Map<string, Address>();
    for (const address of Object.values(inst.addresses)) {
      if (!address) continue;
      const patched = new Address(address);
      if (!Address.checkIsValid(address)) continue;
      map.set(patched._id.toString(), patched);
    }
    return Array.from(map.values());
  }

  public static getRelatedAddress(inst: Institution, relatedId: string) {
    return inst.addresses[relatedId.toString()] ?? new Address();
  }

  public static getRelatedRoles(inst: Institution, relatedId: string) {
    return inst.roles[relatedId.toString()] ?? [];
  }

  public static hasRole(inst: Institution, relatedId: string, role: string) {
    return Institution.getRelatedRoles(inst, relatedId).includes(role);
  }

  public static checkIsValid(inst: Institution, relatedId: string): boolean {
    // Every institution needs a name
    if (empty(inst.name)) return false;

    relatedId = relatedId.toString();
    // Every institution needs atleast 1 role
    const roles = Institution.getRelatedRoles(inst, relatedId);
    if (empty(roles)) return false;

    // Every institution needs a valid address
    const address = Institution.getRelatedAddress(inst, relatedId);
    if (!Address.checkIsValid(address)) return false;

    return true;
  }
}

class Tag implements ITag {
  _id: string = getObjectId();

  value = '';

  constructor(obj: Partial<ITag> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get isValid() {
    return Tag.checkIsValid(this);
  }

  public static checkIsValid(tag: ITag): boolean {
    if (empty(tag.value)) return false;

    return true;
  }
}

class Address implements IAddress {
  _id: string = getObjectId();

  building = '';
  number = '';
  street = '';
  postcode = '';
  city = '';
  country = '';
  // Internal & only used to sort addresses
  creation_date = Date.now();

  constructor(obj: Partial<IAddress> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get infoString() {
    const joined = [this.country, this.postcode, this.city, this.street, this.number, this.building]
      .filter(_ => _)
      .join(' ');
    return joined.trim().length === 0 ? 'Empty Address' : joined;
  }

  get isValid() {
    return Address.checkIsValid(this);
  }

  public static checkIsValid(address: IAddress): boolean {
    if (empty(address.street)) return false;
    if (empty(address.postcode)) return false;
    if (empty(address.city)) return false;
    if (empty(address.country)) return false;

    return true;
  }
}

class ContactReference implements IContact {
  _id: string = getObjectId();

  mail = '';
  phonenumber = '';
  note = '';

  // Internal & only used to sort contact references
  creation_date = Date.now();

  constructor(obj: Partial<IContact> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get infoString() {
    const joined = [this.mail, this.phonenumber, this.note].filter(_ => _).join(' ');
    return joined.trim().length === 0 ? 'Empty conact reference' : joined;
  }

  get isValid() {
    return ContactReference.checkIsValid(this);
  }

  public static checkIsValid(contact: IContact): boolean {
    if (empty(contact.mail)) return false;

    return true;
  }
}

class DimensionTuple implements IDimensionTuple {
  type = '';
  value = '';
  name = '';

  constructor(obj: Partial<IDimensionTuple> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get isValid() {
    return DimensionTuple.checkIsValid(this);
  }

  public static checkIsValid(dimension: IDimensionTuple): boolean {
    if (empty(dimension.type)) return false;
    if (empty(dimension.value)) return false;
    if (empty(dimension.name)) return false;

    return true;
  }
}

class TypeValueTuple implements ITypeValueTuple {
  type = '';
  value = '';

  constructor(obj: Partial<ITypeValueTuple> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get isValid() {
    return TypeValueTuple.checkIsValid(this);
  }

  public static checkIsValid(obj: ITypeValueTuple): boolean {
    if (empty(obj.type)) return false;
    if (empty(obj.value)) return false;

    return true;
  }
}

class CreationTuple implements ICreationTuple {
  technique = '';
  program = '';
  equipment = '';
  date = '';

  constructor(obj: Partial<ICreationTuple> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get isValid() {
    return CreationTuple.checkIsValid(this);
  }

  public static checkIsValid(obj: ICreationTuple): boolean {
    if (empty(obj.technique)) return false;
    if (empty(obj.program)) return false;
    //if (empty(obj.equipment)) return false;
    //if (empty(obj.date)) return false;

    return true;
  }
}

class DescriptionValueTuple implements IDescriptionValueTuple {
  description = '';
  value = '';

  constructor(obj: Partial<IDescriptionValueTuple> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  get isValid() {
    return DescriptionValueTuple.checkIsValid(this);
  }

  public static checkIsValid(obj: IDescriptionValueTuple, requireDescription = true): boolean {
    if (requireDescription && empty(obj.description)) return false;
    if (empty(obj.value)) return false;

    return true;
  }
}

class PlaceTuple implements IPlaceTuple {
  name = '';
  geopolarea = '';
  address = new Address();

  constructor(obj: Partial<IPlaceTuple> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switch (key) {
        case 'address':
          this.address = new Address(value as IAddress);
          break;
        default:
          (this as any)[key] = value;
      }
    }
  }

  public setAddress(address: Partial<IAddress>) {
    this.address = new Address(address);
  }

  get isValid() {
    return PlaceTuple.checkIsValid(this);
  }

  public static checkIsValid(place: IPlaceTuple): boolean {
    if (empty(place.name) && empty(place.geopolarea) && !Address.checkIsValid(place.address))
      return false;

    return true;
  }
}

class FileTuple implements IFile {
  file_name = '';
  file_link = '';
  file_size = 0;
  file_format = '';

  constructor(obj: Partial<IFile> = {}) {
    for (const [key, value] of Object.entries(obj)) {
      if (!Object.prototype.hasOwnProperty.call(this, key)) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[key] = value;
    }
  }

  public static checkIsValid(file: IFile): boolean {
    if (empty(file.file_name)) return false;
    if (empty(file.file_link)) return false;

    return true;
  }
}

type AnyEntity = DigitalEntity | PhysicalEntity;

export {
  type AnyEntity,
  DigitalEntity,
  PhysicalEntity,
  Institution,
  Person,
  Tag,
  Address,
  ContactReference,
  DimensionTuple,
  TypeValueTuple,
  CreationTuple,
  DescriptionValueTuple,
  PlaceTuple,
  FileTuple,
  WikibaseItem,
  MediaAgent,
};
