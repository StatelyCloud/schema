import { create } from "@bufbuild/protobuf";
import {
  MigrateActionSchema,
  Migration,
  MigrationCommand,
  MigrationCommandSchema,
  MigrationSchema,
} from "./migration_pb.js";
import { stringifyDefault } from "./stringify.js";
import { registerMigration } from "./type-registry.js";

// TODO: Pass types into these functions, use that to check the types of the arguments.

/**
 * A type migrator is used to declare changes within a type (item or object)
 */
class TypeMigrator {
  private command: MigrationCommand;

  /**
   * @private
   */
  constructor(name: string, migration: Migration) {
    this.command = create(MigrationCommandSchema, {
      typeName: name,
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
          },
        },
      }),
    );
  }

  /**
   * Mark a field in the type as removed since the "from" version.
   * If you are removing a field that is required, you must provide a readDefault value.
   * Non-required fields must not have a readDefault value, as this would change the behavior
   * of older clients that are reading items that were created before this field was removed.
   * @example
   * m.changeType("Role", (i) => {
   *  i.removeField("movie_id", 1234);
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
   * Mark a field in the type as having been required since the "from" version. Using this migration action requires
   * that the field has a readDefault defined in your proposed schema. This is so that older items in Stately can be
   * migrated to have a value for this field.
   * @example
   * m.changeType("Role", (i) => {
   *   i.markFieldAsRequired("movie_id");
   * });
   */
  markFieldAsRequired(name: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "markFieldAsRequired",
          value: {
            name,
          },
        },
      }),
    );
  }

  /**
   * Mark a field in the type as having been not required since the "from" version. Using this migration action requires
   * passing in a readDefault value on this migration action. The reason the readDefault is required here, is so older
   * clients will still observe this default value when reading items that were created before this field was migrated
   * to be not required.
   * @example
   * m.changeType("Role", (i) => {
   *   i.markFieldAsNotRequired("title", "Python Wrangler");
   * });
   */
  markFieldAsNotRequired(name: string, readDefault?: unknown) {
    const defaultValue = stringifyDefault(readDefault);
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "markFieldAsNotRequired",
          value: {
            name,
            readDefault: defaultValue !== undefined ? defaultValue : "",
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
    this.command = create(MigrationCommandSchema, {
      typeName: name,
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
        typeName: name,
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
        typeName: name,
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
        typeName: oldName,
        actions: [
          {
            action: {
              case: "renameType",
              value: {
                newName: newName,
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
// a sort of "browse-able history", and since we only have the types for the
// *current* schema, old migrations could never make sense. This is also why we
// don't bother to validate any of the names here - we'll let the backend do
// that since it has access to both the old and new schema versions, whereas in
// JS we only have the new schema.

/**
 * Declare a migration from one schema version to the next. Changes to your
 * schema require declaring migrations to provide clarity and context for the
 * changes that have occurred, such as disambiguating field renames from field
 * add+remove, or specifying options for what to do with existing data.
 *
 * @param name The name of the migration. This should be a short, descriptive
 * name that describes the changes made in this migration. It will show up in
 * your schema version history.
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
  return registerMigration(new DeferredMigration(fromSchemaVersion, name, migrateFn));
}

export type { Migrator, TypeMigrator };
