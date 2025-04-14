/**
 * Describes the different ranks/roles a user can have.
 *
 * This rank/role is bound to the account, but can be changed by an administrator
 *
 * Ranks/Roles:
 * - user: any registered person
 * - uploadrequested: a registered person that sent an application to gain upload permission
 * - upload: a registered person with upload permission
 * - admin: site administrators
 */
export enum UserRank {
  user = 'user',
  uploadrequested = 'uploadrequested',
  uploader = 'uploader',
  admin = 'admin',
}

/**
 * Describes the different types of (document) collections that are used in
 * the MongoDB database.
 *
 * Note: this does not include account related (document) collections.
 */
export enum Collection {
  address = 'address',
  annotation = 'annotation',
  compilation = 'compilation',
  contact = 'contact',
  digitalentity = 'digitalentity',
  entity = 'entity',
  group = 'group',
  institution = 'institution',
  person = 'person',
  physicalentity = 'physicalentity',
  tag = 'tag',
}
