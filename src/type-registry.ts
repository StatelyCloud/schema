import { DeferredMigration } from "./migrate.js";
import { SchemaType } from "./types.js";

export class TypeDefinitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TypeDefinitionError";
  }
}

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
const registry = new Map<string, SchemaType>();
const migrations: DeferredMigration[] = [];

/**
 * Retrieve an existing type from the registry. If there is already a different
 * type registered under this name, it throws an error.
 */
export function getRegisteredType<T extends SchemaType["type"]>(name: string, type: T) {
  const cachedType = registry.get(name);
  if (cachedType) {
    if (cachedType.type === type) {
      return cachedType;
    } else {
      throw new TypeDefinitionError(`"${name}" is a ${cachedType.type}, not a ${type}`);
    }
  }
}

/**
 * Register a new type. We provide the original config object so that we can
 * check for conflicts later, in getRegisteredType.
 */
export function registerType<S extends SchemaType>(schema: S): S {
  const name = schema.name;
  if (registry.has(name)) {
    throw new TypeDefinitionError(
      `${registry.get(name)?.type}("${name}") already exists - did you mean to use a different name?`,
    );
  }
  registry.set(name, schema);
  return schema;
}

/**
 * Register a new migration. This is used to collect migrations from the
 * customer's schema code.
 */
export function registerMigration(migration: DeferredMigration): DeferredMigration {
  migrations.push(migration);
  return migration;
}

/**
 * Read back all the migrations in the registry, in roughly the order they were
 * defined.
 */
export function getAllTypes(): SchemaType[] {
  return [...registry.values()];
}

/**
 * Read back all the migrations in the registry, in roughly the order they were
 * defined.
 */
export function getAllMigrations(): DeferredMigration[] {
  return migrations;
}
