import { Field } from "./fields.js";
import { getRegisteredType, registerType } from "./type-registry.js";
import { Plural } from "./type-util.js";

/**
 * A PathTemplate is a url pattern that will be used to generate the path for an
 * item's Key Path. The template should be a valid URL Pattern as defined in
 * https://urlpattern.spec.whatwg.org/ (see also
 * https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API and
 * https://github.com/soongo/path-to-regexp). It should also be a valid Stately
 * key path when all variables are substituted into it. Each variable should
 * correspond to the name or field ID of a field in the parent message, and each
 * of those fields should be a number, string, or binary type.
 *
 * For example, a `User` message with fields `user_id` and `org_id` could have a
 * key path template of `/orgs-:org_id/users-:user_id`.
 */
export type PathTemplate = string;

/**
 * A string representation of a property path into this item's fields. At its
 * simplest it is just a property name, but it can also reference nested
 * properties, including digging into JSON/map fields. For example:
 *
 * - "name": the field "name"
 * - "address.city": the field "city" in the nested object "address"
 * - "address.city.id": the field "id" in the nested object "city" in the
 *   nested object "address"
 */
export type PropertyPath = string;

/**
 * The list of fields that can be defined on an item or object type. You can use
 * this type to declare fields outside an item type definition, and then
 * reference them in multiple item types.
 *
 * @example
 * const sharedFields: Fields = {
 *   name: {
 *     type: string,
 *   }
 * };
 *
 * export const ItemType1 = itemType("ItemType1", {
 *   keyPath: "/itemType1-:id",
 *   fields: {
 *     ...sharedFields,
 *     description: {
 *       type: string,
 *     },
 *   },
 * });
 */
export type Fields<FieldNames extends string = string> = Record<FieldNames, Field>;

export type FieldNames<T extends ItemType | ObjectType> =
  T extends ObjectType<infer V> ? V : T extends ItemType<infer V> ? V : never;

export interface ItemType<FieldNames extends string = string> {
  type: "item";

  /**
   * The name of the type. This is used in generated code and should be unique
   * within a schema.
   */
  name: string;

  /**
   * One or more key paths that determine where the item is stored in the database.
   */
  keyPath: Plural<PathTemplate | KeyPathConfig>;

  /**
   * The set of fields that are defined on this type.
   */
  fields: Fields<FieldNames>;

  /**
   * An optional TTL for the item, which will cause it to be automatically
   * deleted after some time.
   */
  ttl?: TTLConfig;

  /**
   * Whether or not an item type is syncable. Non-syncable item types will be
   * omitted from SyncList responses. Non-syncable items are cheaper to store
   * and write. The default is syncable. This can be overridden per key path.
   */
  syncable?: boolean;

  /**
   * Whether or not group versioning is enabled for this item type. Group
   * versioned items are optimized for transactions that modify multiple items
   * in the same group. All item types in a group must be versioned or not
   * versioned. The default is versioned. This can be overridden per key path.
   */
  versioned?: boolean;

  /**
   * An optional set of indexes that should be maintained for this item type.
   * You can have up to 4 group-local indexes.
   */
  // TODO: In the future this could be a union with other index types
  indexes?: GroupLocalIndexConfig[];

  /**
   * Field names that are no longer used but used to be. When removing or
   * renaming a field, the old field name should be added to this list to
   * prevent re-use.
   */
  reservedNames?: string[];

  /**
   * Whether this entire item type is deprecated and why. This can affect
   * generated code.
   */
  deprecated?: string;

  /**
   * Documentation for this type. In general you can use JSDoc comments above
   * this value instead of filling out this field, but since those comments are
   * extracted via static analysis, you may need to put them here if you're
   * generating types dynamically.
   */
  comments?: string;
}

/**
 * Configuration for item-level TTL. This consists of a source for the TTL
 * value, and either a constant value or a field reference.
 */
export type TTLConfig = {
  source: "fromCreated" | "fromLastModified" | "atTimestamp";
} & (
  | {
      field: PropertyPath;
    }
  | {
      durationSeconds: number;
    }
);

/**
 * Full configuration for a key path, including whether it is syncable and/or
 * versioned.
 */
export interface KeyPathConfig {
  /**
   * The path template for the key path.
   */
  path: PathTemplate;

  /**
   * Whether this individual key path is syncable. An item type can have some key
   * paths that are syncable and some that are not, as a way to control costs. If
   * this option is not specified here, it inherits the value of the item type's
   * `syncable` option, which defaults to `true`.
   */
  syncable?: boolean;

  /**
   * Whether or not group versioning is enabled for this individual key path.
   * This may save costs to turn off if different key paths in an item type
   * are in different groups, and this key path is not going to be involved in
   * transactions with other items in the same group. If this option is not
   * specified here, it inherits the value of the item type's `versioned` flag,
   * which defaults to `true`.
   */
  versioned?: boolean;

  /**
   * A list of additional indexes that should be maintained when persisting
   * this key path. Index key paths have a similar format to item key paths
   * with an additional segment to indicate which index is being referenced,
   * allowing you to extend StatelyDB single-table design semantics into your
   * indexes as well! StatelyDB supports two types of indexes:
   *
   * - Group-local indexes, which are optimized for sorting items that already belong to
   *   the same group. These indexes are strongly consistent and have no uniqueness constraint.
   *   To use one of these indexes, start a key path with the segment `/@LSI-{1-4}` which
   *   identifies which group-local index to use, followed by the rest of the path that
   *   should be used as the sort key for the index. For example:
   *
   *     keyPath: {
   *       path:    `/orgs-:org_id/users-:user_id`,
   *       indexes: `/@LSI-1/userEmail-:user_email`
   *     }
   *
   *   Uses the first group-local index with a sort key of `/userEmail-:email`.
   *
   *   Note: Group-local indexes inherit the partition key of the parent key path.
   *   This partition key is required when using list APIs and should be prepended to the
   *   LSI key path. In the example above, the partition key is `/orgs-:org_id`, so a
   *   fully-formed index path looks like: `/orgs-:org_id/@LSI-1/userEmail-:user_email`.
   *   For more about this read https://docs.stately.cloud/api/list/.
   *
   * - Global, eventually consistent indexes, which are optimized for queries that span
   *   multiple items in different groups. These indexes are a lot like adding an
   *   item-level key path, but are eventually consistent and have no uniqueness requirement.
   *   In a subset of cases these indexes can be more cost-effective than item-level key paths.
   *   To use a global index, create a new key-path prefixed with `/@GSI-{1-20}`
   *   this key path must be fully formed with a partition key and sort key.
   *   Before using one of these indexes, please consult with Stately support to ensure
   *   it is the right fit for your use case.
   */
  indexes?: Plural<PathTemplate>;
}

/**
 * Configuration for a group-local index.
 */
export interface GroupLocalIndexConfig {
  groupLocalIndex: 1 | 2 | 3 | 4;
  field: PropertyPath;
}

export type ItemTypeConfig<FieldNames extends string = string> = Omit<
  ItemType<FieldNames>,
  "name" | "type"
>;

/**
 * Create a new item type. These are the "top level" items that are stored in
 * StatelyDB, and include information not only about the shape of their data but
 * also their key paths, indexes, TTL, etc.
 */
export function itemType<FieldNames extends string>(
  name: string,
  itemTypeConfig: ItemTypeConfig<FieldNames>,
): ItemType<FieldNames> {
  const cachedType = getRegisteredType(name, "item");
  if (cachedType) {
    return cachedType as ItemType<FieldNames>;
  }
  const schemaType: ItemType<FieldNames> = { ...itemTypeConfig, name, type: "item" };
  return registerType(schemaType);
}

export type ObjectType<FieldNames extends string = string> = Pick<
  ItemType<FieldNames>,
  "name" | "fields" | "reservedNames" | "deprecated" | "comments"
> & {
  type: "object";
};
export type ObjectTypeConfig<FieldNames extends string = string> = Omit<
  ObjectType<FieldNames>,
  "type" | "name"
>;

/**
 * An object type is very much like an item type, but it can only be used as a
 * field of another item type or object type. In other words, it is meant for
 * nested structures.
 */
export function objectType<FieldNames extends string>(
  name: string,
  itemTypeConfig: ObjectTypeConfig<FieldNames>,
): ObjectType<FieldNames> {
  const cachedType = getRegisteredType(name, "object");
  if (cachedType) {
    return cachedType as ObjectType<FieldNames>;
  }
  const schemaType: ObjectType<FieldNames> = {
    ...itemTypeConfig,
    type: "object",
    name,
  };
  return registerType(schemaType);
}
