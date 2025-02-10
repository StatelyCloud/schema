import { deepEqual } from "fast-equals";
import { EnumConfig } from "./enum.js";
import { Fields, ItemTypeConfig, ObjectTypeConfig } from "./item-types.js";
import { SchemaType } from "./types.js";

export class TypeDefinitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TypeDefinitionError";
  }
}

type TypeConfig =
  | { type: "itemType"; config: ItemTypeConfig }
  | { type: "objectType"; config: ObjectTypeConfig }
  | {
      type: "enumType";
      config: { values: { [name: string]: number }; config: EnumConfig };
    }
  | {
      type: "type";
      config: Omit<SchemaType, "parentType" | "array" | "name"> & {
        parentType: SchemaType["parentType"];
      };
    };

/**
 * The type registry is a global registry of schema types. It serves several
 * purposes:
 *
 * 1. It ensures that we don't create the same type twice with different
 *    configs. This can be a copy/paste error where the user accidentally reused
 *    a name.
 * 2. It allows us to have self-referential types. We add types to the cache
 *    before filling out their fields, so that when we build each field, if that
 *    field references the type itself, we can get it from the cache instead of
 *    recursing forever.
 * 3. It serves to "intern" SchemaTypes, so that each unique type in the system
 *    has one value in memory. This allows for neat things like comparing types
 *    by reference instead of by value.
 */
const registry = new Map<string, { schema: SchemaType; config: TypeConfig }>();

type TypeConfigOfType<T, K extends TypeConfig["type"]> = T extends {
  type: K;
  config: infer X;
}
  ? X
  : never;

/**
 * Retrieve an existing type from the registry. If there is already a different
 * type registered under this name, it throws an error.
 */
export function getRegisteredType<T extends TypeConfig["type"]>(
  name: string,
  type: T,
  config: TypeConfigOfType<TypeConfig, T>,
) {
  const cachedType = registry.get(name);
  if (cachedType) {
    if (configsEqual(cachedType.config, { type, config } as TypeConfig)) {
      return cachedType.schema;
    } else {
      throw new TypeDefinitionError(
        `${cachedType.config.type}("${name}") already exists - did you mean to use a different name?`,
      );
    }
  }
}

/**
 * Register a new type. We provide the original config object so that we can
 * check for conflicts later, in getRegisteredType.
 */
export function registerType<T extends TypeConfig["type"]>(
  type: T,
  schema: SchemaType,
  config: TypeConfigOfType<TypeConfig, T>,
): SchemaType {
  const name = schema.name;
  if (registry.has(name)) {
    throw new TypeDefinitionError(
      `${registry.get(name)?.config.type}("${name}") already exists - did you mean to use a different name?`,
    );
  }
  registry.set(name, { schema, config: { config, type } as TypeConfig });
  return schema;
}

export function getAllTypes() {
  return registry.values();
}

/**
 * Check if two type configs (type constructor inputs) are more or less equal.
 * This can't be 100% correct because we can't effectively compare deferred
 * functions, but it's good enough to catch copy/paste errors.
 */
function configsEqual(a: TypeConfig, b: TypeConfig) {
  switch (a.type) {
    case "enumType":
      if (b.type !== "enumType") {
        return false;
      }
      return deepEqual(a.config.values, b.config.values);
    case "itemType":
      if (b.type !== "itemType") {
        return false;
      }
      return (
        deepEqual(a.config.keyPath, b.config.keyPath) &&
        fieldsEqual(a.config.fields, b.config.fields)
      );
    case "objectType":
      if (b.type !== "objectType") {
        return false;
      }
      return fieldsEqual(a.config.fields, b.config.fields);
    case "type":
      if (b.type !== "type") {
        return false;
      }
      return (
        a.config.parentType === b.config.parentType &&
        a.config.interpretAs === b.config.interpretAs &&
        a.config.valid === b.config.valid
      );
  }
}

/**
 * A sort of lightweight comparison of fields - they're the same if there are
 * exactly the same names. We can't compare the types directly
 * because they may be functions.
 */
function fieldsEqual(a: Fields, b: Fields) {
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (const key in a) {
    if (!b[key]) {
      return false;
    }
  }
  return true;
}
