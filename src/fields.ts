import { Deferred } from "./type-util.js";
import { SchemaType, Validations } from "./types.js";

export interface FieldFromMetadata {
  /**
   * Derive the field's value from StatelyDB metadata. These are special values
   * that StatelyDB keeps track of for each item, but you must map them to
   * fields in the schema to use them.
   *
   * - `createdAtTime` and `lastModifiedAtTime` must only be set on a field that
   *   has a timestamp type (`timestampSeconds`, `timestampMilliseconds`, or
   *   `timestampMicroseconds`). These represent the time the database first
   *   created or last modified the item.
   *   These fields are read-only, any value seton one of these fields will be ignored
   *   when the item is written, unless the 'overwriteMetadataTimestamps' flag is set during
   *   the put operation.
   * - `createdAtVersion` and `lastModifiedAtVersion` must only be set on a
   *   field that has a `uint` type. These represent a monotonically increasing
   *   version number within a Group that tracks modifications of items and can
   *   be used to strictly order changes. Note that multiple items can have the
   *   same createdAt/lastModifiedAtVersion if they were created/modified in the
   *   same transaction, since they logically were modified at the same time.
   *   Both fields are read-only; any value set on one of these fields will be ignored
   *   when the item is written.
   *  - `ttl` must only be set on a field that has a timestamp type (`timestampSeconds`,
   *  `timestampMilliseconds`, or `timestampMicroseconds`). However, `timestampSeconds` is
   *  recommended as the other timestamp types will lose precision on a round-trip.
   *  When a non-zero value is provided on a TTL field during a Put, the item will be automatically
   *  deleted after the provided time has passed. The value must be a timestamp in the future,
   *  or an error will be returned. On a read, the value will be populated with a timestamp if
   *  the item has a TTL set on it. If no TTL is set, the field will be zero.
   */
  fromMetadata?:
    | "createdAtTime"
    | "lastModifiedAtTime"
    | "createdAtVersion"
    | "lastModifiedAtVersion"
    | "ttl";
}

export interface FieldInitialValue {
  /**
   * Setting `initialValue` instructs StatelyDB to automatically choose
   * the field's value when the item is created. This is especially useful
   * when `append`ing items, since the ID must be automatically selected.
   */
  initialValue?: "sequence" | "uuid" | "rand53";
}

// TODO: add a fields() function that allows inferring the type of the fields object

/**
 * A field in an item or object type. Each field has a specific type, and a
 * number that identifies it independently of its name.
 *
 * Fields will fail validation their value is not present (non-zero), unless
 * there is a default value set for that field (which can be set either here, or
 * as part of the field type). Fields with a default will reflect their default
 * value if they are not explicitly set.
 */
export type Field = {
  /**
   * The type of the field. There are a number of built-in types, and you can
   * create and reference your own types.
   */
  type: Deferred<SchemaType>;

  /**
   * Whether this field is deprecated, and why. This will be marked in
   * generated code.
   */
  deprecated?: string;

  /**
   * If a field is required, it must be set when creating an item of this type,
   * or the item will be invalid. A value is set as long as it is not the "zero
   * value" for the type - null for messages, zero for numbers and enums, false
   * for booleans, and empty for arrays, strings and byte arrays. The default if
   * this option is not provided is true - all fields are required unless set to
   * `required: false`.
   */
  required?: boolean;

  /**
   * Documentation for this field. In general you can use JSDoc comments above
   * this value instead of filling out this field, but since those comments are
   * extracted via static analysis, you may need to put them here if you're
   * generating enums dynamically.
   */
  comments?: string;

  /**
   * The default value for this field. This is returned on read when a field is
   * not set. This value won't actually be saved into the database. If this
   * isn't specified, the default is the "zero value" for the type - null for
   * messages, zero for numbers and enums, false for booleans, and empty for
   * arrays, strings and byte arrays. A required field cannot be the zero value.
   */
  readDefault?: unknown;

  /**
   * A CEL (Common Expression Language) expression that will be used to validate
   * this type. If data of this type does not pass the validation expression, it
   * will be rejected.
   * @see https://github.com/bufbuild/protovalidate/blob/main/docs/cel.md
   * @example
   * export const Name = type("name", string, { valid: "size(this) >= 1" });
   */
  valid?: Validations;
} & (FieldFromMetadata | FieldInitialValue) /* | FieldFromExpression */; // Only one of these options can be set:
