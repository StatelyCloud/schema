import { create } from "@bufbuild/protobuf";
import {
  EnumDescriptorProtoSchema,
  EnumValueDescriptorProto,
  EnumValueDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { getRegisteredType, registerType } from "./type-registry.js";
import { SchemaType } from "./types.js";
import { validateName } from "./validate.js";

/** Options for defining an enum. Used in {@link enumType}. */
export interface EnumConfig {
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

/**
 * Creates a new enum type. An enum can be one of several defined values.
 * @param name The name of the enum type, which will be used in generated code.
 * @param values The possible values of the enum. Each one is a string, although
 * the stored value will be a number. The order of these matters.
 * @param config Extra configuration options for the enum.
 * @returns A new enum type that can be used when defining fields.
 * @example
 * export const Rank = enumType("Rank", {
 *   Beginner: 0, // This is the default value, but also the zero value
 *   Intermediate: 1,
 *   Expert: 2,
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
export function enumType(
  name: string,
  values: { [name: string]: number },
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

  const enumValues: EnumValueDescriptorProto[] = [];

  // eslint-disable-next-line prefer-const
  for (let [valueName, valueNum] of Object.entries(values)) {
    if (!validateName(valueName)) {
      throw new Error(
        `Invalid name for enum value ${name}.${valueName}. Names must consist of letters, numbers, and underscore.`,
      );
    }
    // Note that enum values are a sibling to the enum parent in the proto
    // namespace - they must be globally unique. We follow the
    // https://buf.build/docs/lint/rules/#enum_value_prefix rule and prefix all
    // enum values with the enum name. This produces some awkward names in
    // generated code, which we should fix in our own codegen.
    enumValues.push(
      create(EnumValueDescriptorProtoSchema, {
        name: enumValueName(name, valueName),
        number: valueNum,
        options: config.deprecatedValues?.includes(valueName)
          ? {
              deprecated: true,
            }
          : undefined,
      }),
    );
  }

  const hasZeroValue = enumValues.some((v) => v.number === 0);

  if (!hasZeroValue) {
    enumValues.unshift(
      create(EnumValueDescriptorProtoSchema, {
        name: enumValueName(name, "UNSPECIFIED"),
        number: 0,
      }),
    );
  }

  const enumDescriptor = create(EnumDescriptorProtoSchema, {
    name: name,
    value: enumValues,
    options: config.deprecated ? { deprecated: true } : undefined,
  });

  const schema: SchemaType = {
    name,
    parentType: enumDescriptor,
    deprecated: config.deprecated,
  };

  return registerType("enumType", schema, fullEnumConfig);
}

export function enumValueName(enumName: string, valueName: string) {
  return `${enumName}_${valueName}`;
}

// TODO: Implement flagsType, which is like an enum but the values are flags in a bitfield
