import { create } from "@bufbuild/protobuf";
import { EnumType } from "./enum.js";
import { ItemType, ObjectType } from "./item-types.js";
import {
  MigrateActionSchema,
  Migration,
  MigrationCommand,
  MigrationCommandSchema,
  MigrationSchema,
} from "./migration_pb.js";
import { stringifyDefault } from "./stringify.js";
import { registerMigration } from "./type-registry.js";
import { Deferred, resolveDeferred } from "./type-util.js";

function resolveTypeName(typeName: string | Deferred<EnumType | ObjectType | ItemType>): string {
  if (typeof typeName === "string") {
    return typeName;
  }

  typeName = resolveDeferred(typeName);
  if (typeof typeName === "object" && "name" in typeName) {
    return typeName.name;
  } else {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Invalid type name: ${typeName}`);
  }
}

/**
 * A type migrator is used to declare changes within a type (itemType or
 * objectType).
 * @example
 * // "t" is the TypeMigrator instance.
 * m.changeType("Role", (t) => {
 *   t.addField("movie_id");
 * });
 */
class TypeMigrator<FieldNames extends string = string> {
  private command: MigrationCommand;

  /**
   * @private
   */
  constructor(
    name: string | Deferred<ItemType<FieldNames> | ObjectType<FieldNames>>,
    migration: Migration,
  ) {
    this.command = create(MigrationCommandSchema, {
      typeName: resolveTypeName(name),
    });
    migration.commands.push(this.command);
  }

  /**
   * Mark a field in the type as added since the schema version passed to the
   * migrate function. Only the field name needs to be provided - the rest of
   * the configuration of the field is already known in the new schema.
   * @param newFieldName The name of the new field that was added.
   * @example
   * m.changeType("Role", (t) => {
   *   t.addField("movie_id");
   * });
   */
  addField(newFieldName: FieldNames) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "addField",
          value: {
            name: newFieldName,
          },
        },
      }),
    );
  }

  /**
   * Mark a field in the type as removed since the schema version passed to the
   * migrate function. If you are removing a field that was required, you must
   * provide a readDefault value in this command. When removing non-required
   * fields you must not specify a readDefault value, as this would change the
   * behavior of older clients that are reading items that were created before
   * this field was removed.
   * @param removedFieldName The name of the field that was removed.
   * @param readDefault The read-time default value to use for this field if a
   * client using an older schema version reads an item that was created after
   * this migration. This can be provided as a value of the type of the removed
   * field, or as a JSON string.
   * @example
   * m.changeType("Role", (t) => {
   *  // Clients using old schema will see the value 1234 for this
   *  // field if it's not set by newer clients. This assumes that
   *  // "movie_id" was a required field.
   *  t.removeField("movie_id", 1234);
   * });
   */
  removeField(removedFieldName: string, readDefault?: unknown) {
    const defaultValue = stringifyDefault(readDefault);
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "removeField",
          value: {
            name: removedFieldName,
            readDefault: defaultValue ?? "",
          },
        },
      }),
    );
  }

  /**
   * Declare that a field in the type has been renamed since the schema version
   * passed to the migrate function. This helps distinguish between a field
   * being removed and a new field being added, and the *same* field just
   * getting a new name.
   * @param oldFieldName The name the field used to have.
   * @param newFieldName The new name of the field.
   * @example
   * m.changeType("Role", (t) => {
   *   t.renameField("movie_id", "film_id");
   * });
   */
  renameField(oldFieldName: string, newFieldName: FieldNames) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "renameField",
          value: {
            oldName: oldFieldName,
            newName: newFieldName,
          },
        },
      }),
    );
  }

  /**
   * Declare that a field has changed from non-required to required since the
   * schema version passed to the migrate function. You must also make sure that
   * the field itself has a `readDefault` property in your  your proposed
   * schema. This is so that older items in Stately will present a value to
   * clients using the new schema.
   * @param fieldName The name of the field that was changed to be required.
   * @example
   * m.changeType("Role", (t) => {
   *   t.markFieldAsRequired("movie_id");
   * });
   */
  markFieldAsRequired(fieldName: FieldNames) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "markFieldAsRequired",
          value: {
            name: fieldName,
          },
        },
      }),
    );
  }

  /**
   * Declare that a field has changed from required to non-required since the
   * schema version passed to the migrate function. If you had never specified a
   * `readDefault` in another migration command for this field, you must pass in
   * a `readDefault` value as the second argument so clients using older schema
   * versions where the field was required will see a value. Otherwise you must
   * *not* pass in a `readDefault` value, as this could change the behavior of
   * older clients.
   * @param fieldName The name of the field that was changed to be non-required.
   * @param readDefault The read-time default value to use for this field when
   * read using a schema version that expects it to always be set. You must
   * provide this, unless you had previously provided a `readDefault` value for
   * this field in a previous migration, in which case you cannot provide a
   * value here.
   * @example
   * m.changeType("Role", (t) => {
   *   t.markFieldAsNotRequired("title", "Python Wrangler");
   * });
   */
  markFieldAsNotRequired(fieldName: FieldNames, readDefault?: unknown) {
    const defaultValue = stringifyDefault(readDefault);
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "markFieldAsNotRequired",
          value: {
            name: fieldName,
            readDefault: defaultValue ?? "",
          },
        },
      }),
    );
  }

  /**
   * Declare that the readDefault value configured on a field has changed. You
   * may only use readDefaults on required fields (note that fields are required
   * by default). This is because StatelyDB cannot distinguish between a field
   * being set to its zero value and not being set at all.
   * @param fieldName The name of the field that was changed to have a new readDefault.
   * @example
   * m.changeType("Role", (t) => {
   *   // Specify the new default value in the schema
   *   t.modifyFieldReadDefault("name");
   * });
   */
  modifyFieldReadDefault(fieldName: FieldNames) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "modifyFieldReadDefault",
          value: {
            name: fieldName,
          },
        },
      }),
    );
  }
}

/**
 * An enum type migrator is used to declare changes within an enum.
 * @example
 * // "t" is the EnumTypeMigrator instance.
 * m.changeEnum("UserState", (t) => {
 *   t.renameValue("New", "Created")
 * });
 */
class EnumTypeMigrator<Values extends string = string> {
  private command: MigrationCommand;

  /**
   * @private
   */
  constructor(typeName: string | EnumType<Values>, migration: Migration) {
    this.command = create(MigrationCommandSchema, {
      typeName: resolveTypeName(typeName),
    });
    migration.commands.push(this.command);
  }

  /**
   * Mark an enum value in the type as having been renamed since the schema version passed to the migrate function.
   * This helps distinguish between a value being removed and a new value being
   * added, and the *same* value just getting a new name.
   * @param oldValueName The name the value used to have.
   * @param newValueName The new name of the value.
   * @example
   * m.changeEnum("UserState", (t) => {
   *   t.renameValue("New", "Created")
   * });
   */
  renameValue(oldValueName: string, newValueName: Values) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "renameEnumValue",
          value: {
            oldValueName: oldValueName,
            newValueName: newValueName,
          },
        },
      }),
    );
  }

  /**
   * Mark a value in the enum as added since the schema version passed to the migrate function. Only the name
   * needs to be provided - the rest of the info is derived from the new schema.
   * @param newValueName The name of the field to add.
   * @example
   * m.changeEnum("UserState", (t) => {
   *  t.addValue("Banned");
   * });
   */
  addValue(newValueName: Values) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "addEnumValue",
          value: {
            newValueName,
          },
        },
      }),
    );
  }

  /**
   * Mark a value in the enum as removed since the schema version passed to the migrate function.
   * @example
   * m.changeEnum("UserState", (t) => {
   *  t.removeValue("Tombstoned");
   * });
   */
  removeValue(oldValueName: string) {
    this.command.actions.push(
      create(MigrateActionSchema, {
        action: {
          case: "removeEnumValue",
          value: {
            valueName: oldValueName,
          },
        },
      }),
    );
  }
}

/**
 * A helper for declaring changes to a schema since the last version.
 * @example
 * // "m" is the Migrator instance.
 * migrate(4, "Add some new types", (m) => {
 *   m.addType("NewItem");
 *   m.addType(NewEnum);
 * });
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
   * since the schema version passed to the migrate function. If a type has been renamed, make sure to call
   * `renameType` first, and then call `changeType` with the new name.
   * @param typeName The itemType or objectType to change. You can pass the type itself or its name.
   * @param changeFn A function that takes a TypeMigrator to declare changes.
   * @example
   * migrate(4, "Add movie_id to Role", (m) => {
   *   m.changeType(Role, (t) => {
   *    t.addField("movie_id");
   *   });
   * });
   */
  changeType<FieldNames extends string = string>(
    typeName: string | Deferred<ItemType<FieldNames> | ObjectType<FieldNames>>,
    changeFn: (t: TypeMigrator<FieldNames>) => void,
  ) {
    changeFn(new TypeMigrator(typeName, this.migration));
  }

  /**
   * Declare a series of changes to an enum that have been made since the
   * "from" version. If an enum has been renamed, make sure to call `renameType`
   * first, and then call `changeEnum` with the new name.
   * @param enumName The enum to change. You can pass the type itself or its name.
   * @param changeFn A function that takes a EnumTypeMigrator to declare changes.
   * @example
   * migrate(2, "Add banned state to UserState", (m) => {
   *   m.changeEnum(UserState, (t) => {
   *    t.addValue("Banned");
   *   });
   * });
   */
  changeEnum<Values extends string = string>(
    enumName: string | EnumType<Values>,
    changeFn: (t: EnumTypeMigrator<Values>) => void,
  ) {
    changeFn(new EnumTypeMigrator(enumName, this.migration));
  }

  /**
   * Mark an entire type (item, object, or enum type) as having been removed
   * since the schema version passed to the migrate function.
   * @param name The name of the type to remove. This must be a string because the type presumably doesn't exist in your schema anymore.
   * @example
   * migrate(4, "Remove Actor type", (m) => {
   *   m.removeType("Actor");
   * });
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
   * @param typeName The name of the type to add. You can pass the type itself or its name.
   * @example
   * migrate(4, "Add some new types", (m) => {
   *   m.addType("NewItem");
   *   m.addType(NewEnum);
   * });
   */
  addType(typeName: string | Deferred<ItemType | ObjectType | EnumType>) {
    this.migration.commands.push(
      create(MigrationCommandSchema, {
        typeName: resolveTypeName(typeName),
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
   * since the schema version passed to the migrate function. This should occur before a changeType call for
   * the new type.
   * @param oldName The name the type used to have.
   * @param newName The new name of the type. You can pass the type itself or its name.
   * @example
   * m.renameType("Movie", Film);
   */
  renameType(oldName: string, newName: string | Deferred<ItemType | ObjectType | EnumType>) {
    this.migration.commands.push(
      create(MigrationCommandSchema, {
        typeName: oldName,
        actions: [
          {
            action: {
              case: "renameType",
              value: {
                newName: resolveTypeName(newName),
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

/**
 * Declare a migration from one schema version to the next. Changes to your
 * schema require declaring migrations to provide clarity and context for the
 * changes that have occurred, such as disambiguating field renames from field
 * add+remove, or specifying options for what to do with existing data.
 *
 * @param fromSchemaVersion The schema version to migrate *from* - i.e. the
 * "old" schema version. When you create a migration you should set this to your
 * current schema version, which you can find in the console.
 * @param description A short description of the migration. This will show up in
 * your schema version history.
 * @param migrateFn A function that takes a Migrator object which allows you to
 * declare changes to types.
 *
 * @example
 * migrate(4, "Add movie_id to Role", (m) => {
 *   m.changeType("Role", (t) => {
 *     t.addField("movie_id");
 *     t.addField("hired");
 *
 *     t.removeField("salary");
 *   });
 *
 *   m.renameType("Movie", "Film");
 *
 *   m.changeType("Film", (t) => {
 *     t.addField("rating");
 *     t.renameField("name", "title");
 *   });
 *
 *   m.removeType("Actor");
 * });
 */
export function migrate(
  fromSchemaVersion: number | bigint,
  description: string,
  migrateFn: (m: Migrator) => void,
): DeferredMigration {
  return registerMigration(new DeferredMigration(fromSchemaVersion, description, migrateFn));
}

export type { Migrator, TypeMigrator };
