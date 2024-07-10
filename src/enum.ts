import { EnumDescriptorProto, EnumValueDescriptorProto, PartialMessage } from "@bufbuild/protobuf";
import { getRegisteredType, registerType } from "./type-registry.js";
import { SchemaType } from "./types.js";
import { validateName } from "./validate.js";

/** Options for defining an enum. Used in {@link enumType}. */
export interface EnumConfig {
  /**
   * The default value of the enum. This must be one of the values. If a default
   * is specified then the enum starts at 0 (which is the default if the field
   * is not set). If no default is set, the enum values start at 1, and 0 is
   * reserved for a special "unspecified" value.
   */
  // default?: string;
  /**
   * Documentation for the enum. This will be included in generated code.
   */
  docs?: string;
  /**
   * Whether this enum as a whole is deprecated. This will be marked in
   * generated code.
   */
  deprecated?: boolean;
  /**
   * Values that are deprecated. These will be individually marked in generated
   * code.
   */
  deprecatedValues?: string[];
}

export interface EnumValueConfig {
  value: number;
  docs?: string;
  deprecated?: boolean;
}

/**
 * Creates a new enum type. An enum can be one of several defined values.
 * @param name The name of the enum type, which will be used in generated code.
 * @param values The possible values of the enum. Each one is a string, although
 * the stored value will be a number. The order of these matters.
 * @param config Extra configuration options for the enum.
 * @returns A new enum type that can be used when defining fields.
 * @example
 * export const Rank = enumType("Rank", {
 *   Beginner: 1,
 *   Intermediate: 2,
 *   Expert: 3,
 * }, {
 *   default: "Beginner",
 * });
 * export const Player = itemType("Player", {
 *   fields: {
 *     rank: {
 *       type: Rank,
 *       fieldNum: 1,
 *     },
 *   },
 * });
 */
export function enumType(
  name: string,
  values: { [name: string]: number | EnumValueConfig },
  config: EnumConfig = {},
) {
  if (!validateName(name)) {
    throw new Error(
      `Invalid name for enum: ${name}. Names must consist of letters, numbers, and underscore.`,
    );
  }

  const fullEnumConfig = { values, config };
  const cached = getRegisteredType(name, "enumType", fullEnumConfig);
  if (cached) {
    return cached;
  }

  const enumValues: PartialMessage<EnumValueDescriptorProto>[] = [];

  // eslint-disable-next-line prefer-const
  for (let [valueName, valueConfig] of Object.entries(values)) {
    if (typeof valueConfig === "number") {
      valueConfig = { value: valueConfig };
    }
    if (!validateName(valueName)) {
      throw new Error(
        `Invalid name for enum value ${name}.${valueName}. Names must consist of letters, numbers, and underscore.`,
      );
    }
    enumValues.push({
      name: `${name}_${valueName}`,
      number: valueConfig.value,
      options: valueConfig.deprecated
        ? {
            deprecated: true,
          }
        : undefined,
    });
  }

  const hasZeroValue = enumValues.some((v) => v.number === 0);

  if (!hasZeroValue) {
    enumValues.unshift({
      name: `${name}_UNSPECIFIED`,
      number: 0,
    });
  }

  const enumDescriptor = new EnumDescriptorProto({
    name: name,
    value: enumValues,
    options: config.deprecated ? { deprecated: true } : undefined,
  });

  const schema: SchemaType = {
    name,
    parentType: enumDescriptor,
    docs: config.docs,
    // default: enumDescriptor.value.find((v) => v.name === config.default)?.number,
    deprecated: config.deprecated,
  };

  return registerType("enumType", schema, fullEnumConfig);
}

// TODO: Implement flagsType, which is like an enum but the values are flags in a bitfield
