import { getRegisteredType, registerType } from "./type-registry.js";

export interface EnumValue {
  /**
   * The numeric enum value. This is the value that will be stored in the
   * database, and should be unique within the enum.
   */
  value: number; // TODO: Support string-valued enums?
  /**
   * Documentation for this value. In general you can use JSDoc comments above
   * this value instead of filling out this field, but since those comments are
   * extracted via static analysis, you may need to put them here if you're
   * generating enums dynamically.
   */
  comments?: string;
  /**
   * Whether this enum value is deprecated, and why. This will be marked in
   * generated code.
   */
  deprecated?: string;
}

// High level representation of an enum type.
export interface EnumType<V extends string = string> {
  type: "enum";

  /**
   * The name of the type. This is used in generated code and should be unique
   * within a schema.
   */
  name: string;
  /**
   * Values is a map from the short name of the value to its ordinal (and optional comments/configs). The
   */
  values: {
    [shortName in V]: EnumValue;
  };

  /**
   * Documentation for this enum. In general you can use JSDoc comments above
   * this value instead of filling out this field, but since those comments are
   * extracted via static analysis, you may need to put them here if you're
   * generating enums dynamically.
   */
  comments?: string;

  /**
   * Whether this enum as a whole is deprecated, and why. This will be marked in
   * generated code.
   */
  deprecated?: string;
}

export type EnumConfig = Omit<EnumType, "type" | "values" | "name">;

/**
 * Creates a new enum type. An enum can be one of several defined values.
 * @param name The name of the enum type, which will be used in generated code.
 * @param values The possible values of the enum. Each key is a string, and the
 * value is a number. Optionally, you can specify the value, a deprecated flag,
 * and comments for each value.
 * @param config Extra configuration options for the enum.
 * @returns A new enum type that can be used when defining fields.
 * @example
 * export const Rank = enumType("Rank", {
 *   Beginner: 0, // This is the default value, but also the zero value
 *   Intermediate: { value: 1, deprecated: true },
 *   Expert: 2,
 *   Enlightened: deprecated(3, "Nobody ever achieved this rank"),
 * });
 * export const Player = itemType("Player", {
 *   fields: {
 *     rank: {
 *       type: Rank,
 *       // If the field was required (the default) you couldn't use the
 *       // zero (Beginner) value
 *       required: false,
 *     },
 *   },
 * });
 */
export function enumType<V extends string>(
  name: string,
  values: { [name in V]: number | EnumValue },
  config: EnumConfig = {},
): EnumType<V> {
  const cached = getRegisteredType(name, "enum");
  if (cached) {
    return cached as EnumType<V>;
  }

  const enumValues: EnumType<V>["values"] = {} as EnumType<V>["values"];
  for (const [valueName, valueNum] of Object.entries<
    // TODO: I don't understand why we need to specify the type here
    number | EnumValue
  >(values)) {
    let val: EnumValue;
    if (typeof valueNum === "number") {
      val = {
        value: valueNum,
      };
    } else {
      val = valueNum;
    }
    enumValues[valueName as V] = val;
  }
  const schemaType: EnumType<V> = {
    type: "enum",
    name,
    values: enumValues,
    comments: config.comments,
    deprecated: config.deprecated,
  };
  return registerType(schemaType);
}
