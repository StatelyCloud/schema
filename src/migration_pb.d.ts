// @generated by protoc-gen-es v2.2.5 with parameter "target=js+dts,import_extension=.js"
// @generated from file migration.proto (package stately.schemamodel, syntax proto3)
/* eslint-disable */

import type { Message } from "@bufbuild/protobuf";
import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";

/**
 * Describes the file migration.proto.
 */
export declare const file_migration: GenFile;

/**
 * Migration describes the complete set of commands to convert from one schema
 * version to the next. See
 * https://www.notion.so/Publishing-New-Schema-Versions-123b8fbb925d80b1bf93fe86ef49fd1d
 * for how this works. At a high level, these migration instructions are sent to
 * the server in a SchemaService.Put, along with a fully-specified schema
 * FileDescriptorProto representing the new state. The server then loads the old
 * schema version's FileDescriptorProto and uses the Migration's commands to
 * figure out how to build new type mappings for the new schema version.
 *
 * @generated from message stately.schemamodel.Migration
 */
export declare type Migration = Message<"stately.schemamodel.Migration"> & {
  /**
   * from_schema_version is the original schema version that we're migrating
   * from. The migration will start from this version's file descriptor and then
   * apply all the migration commands in order to produce a new schema version.
   *
   * @generated from field: uint64 from_schema_version = 1;
   */
  fromSchemaVersion: bigint;

  /**
   * name is a human-readable name of the migration. This is used to identify
   * the migration in the migration history, but otherwise has no effect on the
   * migration itself.
   *
   * @generated from field: string name = 2;
   */
  name: string;

  /**
   * commands is the ordered list of changes to apply to the schema.
   *
   * @generated from field: repeated stately.schemamodel.MigrationCommand commands = 3;
   */
  commands: MigrationCommand[];
};

/**
 * Describes the message stately.schemamodel.Migration.
 * Use `create(MigrationSchema)` to create a new message.
 */
export declare const MigrationSchema: GenMessage<Migration>;

/**
 * @generated from message stately.schemamodel.MigrationCommand
 */
export declare type MigrationCommand = Message<"stately.schemamodel.MigrationCommand"> & {
  /**
   * type_name is the name of the type that this command is modifying. It may
   * refer to an item, object, or enum type.
   *
   * @generated from field: string type_name = 1;
   */
  typeName: string;

  /**
   * actions is the ordered list of changes to apply to the type.
   *
   * @generated from field: repeated stately.schemamodel.MigrateAction actions = 2;
   */
  actions: MigrateAction[];
};

/**
 * Describes the message stately.schemamodel.MigrationCommand.
 * Use `create(MigrationCommandSchema)` to create a new message.
 */
export declare const MigrationCommandSchema: GenMessage<MigrationCommand>;

/**
 * A single action to take on a particular type. The type_name is specified in
 * the parent MigrationCommand.
 *
 * @generated from message stately.schemamodel.MigrateAction
 */
export declare type MigrateAction = Message<"stately.schemamodel.MigrateAction"> & {
  /**
   * @generated from oneof stately.schemamodel.MigrateAction.action
   */
  action:
    | {
        /**
         * Item Type / Object Type Fields
         *
         * @generated from field: stately.schemamodel.AddField add_field = 2;
         */
        value: AddField;
        case: "addField";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.RemoveField remove_field = 3;
         */
        value: RemoveField;
        case: "removeField";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.RenameField rename_field = 4;
         */
        value: RenameField;
        case: "renameField";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.MarkFieldAsRequired mark_field_as_required = 12;
         */
        value: MarkFieldAsRequired;
        case: "markFieldAsRequired";
      }
    | {
        /**
         * TODO: ChangeFieldType change_field_type = ?;
         * TODO: convert field to / from repeated
         *
         * @generated from field: stately.schemamodel.MarkFieldAsNotRequired mark_field_as_not_required = 13;
         */
        value: MarkFieldAsNotRequired;
        case: "markFieldAsNotRequired";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.ModifyFieldReadDefault modify_field_read_default = 14;
         */
        value: ModifyFieldReadDefault;
        case: "modifyFieldReadDefault";
      }
    | {
        /**
         * Item/Object/Enum Types
         *
         * @generated from field: stately.schemamodel.RenameType rename_type = 6;
         */
        value: RenameType;
        case: "renameType";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.RemoveType remove_type = 7;
         */
        value: RemoveType;
        case: "removeType";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.AddType add_type = 8;
         */
        value: AddType;
        case: "addType";
      }
    | {
        /**
         * Enums
         *
         * @generated from field: stately.schemamodel.RenameEnumValue rename_enum_value = 9;
         */
        value: RenameEnumValue;
        case: "renameEnumValue";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.AddEnumValue add_enum_value = 10;
         */
        value: AddEnumValue;
        case: "addEnumValue";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.RemoveEnumValue remove_enum_value = 11;
         */
        value: RemoveEnumValue;
        case: "removeEnumValue";
      }
    | { case: undefined; value?: undefined };
};

/**
 * Describes the message stately.schemamodel.MigrateAction.
 * Use `create(MigrateActionSchema)` to create a new message.
 */
export declare const MigrateActionSchema: GenMessage<MigrateAction>;

/**
 * ModifyFieldReadDefault changes the read default value of a field in an item/object type.
 * This will only affect schema versions moving forward - older schema versions will
 * maintain their original default values.
 *
 * @generated from message stately.schemamodel.ModifyFieldReadDefault
 */
export declare type ModifyFieldReadDefault =
  Message<"stately.schemamodel.ModifyFieldReadDefault"> & {
    /**
     * name is the name of the field to modify. This can be used to look up the
     * descriptor for that field in the new schema.
     *
     * @generated from field: string name = 1;
     */
    name: string;
  };

/**
 * Describes the message stately.schemamodel.ModifyFieldReadDefault.
 * Use `create(ModifyFieldReadDefaultSchema)` to create a new message.
 */
export declare const ModifyFieldReadDefaultSchema: GenMessage<ModifyFieldReadDefault>;

/**
 * MarkFieldAsRequired marks a field as required. The default to populate the field
 * with is specified in the schema, not in the migration command here. This is
 * because going from required: false -> true is a concern of the version enacting
 * the change, not previous versions. Older items that don't have this field set
 * will be populated with the default specified in the schema version enacting this
 * change.
 *
 * @generated from message stately.schemamodel.MarkFieldAsRequired
 */
export declare type MarkFieldAsRequired = Message<"stately.schemamodel.MarkFieldAsRequired"> & {
  /**
   * @generated from field: string name = 1;
   */
  name: string;
};

/**
 * Describes the message stately.schemamodel.MarkFieldAsRequired.
 * Use `create(MarkFieldAsRequiredSchema)` to create a new message.
 */
export declare const MarkFieldAsRequiredSchema: GenMessage<MarkFieldAsRequired>;

/**
 * MarkFieldAsNotRequired marks a field as not required. The default to populate the field
 * with is specified by this migration command. This is because going from required: true
 * -> false is a concern of the underlying storage of items that have this field set.
 * Older client versions reading out newer items will see this field as not set, and
 * will use the default specified here.
 *
 * @generated from message stately.schemamodel.MarkFieldAsNotRequired
 */
export declare type MarkFieldAsNotRequired =
  Message<"stately.schemamodel.MarkFieldAsNotRequired"> & {
    /**
     * @generated from field: string name = 1;
     */
    name: string;

    /**
     * The read_default specifies a read-materialized default for this field
     * if it is not set. This is most useful when adding a new required field,
     * since previously-stored items will not have this field set. However, you
     * can also set a default for non-required fields. These defaults will be used
     * when the item is read.
     *
     * Note that this isn't validated as a "required" field because commonly the
     * default value will be the zero value for the field type, which is
     * represented as an empty string.
     *
     * read_default's value depends on the underlying field type.
     * * ObjectTypes is a JSON document that can be deserialized into the type of the field
     *   using ProtoJSON rules: https://protobuf.dev/programming-guides/json/.
     * * Durations can be either the golang format of "300ms", "-1.5h" or "2h45m"
     *   or a number.
     * * Timestamps can either be the RFC3339 format or a number.
     * * Enum Values can be the string name of the enum value or ordinal.
     * * For strings, it is the string value.
     * * For all other numbers, it is the number value.
     * * Bytes can either be the base64-encoded string or UUID string if the field
     *   is interpreted as a UUID.
     *
     * Keep in mind that some of the types might not exactly line up - for
     * example, ProtoJSON might specify that an int64 must always be a string, but
     * this JSON might contain a number instead if it happens to fit in the JSON
     * number range.
     *
     * @generated from field: string read_default = 2;
     */
    readDefault: string;
  };

/**
 * Describes the message stately.schemamodel.MarkFieldAsNotRequired.
 * Use `create(MarkFieldAsNotRequiredSchema)` to create a new message.
 */
export declare const MarkFieldAsNotRequiredSchema: GenMessage<MarkFieldAsNotRequired>;

/**
 * AddField adds an entirely new, full-specified field to an item/object type.
 *
 * @generated from message stately.schemamodel.AddField
 */
export declare type AddField = Message<"stately.schemamodel.AddField"> & {
  /**
   * name is the name of the field to add. This should be used to look up the
   * descriptor for that field in the new schema.
   *
   * @generated from field: string name = 1;
   */
  name: string;
};

/**
 * Describes the message stately.schemamodel.AddField.
 * Use `create(AddFieldSchema)` to create a new message.
 */
export declare const AddFieldSchema: GenMessage<AddField>;

/**
 * RemoveField removes a field from an item/object type.
 *
 * @generated from message stately.schemamodel.RemoveField
 */
export declare type RemoveField = Message<"stately.schemamodel.RemoveField"> & {
  /**
   * name is the name of the field to remove. This can be used to look up the
   * field in the old (from_schema_version) schema.
   *
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * The read_default specifies a read-materialized default for this field
   * if it is not set. This is most useful when adding a new required field,
   * since previously-stored items will not have this field set. However, you
   * can also set a default for non-required fields. These defaults will be used
   * when the item is read.
   *
   * Note that this isn't validated as a "required" field because commonly the
   * default value will be the zero value for the field type, which is
   * represented as an empty string.
   *
   * read_default's value depends on the underlying field type.
   * * ObjectTypes is a JSON document that can be deserialized into the type of the field
   *   using ProtoJSON rules: https://protobuf.dev/programming-guides/json/.
   * * Durations can be either the golang format of "300ms", "-1.5h" or "2h45m"
   *   or a number.
   * * Timestamps can either be the RFC3339 format or a number.
   * * Enum Values can be the string name of the enum value or ordinal.
   * * For strings, it is the string value.
   * * For all other numbers, it is the number value.
   * * Bytes can either be the base64-encoded string or UUID string if the field
   *   is interpreted as a UUID.
   *
   * Keep in mind that some of the types might not exactly line up - for
   * example, ProtoJSON might specify that an int64 must always be a string, but
   * this JSON might contain a number instead if it happens to fit in the JSON
   * number range.
   *
   * @generated from field: string read_default = 2;
   */
  readDefault: string;
};

/**
 * Describes the message stately.schemamodel.RemoveField.
 * Use `create(RemoveFieldSchema)` to create a new message.
 */
export declare const RemoveFieldSchema: GenMessage<RemoveField>;

/**
 * RenameField renames a field in an item/object type.
 *
 * @generated from message stately.schemamodel.RenameField
 */
export declare type RenameField = Message<"stately.schemamodel.RenameField"> & {
  /**
   * old_name is the name of the field to rename. This can be used to look up
   * the field in the old (from_schema_version) schema.
   *
   * @generated from field: string old_name = 1;
   */
  oldName: string;

  /**
   * new_name is the new name of the field. This can be used to look up the
   * field in the new schema.
   *
   * @generated from field: string new_name = 2;
   */
  newName: string;
};

/**
 * Describes the message stately.schemamodel.RenameField.
 * Use `create(RenameFieldSchema)` to create a new message.
 */
export declare const RenameFieldSchema: GenMessage<RenameField>;

/**
 * RenameType renames an item, object, or enum type.
 *
 * @generated from message stately.schemamodel.RenameType
 */
export declare type RenameType = Message<"stately.schemamodel.RenameType"> & {
  /**
   * new_name is the new name of the type. This can be used to look up the
   * descriptor for that type in the new schema.
   *
   * @generated from field: string new_name = 2;
   */
  newName: string;
};

/**
 * Describes the message stately.schemamodel.RenameType.
 * Use `create(RenameTypeSchema)` to create a new message.
 */
export declare const RenameTypeSchema: GenMessage<RenameType>;

/**
 * RemoveType removes an item, object, or enum type.
 *
 * The name of the type is in the type_name field of the parent MigrationCommand.
 * TODO: this is where we'd configure what to do with existing items of this type.
 *
 * @generated from message stately.schemamodel.RemoveType
 */
export declare type RemoveType = Message<"stately.schemamodel.RemoveType"> & {};

/**
 * Describes the message stately.schemamodel.RemoveType.
 * Use `create(RemoveTypeSchema)` to create a new message.
 */
export declare const RemoveTypeSchema: GenMessage<RemoveType>;

/**
 * AddType adds an entirely new, full-specified item/object/enum type to the schema.
 *
 * The name of the type is in the type_name field of the parent MigrationCommand.
 *
 * @generated from message stately.schemamodel.AddType
 */
export declare type AddType = Message<"stately.schemamodel.AddType"> & {};

/**
 * Describes the message stately.schemamodel.AddType.
 * Use `create(AddTypeSchema)` to create a new message.
 */
export declare const AddTypeSchema: GenMessage<AddType>;

/**
 * RenameEnumValue renames the enum value from the existing old_value_name to a new_value_name.
 *
 * The enum type name to modify is in the type_name field of the parent MigrationCommand
 *
 * @generated from message stately.schemamodel.RenameEnumValue
 */
export declare type RenameEnumValue = Message<"stately.schemamodel.RenameEnumValue"> & {
  /**
   * old_value_name is the name of the existing enum value to rename. This can be used to look up the
   * field in the old (from_schema_version) schema.
   *
   * @generated from field: string old_value_name = 1;
   */
  oldValueName: string;

  /**
   * new_value_name is the new name of the enum value. This can be used to look up the
   * field in the new (proposed) schema.
   *
   * @generated from field: string new_value_name = 2;
   */
  newValueName: string;
};

/**
 * Describes the message stately.schemamodel.RenameEnumValue.
 * Use `create(RenameEnumValueSchema)` to create a new message.
 */
export declare const RenameEnumValueSchema: GenMessage<RenameEnumValue>;

/**
 * AddEnumValue adds a new enum value to an existing enum type.
 *
 * The enum type name to modify is in the type_name field of the parent MigrationCommand
 *
 * @generated from message stately.schemamodel.AddEnumValue
 */
export declare type AddEnumValue = Message<"stately.schemamodel.AddEnumValue"> & {
  /**
   * new_value_name is the name of the enum value to add. This can be used to look up the
   * field in the new (proposed) schema.
   *
   * @generated from field: string new_value_name = 1;
   */
  newValueName: string;
};

/**
 * Describes the message stately.schemamodel.AddEnumValue.
 * Use `create(AddEnumValueSchema)` to create a new message.
 */
export declare const AddEnumValueSchema: GenMessage<AddEnumValue>;

/**
 * RemoveEnumValue removes an existing enum value from an existing enum type.
 *
 * The enum type name to modify is in the type_name field of the parent MigrationCommand
 *
 * @generated from message stately.schemamodel.RemoveEnumValue
 */
export declare type RemoveEnumValue = Message<"stately.schemamodel.RemoveEnumValue"> & {
  /**
   * value_name is the name of the enum value to remove. This can be used to look up the
   * field in the old (from_schema_version) schema.
   *
   * @generated from field: string value_name = 1;
   */
  valueName: string;
};

/**
 * Describes the message stately.schemamodel.RemoveEnumValue.
 * Use `create(RemoveEnumValueSchema)` to create a new message.
 */
export declare const RemoveEnumValueSchema: GenMessage<RemoveEnumValue>;
