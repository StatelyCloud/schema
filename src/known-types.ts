import { ProtoScalarType, type } from "./types.js";

/*
 * Stately's "well known types" which expose some basic protobuf types plus our
 * own extensions. We intentionally don't expose all protobuf types for now -
 * instead we expose a useful subset.
 */

/** A boolean (true/false) value. The default is false. */
export const bool = type("bool", ProtoScalarType.BOOL, { noAlias: true });
/** A UTF-8 string. The default is an empty string. */
export const string = type("string", ProtoScalarType.STRING, { noAlias: true });
/** A 64-bit signed integer. The default is 0. */
export const int = type("int", ProtoScalarType.SINT64, { noAlias: true });
/** A 64-bit unsigned integer. The default is 0. */
export const uint = type("uint", ProtoScalarType.UINT64, { noAlias: true });
/**
 * A 32-bit signed integer. The default is 0. This may be preferable to an int
 * when targeting JavaScript, since it can be represented as a number instead of
 * a BigInt.
 */
export const int32 = type("int32", ProtoScalarType.SINT32, { noAlias: true });
/**
 * A 32-bit unsigned integer. The default is 0. This may be preferable to a uint
 * when targeting JavaScript, since it can be represented as a number instead of
 * a BigInt.
 */
export const uint32 = type("uint32", ProtoScalarType.UINT32, { noAlias: true });
/** A 64-bit floating-point number. The default is 0.0. */
export const double = type("double", ProtoScalarType.DOUBLE, { noAlias: true });
/** A 32-bit floating-point number. The default is 0.0. */
export const float = type("float", ProtoScalarType.FLOAT, { noAlias: true });

// export const jsint = type("jsint", ProtoScalarType.SINT64, {
//   // Ensure that the value is between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
//   valid: "this < 9007199254740991 && this > -9007199254740991",
// });
// export const jsuint = type("jsuint", ProtoScalarType.UINT64, {
//   // Ensure that the value is between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
//   valid: "this < 9007199254740991",
// });

/** A byte array. The default is an empty array. */
export const bytes = type("byte[]", ProtoScalarType.BYTES, { noAlias: true });

/** A 128-bit UUID. The default is null. */
export const uuid = type("uuid", bytes, {
  interpretAs: "uuid",
  valid: "size(this) == 0 || size(this) == 16",
  // This shouldn't be an alias because it's special-cased in the codegen.
  noAlias: true,
});

/**
 * A URL. The url may be relative (a path, without a host) or absolute (starting
 * with a scheme). Setting an invalid URL will cause the field to be invalid.
 *
 * Right now, URLs are treated as strings, but in the future, generated SDKs
 * will use the platform's preferred URL type, and you'll be able to use
 * URL-specific methods and properties in validations.
 */
export const url = type("url", string, {
  interpretAs: "url",
  // valid: "this.scheme == 'https' && this.domain == 'gist.github.com'",
  noAlias: true,
});

/**
 * A Stately key path. This is a string that represents a path to an item in the
 * database. The key path will be validated to ensure it is well-formed.
 */
export const keyPath = type("keyPath", string, {
  interpretAs: "keyPath",
  noAlias: true,
});

/* Timestamps */

/** A timestamp with second resolution since the Unix epoch. The default is Jan 1, 1970. */
export const timestampSeconds = type("timestampSeconds", int, {
  interpretAs: "timestampSeconds",
  noAlias: true,
});
/** A timestamp with millisecond resolution since the Unix epoch. The default is Jan 1, 1970. */
export const timestampMilliseconds = type("timestampMilliseconds", int, {
  interpretAs: "timestampMilliseconds",
  noAlias: true,
});
/** A timestamp with microsecond resolution since the Unix epoch. The default is Jan 1, 1970. */
export const timestampMicroseconds = type("timestampMicroseconds", int, {
  interpretAs: "timestampMicroseconds",
  noAlias: true,
});
/**
 * A microsecond resolution timestamp suitable for recording times after 1970.
 * It cannot represent times before 1970. The default is Jan 1, 1970.
 */
export const currentTimestampMicroseconds = type("futureTimestampMicroseconds", uint, {
  interpretAs: "timestampMicroseconds",
  noAlias: true,
});

/* Durations */

/** An duration in time with seconds resolution. The default is 0s. */
export const durationSeconds = type("durationSeconds", int, {
  interpretAs: "durationSeconds",
  noAlias: true,
});
/** An duration in time with milliseconds resolution. The default is 0s. */
export const durationMilliseconds = type("durationMilliseconds", int, {
  interpretAs: "durationMilliseconds",
  noAlias: true,
});
