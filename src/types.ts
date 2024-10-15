import { getExtension, hasExtension, isMessage } from "@bufbuild/protobuf";
import {
  DescriptorProto,
  DescriptorProtoSchema,
  EnumDescriptorProto,
  FieldDescriptorProto_Label,
  FieldDescriptorProto_Type,
} from "@bufbuild/protobuf/wkt";
import { message } from "./extensions_pb.js";
import { getRegisteredType, registerType } from "./type-registry.js";
import { Deferred, resolveDeferred } from "./type-util.js";

/**
 * SchemaType specifies a reusable type that can be used in the Stately schema
 * system. This could be a "top level" item type, or a type that is referenced
 * from within other item or object types. `itemType`, `objectType`, `enumType`,
 * and `type` can be used to make new types, or you can use existing types such
 * as `string`, `uuid`, etc. These types carry validation information as well,
 * to reduce duplication.
 */
export interface SchemaType {
  /**
   * A human-readable name for the type. This is used when printing errors or
   * debugging the type, and when generating code for the type.
   */
  name: string;
  /**
   * The type this type is based on. This can either be an underlying protobuf
   * scalar type, or another Stately SchemaType, or a basic protobuf message or
   * enum type.
   */
  parentType: FieldDescriptorProto_Type | SchemaType | EnumDescriptorProto | DescriptorProto;

  /**
   * Is this an array type? If true, the type is an array of the parent type.
   */
  array?: boolean;

  /**
   * The default value for this type. This is used when a field is not set. If
   * this isn't specified, the default is the "zero value" for the type - null
   * for messages, zero for numbers and enums, false for booleans, and empty for
   * arrays, strings and byte arrays.
   */
  // default?: string | number | bigint | boolean | null;

  /**
   * Documentation for this type, which will be used when generating code.
   */
  docs?: string;

  /**
   * Whether this type as a whole is deprecated. This can affect generated code.
   */
  deprecated?: boolean;

  /**
   * Options for reinterpreting scalar types. This is used to influence how code
   * is generated for the type, and what default validations it has.
   * @private this is only to be used by Stately's well-known types.
   */
  interpretAs?:
    | "uuid"
    | "timestampSeconds"
    | "timestampMilliseconds"
    | "timestampMicroseconds"
    | "durationSeconds"
    | "durationMilliseconds"
    | "keyPath"
    | "url";

  /**
   * A CEL (Common Expression Language) expression that will be used to validate
   * this type. If data of this type does not pass the validation expression, it
   * will be rejected.
   * @see https://github.com/bufbuild/protovalidate/blob/main/docs/cel.md
   * @example
   * export const Name = type("name", string, { valid: "size(this) >= 1" });
   */
  valid?: string;
}

/**
 * type creates a new SchemaType based on the given parent type and options,
 * which may be another SchemaType or a protobuf type.
 * @param name A human-readable name for the type.
 * @param parentType The type this type is based on. This can either be an
 * underlying protobuf scalar type, or another Stately SchemaType, or a basic
 * protobuf message or enum type.
 * @param config Additional options for the type, such as validation rules.
 * @example
 * export const Name = type("name", string, { valid: "this.length >= 1" });
 */
export function type(
  name: string,
  parentType: SchemaType["parentType"],
  config: Omit<SchemaType, "parentType" | "array" | "name"> = {},
): SchemaType {
  const fullConfig = { ...config, parentType };
  const cached = getRegisteredType(name, "type", fullConfig);
  if (cached) {
    return cached;
  }
  const schema: SchemaType = {
    ...config,
    parentType,
    name,
  };
  return registerType("type", schema, fullConfig);
}

/**
 * arrayOf creates a new SchemaType that is an array of the given type. The
 * parent type may also be a function that
 * returns a SchemaType, to allow for circular references.
 */
export function arrayOf(type: Deferred<SchemaType>): Deferred<SchemaType> {
  return () => {
    const resolvedType = resolveDeferred(type);
    if (resolvedType.array) {
      throw new Error(
        `${resolvedType.name} is already an array, and nested arrays are not supported. Consider making a wrapper type with 'objectType'.`,
      );
    }

    // omit validation rules from the array type, since we want them to apply to
    // each element, not the array itself.
    // TODO: find a way to apply these validation rules to each element.
    // https://app.clickup.com/t/8689jnfzt
    const { valid, ...propagatedProperties } = resolvedType;
    return {
      ...propagatedProperties,
      name: `${resolvedType.name}[]`,
      array: true,
    };
  };
}

/**
 * mapOf creates a new SchemaType that is an map with keys and values of the
 * given types.
 */
// TODO: implement this
// export function mapOf(keyType: Deferred<SchemaType>, valueType: Deferred<SchemaType>) {
//   const resolvedKeyType = resolveDeferred(keyType);
//   const resolvedValueType = resolveDeferred(valueType);

//   return {
//     name: `map<${resolvedKeyType.name}, ${resolvedValueType.name}>`,
//     parentType: resolvedKeyType,
//     map: resolvedValueType,
//   };
// }

/*
 * Stately's "well known types" which expose some basic protobuf types plus our
 * own extensions. We intentionally don't expose all protobuf types for now -
 * instead we expose a useful subset.
 */

/** A boolean (true/false) value. The default is false. */
export const bool = type("bool", FieldDescriptorProto_Type.BOOL);
/** A UTF-8 string. The default is an empty string. */
export const string = type("string", FieldDescriptorProto_Type.STRING);
/** A 64-bit signed integer. The default is 0. */
export const int = type("int", FieldDescriptorProto_Type.SINT64);
/** A 64-bit unsigned integer. The default is 0. */
export const uint = type("uint", FieldDescriptorProto_Type.UINT64);
/**
 * A 32-bit signed integer. The default is 0. This may be preferable to an int
 * when targeting JavaScript, since it can be represented as a number instead of
 * a BigInt.
 */
export const int32 = type("int", FieldDescriptorProto_Type.SINT64);
/**
 * A 32-bit unsigned integer. The default is 0. This may be preferable to a uint
 * when targeting JavaScript, since it can be represented as a number instead of
 * a BigInt.
 */
export const uint32 = type("uint", FieldDescriptorProto_Type.UINT64);
/** A 64-bit floating-point number. The default is 0.0. */
export const double = type("double", FieldDescriptorProto_Type.DOUBLE);
// export const jsint = type("jsint", FieldDescriptorProto_Type.SINT64, {
//   // Ensure that the value is between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
//   valid: "this < 9007199254740991 && this > -9007199254740991",
// });
// export const jsuint = type("jsuint", FieldDescriptorProto_Type.UINT64, {
//   // Ensure that the value is between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
//   valid: "this < 9007199254740991",
// });
/** A byte array. The default is an empty array. */
export const bytes = type("byte[]", FieldDescriptorProto_Type.BYTES);

/** A 128-bit UUID. The default is null. */
export const uuid = type("uuid", bytes, {
  interpretAs: "uuid",
  valid: "size(this) == 0 || size(this) == 16",
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
});

/**
 * A Stately key path. This is a string that represents a path to an item in the
 * database. The key path will be validated to ensure it is well-formed.
 */
export const keyPath = type("keyPath", string, {
  interpretAs: "keyPath",
});

/* Timestamps */

/** A timestamp with second resolution since the Unix epoch. The default is Jan 1, 1970. */
export const timestampSeconds = type("timestampSeconds", int, { interpretAs: "timestampSeconds" });
/** A timestamp with millisecond resolution since the Unix epoch. The default is Jan 1, 1970. */
export const timestampMilliseconds = type("timestampMilliseconds", int, {
  interpretAs: "timestampMilliseconds",
});
/** A timestamp with microsecond resolution since the Unix epoch. The default is Jan 1, 1970. */
export const timestampMicroseconds = type("timestampMicroseconds", int, {
  interpretAs: "timestampMicroseconds",
});
/**
 * A microsecond resolution timestamp suitable for recording times after 1970.
 * It cannot represent times before 1970. The default is Jan 1, 1970.
 */
export const currentTimestampMicroseconds = type("futureTimestampMicroseconds", uint, {
  interpretAs: "timestampMicroseconds",
});

/* Durations */

/** An duration in time with seconds resolution. The default is 0s. */
export const durationSeconds = type("durationSeconds", int, { interpretAs: "durationSeconds" });
/** An duration in time with milliseconds resolution. The default is 0s. */
export const durationMilliseconds = type("durationMilliseconds", int, {
  interpretAs: "durationMilliseconds",
});

/**
 * A pointer to another item type. This allows you to reference another item
 * elsewhere in the database by its key path.
 */
// export function pointerTo(dest: Deferred<SchemaType>): Deferred<SchemaType> {
//   return () => {
//     const descriptor = resolveDeferred(dest);
//     if (descriptor.array) {
//       throw new Error("Pointers cannot point to arrays.");
//     }
//     if (!isItemType(descriptor)) {
//       throw new Error("Pointers can only point to item types.");
//     }

//     // TODO: Pointers could actually be the minimal set of IDs required to
//     // *build* a key path for that item. In that case we'd really store a
//     // message with the type of the target item, and a special option that says
//     // "this is a pointer to that item".
//     // TODO: Right now these are indistinguishable from arbitrary key paths.
//     // We'd need a new option that explains what type this points to.
//     return type(`*${descriptor.name}`, string, {
//       interpretAs: "keyPath",
//     });
//   };
// }

/**
 * A helper to determine if a type is an item type.
 */
export function isItemType(type: SchemaType): boolean {
  const { underlyingType } = resolveType(type);
  if (!isMessage(underlyingType, DescriptorProtoSchema)) {
    return false;
  }

  // Item types must have a key path.
  if (underlyingType.options && hasExtension(underlyingType.options, message)) {
    const statelyOptions = getExtension(underlyingType.options, message);
    if (statelyOptions.keyPaths.length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Since types can be nested/extended, we often need to get information about
 * the type such as the base underlying type, the effective default, etc. This
 * function resolves all of that.
 * @private this is used in various places.
 */
export function resolveType(type: SchemaType): {
  underlyingType: Exclude<SchemaType["parentType"], SchemaType>;
  /**
   * The label for this field, e.g. if it is a repeated field.
   */
  label: FieldDescriptorProto_Label;
  /**
   * CEL expressions that should all be used to validate this type. These are
   * cumulative.
   */
  validations: string[];
  interpretAs?: SchemaType["interpretAs"];
} {
  const validations: string[] = [];

  let underlyingType: Exclude<SchemaType["parentType"], SchemaType> | undefined;
  let label: FieldDescriptorProto_Label | undefined;
  let interpretAs: SchemaType["interpretAs"] | undefined;

  // Iterate through a chain of types to determine the set of resolved options.
  let currentType: SchemaType = type;
  outer: while (currentType) {
    // Once it's set to repeated, it stays that way.
    if (label === undefined && currentType.array) {
      label = FieldDescriptorProto_Label.REPEATED;
    }

    // Only take the "topmost" interpretAs value.
    if (!interpretAs && currentType.interpretAs) {
      interpretAs = currentType.interpretAs;
    }

    // Accumulate all validations.
    if (currentType.valid) {
      validations.push(currentType.valid);
    }

    const parentType = currentType.parentType;
    switch (typeof parentType) {
      case "number":
      case "string":
        underlyingType = parentType;
        break outer;
      default:
        if ("parentType" in parentType) {
          currentType = parentType;
          break;
        } else {
          underlyingType = parentType;
          break outer;
        }
    }
  }

  if (!underlyingType) {
    throw new Error(`No field type or type name found for ${type.name}`);
  }

  return {
    underlyingType,
    // Default to optional if no label is set like protoc.
    label: label ?? FieldDescriptorProto_Label.OPTIONAL,
    validations,
    interpretAs,
  };
}
