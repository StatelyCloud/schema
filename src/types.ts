import { EnumType } from "./enum.js";
import { SchemaError } from "./errors.js";
import { ItemType, ObjectType } from "./item-types.js";
import { getRegisteredType, registerType } from "./type-registry.js";
import { Deferred, Plural, resolveDeferred, resolvePlural } from "./type-util.js";

/**
 * @generated from enum google.protobuf.FieldDescriptorProto.Type and then copied/modified here.
 */
export enum ProtoScalarType {
  /**
   * 0 is reserved for errors.
   * Order is weird for historical reasons.
   *
   * @generated from enum value: TYPE_DOUBLE = 1;
   */
  DOUBLE = 1,
  /**
   * @generated from enum value: TYPE_FLOAT = 2;
   */
  FLOAT = 2,
  /**
   * Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT64 if
   * negative values are likely.
   *
   * @generated from enum value: TYPE_INT64 = 3;
   */
  INT64 = 3,
  /**
   * @generated from enum value: TYPE_UINT64 = 4;
   */
  UINT64 = 4,
  /**
   * Not ZigZag encoded.  Negative numbers take 10 bytes.  Use TYPE_SINT32 if
   * negative values are likely.
   *
   * @generated from enum value: TYPE_INT32 = 5;
   */
  INT32 = 5,
  /**
   * @generated from enum value: TYPE_FIXED64 = 6;
   */
  FIXED64 = 6,
  /**
   * @generated from enum value: TYPE_FIXED32 = 7;
   */
  FIXED32 = 7,
  /**
   * @generated from enum value: TYPE_BOOL = 8;
   */
  BOOL = 8,
  /**
   * @generated from enum value: TYPE_STRING = 9;
   */
  STRING = 9,
  /**
   * New in version 2.
   *
   * @generated from enum value: TYPE_BYTES = 12;
   */
  BYTES = 12,
  /**
   * @generated from enum value: TYPE_UINT32 = 13;
   */
  UINT32 = 13,
  /**
   * @generated from enum value: TYPE_ENUM = 14;
   */
  ENUM = 14,
  /**
   * @generated from enum value: TYPE_SFIXED32 = 15;
   */
  SFIXED32 = 15,
  /**
   * @generated from enum value: TYPE_SFIXED64 = 16;
   */
  SFIXED64 = 16,
  /**
   * Uses ZigZag encoding.
   *
   * @generated from enum value: TYPE_SINT32 = 17;
   */
  SINT32 = 17,
  /**
   * Uses ZigZag encoding.
   *
   * @generated from enum value: TYPE_SINT64 = 18;
   */
  SINT64 = 18,
}

export interface Validation {
  /**
   * A CEL (Common Expression Language) expression that will be used to validate
   * this type. If data of this type does not pass the validation expression, it
   * will be rejected.
   * @see https://github.com/bufbuild/protovalidate/blob/main/docs/cel.md
   * @example
   * export const Name = type("name", string, { valid: "size(this) >= 1" });
   */
  valid: string;
  /**
   * A human-readable message that will be returned if the validation fails.
   */
  message: string;
}

export type Validations = Plural<string | Validation>;

export interface TypeAlias {
  type: "alias";

  name: string;
  /**
   * The type this type is based on. This can either be an underlying protobuf
   * scalar type, or another Stately SchemaType, or a basic protobuf message or
   * enum type.
   */
  parentType: ProtoScalarType | SchemaType;
  /**
   * Is this an array type? If true, the type is an array of the parent type.
   */
  array?: boolean;

  /**
   * Whether this type as a whole is deprecated, and why. This will be marked in
   * generated code.
   */
  deprecated?: string;

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
  valid?: Validations;

  /**
   * Documentation for this type. In general you can use JSDoc comments above
   * this value instead of filling out this field, but since those comments are
   * extracted via static analysis, you may need to put them here if you're
   * generating types dynamically.
   */
  comments?: string;

  /**
   * By default, the type() function will create a type alias, which can be used
   * in generated code to provide a more human-readable name for a type. Setting
   * this option to true will not create an alias, so the type used will be the
   * parent type.
   */
  noAlias?: boolean;
}

/**
 * SchemaType specifies a reusable type that can be used in the Stately schema
 * system. This could be a "top level" item type, or a type that is referenced
 * from within other item or object types. `itemType`, `objectType`, `enumType`,
 * and `type` can be used to make new types, or you can use existing types such
 * as `string`, `uuid`, etc. These types carry validation information as well,
 * to reduce duplication.
 */
export type SchemaType = ItemType | ObjectType | EnumType | TypeAlias;

/**
 * The configuration arguments for the type function.
 */
export type TypeAliasConfig = Omit<TypeAlias, "type" | "parentType" | "array" | "name">;

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
  parentType: SchemaType | ProtoScalarType,
  config: TypeAliasConfig = {},
): SchemaType {
  const fullConfig = { ...config, parentType };
  const cached = getRegisteredType(name, "type", fullConfig);
  if (cached) {
    return cached;
  }
  const schema: TypeAlias = {
    ...config,
    parentType,
    name,
    type: "alias",
  };
  return registerType("type", schema, fullConfig);
}

/**
 * arrayOf creates a new SchemaType that is an array of the given type. The
 * parent type may also be a function that
 * returns a SchemaType, to allow for circular references.
 */
export function arrayOf(type: Deferred<SchemaType>): Deferred<TypeAlias> {
  return () => {
    const resolvedType = resolveDeferred(type);
    if (resolvedType.type === "alias" && resolvedType.array) {
      throw new SchemaError(
        "SchemaNestedArrays",
        `${resolvedType.name} is already an array, and nested arrays are not supported. Consider making a wrapper type with 'objectType'.`,
      );
    }
    return {
      parentType: resolvedType,
      name: `${resolvedType.name}[]`,
      array: true,
      type: "alias",
      noAlias: true,
    };
  };
}

export interface TypeInfo {
  underlyingType: Exclude<TypeAlias["parentType"], TypeAlias>;
  repeated: boolean;
  /**
   * CEL expressions that should all be used to validate this type. These are
   * cumulative.
   */
  validations: Validation[];
  interpretAs?: TypeAlias["interpretAs"];
}

/**
 * Since types can be nested/extended, we often need to get information about
 * the type such as the base underlying type, the effective default, etc. This
 * function resolves all of that.
 * @private this is used in various places.
 */
export function resolveType(type: SchemaType): TypeInfo {
  const validations: Validation[] = [];

  let underlyingType: Exclude<TypeAlias["parentType"], TypeAlias> | undefined;
  let repeated = false;
  let interpretAs: TypeAlias["interpretAs"] | undefined;

  if (type.type !== "alias") {
    return {
      underlyingType: type,
      repeated: false,
      validations,
    };
  }

  // Iterate through a chain of types to determine the set of resolved options.
  let currentType: TypeAlias = type;
  outer: while (currentType) {
    // Once it's set to repeated, it stays that way.
    repeated ||= Boolean(currentType.array);

    // Only take the "topmost" interpretAs value.
    if (!interpretAs && currentType.interpretAs) {
      interpretAs = currentType.interpretAs;
    }

    // Accumulate all validations.
    if (currentType.valid) {
      validations.push(
        ...resolvePlural(currentType.valid).map((v) =>
          typeof v === "string" ? { valid: v, message: "" } : v,
        ),
      );
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
    throw new SchemaError("SchemaUnknownType", `No field type or type name found for ${type.name}`);
  }

  // For repeated types, we need to validate each element in the list using the
  // type's validations, instead of validating the array as a whole.
  if (repeated) {
    for (const v of validations) {
      v.valid = `this.all(v, ${v.valid.replace(/this/g, "v")})`;
    }
  }

  return {
    underlyingType,
    repeated,
    validations,
    interpretAs,
  };
}

/**
 * deprecated transforms a type into a deprecated version of itself. This can be
 * used to mark a type as deprecated, or to mark a specific value as deprecated.
 * @param config The type to deprecate
 * @example
 * export const GameType = enumType("GameType", {
 *  Magic: 1,
 *  Lorcana: 2,
 *  StarWarsDestiny: deprecated(3, "No longer sold as of 2020"),
 * });
 */
export function deprecated<T extends { deprecated?: string } | number>(
  config: T,
  deprecatedReason: string,
): T {
  if (typeof config === "number") {
    // Maybe not...
    return { deprecated: deprecatedReason, value: config } as unknown as T;
  } else if (typeof config === "object") {
    return { ...config, deprecated: deprecatedReason };
  } else {
    throw new SchemaError("InvalidArgument", `Invalid argument passed to deprecated`);
  }
}
