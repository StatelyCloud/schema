import { create } from "@bufbuild/protobuf";
import { getPackageName } from "./driver.js";
import { stringifyDefault } from "./fields.js";
import {
  MigrateActionSchema,
  Migration,
  MigrationCommand,
  MigrationCommandSchema,
  MigrationSchema,
} from "./migration_pb.js";

/**
 * A type migrator is used to declare changes within a type (item or object)
 */
class TypeMigrator {
  private command: MigrationCommand;

  /**
   * @private
   */
  constructor(name: string, migration: Migration) {
    const typeName = `${getPackageName()}.${name}`;
    this.command = create(MigrationCommandSchema, {
      typeName,
    });
    migration.commands.push(this.command);
  }

  /**
   * Mark a field in the type as added since the "from" version. Only the name
   * needs to be provided - the rest of the info is derived from the new schema.
   * @param name The name of the field to add.
   * @example
   * m.changeType("Role", (i) => {
   *  i.addField("movie_id");
   * });
   */
  // TODO: since this is the new field, we *could* type it such that we can
  // validate the name and the value type...
  addField(name: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "addField",
          value: {
            name,
            // TODO: add the default value option. To do that, we might have to
            // resolve the field's type, or just pass the default along as
            // another type and rely on the backend to do the right thing
            // defaultValue: defaultValue ? toBinaryValue(defaultValue) : new Uint8Array(),
          },
        },
      }),
    );
  }

  /**
   * Mark a field in the type as removed since the "from" version.
   * @example
   * m.changeType("Role", (i) => {
   *  i.removeField("movie_id");
   * });
   */
  removeField(name: string, readDefault?: unknown) {
    const defaultValue = stringifyDefault(readDefault);
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "removeField",
          value: {
            name,
            readDefault: defaultValue !== undefined ? defaultValue : "",
          },
        },
      }),
    );
  }

  /**
   * Mark a field in the type as having been renamed since the "from" version.
   * This helps distinguish between a field being removed and a new field being
   * added, and the *same* field just getting a new name.
   * @example
   * m.changeType("Role", (i) => {
   *   i.renameField("movie_id", "film_id");
   * });
   */
  renameField(oldName: string, newName: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "renameField",
          value: {
            oldName,
            newName,
          },
        },
      }),
    );
  }

  /**
   * Mark a field in the type as having an updated read default value. You may only use readDefaults on fields that
   * are marked as required. This is because non-required fields permit the use of the zero values, as such, Stately wouldn't
   * be able to tell if the field was intentionally set to the zero value or if it was unset.
   * @example
   * m.changeType("Role", (i) => {
   *   i.modifyFieldReadDefault("name"); // Specify the new default value in the schema
   * });
   */
  modifyFieldReadDefault(name: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "modifyFieldReadDefault",
          value: {
            name,
          },
        },
      }),
    );
  }
}

/**
 * An enum type migrator is used to declare changes within an enum.
 */
class EnumTypeMigrator {
  private command: MigrationCommand;

  /**
   * @private
   */
  // eslint-disable-next-line sonarjs/no-identical-functions
  constructor(name: string, migration: Migration) {
    const typeName = `${getPackageName()}.${name}`;
    this.command = create(MigrationCommandSchema, {
      typeName,
    });
    migration.commands.push(this.command);
  }

  /**
   * Mark an enum value in the type as having been renamed since the "from" version.
   * This helps distinguish between a value being removed and a new value being
   * added, and the *same* value just getting a new name.
   * This can only be used with enum types.
   * @example
   * m.changeEnum("UserState", (i) => {
   *   i.renameValue("New", "Created")
   * });
   */
  renameValue(oldName: string, newName: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "renameEnumValue",
          value: {
            oldValueName: oldName,
            newValueName: newName,
          },
        },
      }),
    );
  }

  /**
   * Mark a value in the enum as added since the "from" version. Only the name
   * needs to be provided - the rest of the info is derived from the new schema.
   * @param name The name of the field to add.
   * @example
   * m.changeEnum("UserState", (i) => {
   *  i.addValue("Banned");
   * });
   */
  addValue(name: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "addEnumValue",
          value: {
            newValueName: name,
          },
        },
      }),
    );
  }

  /**
   * Mark a value in the enum as removed since the "from" version.
   * @example
   * m.changeEnum("UserState", (i) => {
   *  i.removeValue("Tombstoned");
   * });
   */
  removeValue(name: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "removeEnumValue",
          value: {
            valueName: name,
          },
        },
      }),
    );
  }
}

/**
 * A helper for declaring changes to a schema since the last version.
 */
class Migrator {
  private migration: Migration;

  /**
   * @private
   */
  constructor(migration: Migration) {
    this.migration = migration;
  }

  /**
   * Declare a series of changes to a type (item or object) that have been made
   * since the "from" version. If a type has been renamed, make sure to call
   * `renameType` first, and then call `changeType` with the new name.
   * @param typeName The name of the type (itemType or objectType) to change.
   * @param changeFn A function that takes a TypeMigrator to declare changes.
   * @example
   * m.changeType("Role", (i) => {
   *  i.addField("movie_id");
   * });
   */
  changeType(typeName: string, changeFn: (t: TypeMigrator) => void) {
    changeFn(new TypeMigrator(typeName, this.migration));
  }

  /**
   * Declare a series of changes to an enum that have been made since the
   * "from" version. If an enum has been renamed, make sure to call `renameType`
   * first, and then call `changeEnum` with the new name.
   * @param enumName The name of the enum to change.
   * @param changeFn A function that takes a EnumTypeMigrator to declare changes.
   * @example
   * m.changeEnum("UserState", (i) => {
   *  i.addValue("Banned");
   * });
   */
  changeEnum(enumName: string, changeFn: (t: EnumTypeMigrator) => void) {
    changeFn(new EnumTypeMigrator(enumName, this.migration));
  }

  /**
   * Mark an entire type (item, object, or enum type) as having been removed
   * since the "from" version.
   */
  removeType(name: string) {
    this.migration.commands.push(
      create(MigrationCommandSchema, {
        typeName: `${getPackageName()}.${name}`,
        actions: [
          {
            action: {
              case: "removeType",
              value: {},
            },
          },
        ],
      }),
    );
  }

  /**
   * Mark an entire type (item, object, or enum type) as having been added since
   * the "from" version.
   */
  addType(name: string) {
    this.migration.commands.push(
      create(MigrationCommandSchema, {
        typeName: `${getPackageName()}.${name}`,
        actions: [
          {
            action: {
              case: "addType",
              value: {},
            },
          },
        ],
      }),
    );
  }

  /**
   * Mark the entire type (item, object, or enum type) as having been renamed
   * since the "from" version. This should occur before a changeType call for
   * the new type.
   */
  renameType(oldName: string, newName: string) {
    this.migration.commands.push(
      create(MigrationCommandSchema, {
        typeName: `${getPackageName()}.${oldName}`,
        actions: [
          {
            action: {
              case: "renameType",
              value: {
                newName: `${getPackageName()}.${newName}`,
              },
            },
          },
        ],
      }),
    );
  }
}

/**
 * Package up the migration into a deferred object that can be built later. This
 * is a class mostly to make it easier to identify in the exports.
 *
 * @private
 */
export class DeferredMigration {
  fromSchemaVersion: bigint;
  name: string;
  migrateFn: (m: Migrator) => void;

  constructor(fromSchemaVersion: number | bigint, name: string, migrateFn: (m: Migrator) => void) {
    this.fromSchemaVersion = BigInt(fromSchemaVersion);
    this.name = name;
    this.migrateFn = migrateFn;
  }

  build(): Migration {
    const migration = create(MigrationSchema, {
      fromSchemaVersion: this.fromSchemaVersion,
      name: this.name,
    });

    this.migrateFn(new Migrator(migration));

    return migration;
  }
}

// It's so tempting to try to use TypeScript to validate the type/field names
// here, but we can't. Customers are encouraged to keep old migrations around as
// a sort of "browseable history", and since we only have the types for the
// *current* schema, old migrations could never make sense. This is also why we
// don't bother to validate any of the names here - we'll let the backend do
// that since it has access to both the old and new schema versions, wheras in
// JS we only have the new schema.

/**
 * Declare a migration from one schema version to the next. Changes to your
 * schema may require declaring migrations to provide clarity and context for
 * the changes that have occurred, such as disambiguating field renames from
 * field add+remove, or specifying options for what to do with existing data.
 *
 * Note: There is no "addType" method because new types are always added
 * to your schema automatically.
 *
 * @example
 * export const m4 = migrate(4, "Add movie_id to Role", (m) => {
 *   m.changeType("Role", (i) => {
 *     i.addField("movie_id");
 *     i.addField("hired");
 *
 *     i.removeField("salary");
 *   });
 *
 *   m.renameType("Movie", "Film");
 *
 *   m.changeType("Film", (i) => {
 *     i.addField("rating");
 *     i.renameField("name", "title");
 *   });
 *
 *   m.removeType("Actor");
 * });
 */
export function migrate(
  fromSchemaVersion: number | bigint,
  name: string,
  migrateFn: (m: Migrator) => void,
): DeferredMigration {
  return new DeferredMigration(fromSchemaVersion, name, migrateFn);
}

export type { Migrator, TypeMigrator };
