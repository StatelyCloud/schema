/**
 * This module exports all the types and helpers required to express Stately
 * schema in TypeScript. Consumers of this module should directly import what
 * they need into their schema definitions.
 */
export { enumType, type EnumConfig } from "./enum.js";
export type { Field, FieldFromMetadata, FieldInitialValue } from "./fields.js";
export {
  itemType,
  objectType,
  type Fields,
  type GroupLocalIndexConfig,
  type ItemTypeConfig,
  type PathTemplate,
  type PropertyPath,
  type TTLConfig,
} from "./item-types.js";
export type { Deferred, Plural } from "./type-util.js";
export {
  arrayOf,
  bool,
  bytes,
  double,
  durationMilliseconds,
  durationSeconds,
  int,
  int32,
  keyPath,
  // mapOf,
  // pointerTo,
  string,
  timestampMicroseconds,
  timestampMilliseconds,
  timestampSeconds,
  type,
  uint,
  uint32,
  url,
  uuid,
  type SchemaType,
} from "./types.js";
