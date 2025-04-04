// @generated by protoc-gen-es v2.2.5 with parameter "target=js+dts,import_extension=.js"
// @generated from file package.proto (package stately.schemamodel, syntax proto3)
/* eslint-disable */

import type { Message } from "@bufbuild/protobuf";
import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import type {
  BytesInterpretAs,
  FromMetadata,
  InitialValue,
  MessageOptions,
  NumberInterpretAs,
  StringInterpretAs,
  SupportedFeatures,
} from "./options_pb.js";

/**
 * Describes the file package.proto.
 */
export declare const file_package: GenFile;

/**
 * A SchemaPackage is a collection of schema items, etc.
 *
 * @generated from message stately.schemamodel.SchemaPackage
 */
export declare type SchemaPackage = Message<"stately.schemamodel.SchemaPackage"> & {
  /**
   * package_name is the proto-package name for the schema.
   * This is a left-over from proto semantics, that may not be required in all languages
   * given the way we generate code.
   * When this is empty, we will automatically generate a package name "s" for a storage
   * schema, and `stately.generated` for wire schema.
   *
   * @generated from field: string package_name = 1;
   */
  packageName: string;

  /**
   * file_name is the name of the "proto file" that this schema package was generated from.
   * This is a left-over from proto semantics, that may not be required in all languages
   * given the way we generate code.
   * When empty, this will be set to "schema.proto".
   *
   * @generated from field: string file_name = 2;
   */
  fileName: string;

  /**
   * messages are ItemTypes or ObjectTypes defined in schema.
   *
   * @generated from field: repeated stately.schemamodel.MessageType messages = 3;
   */
  messages: MessageType[];

  /**
   * enums are EnumTypes defined in schema.
   *
   * @generated from field: repeated stately.schemamodel.EnumType enums = 4;
   */
  enums: EnumType[];

  /**
   * type_aliases are TypeAliases defined in schema.
   *
   * @generated from field: repeated stately.schemamodel.TypeAlias type_aliases = 5;
   */
  typeAliases: TypeAlias[];

  /**
   * DefaultGroupConfig is the default configuration for a group within a schema.
   *
   * @generated from field: stately.schemamodel.DefaultGroupConfig default_group_config = 6;
   */
  defaultGroupConfig?: DefaultGroupConfig;
};

/**
 * Describes the message stately.schemamodel.SchemaPackage.
 * Use `create(SchemaPackageSchema)` to create a new message.
 */
export declare const SchemaPackageSchema: GenMessage<SchemaPackage>;

/**
 * DefaultGroupConfig is the default configuration for a group within a schema.
 *
 * @generated from message stately.schemamodel.DefaultGroupConfig
 */
export declare type DefaultGroupConfig = Message<"stately.schemamodel.DefaultGroupConfig"> & {
  /**
   * supported_feature_flags is the set of flags that indicate which features
   * are enabled.
   * 1 << 1 = VERSIONED_GROUP
   * 1 << 2 = SYNC
   * So:
   * 0 = NATIVE
   * 1 = VERSIONED_GROUP
   * 2 = NATIVE_SYNC // Not yet implemented
   * 3 = VERSIONED_GROUP_SYNC
   *
   * @generated from field: stately.schemamodel.SupportedFeatures supported_feature_flags = 1 [deprecated = true];
   * @deprecated
   */
  supportedFeatureFlags: SupportedFeatures;

  /**
   * tombstone_duration_seconds indicates how long tombstones should be kept around
   * for sync-enabled items. This also affects the duration for which a ListToken can be
   * used to sync without encountering a reset.
   * IF this is set to 0, we will default to 60 days.
   *
   * @generated from field: uint64 tombstone_duration_seconds = 2;
   */
  tombstoneDurationSeconds: bigint;
};

/**
 * Describes the message stately.schemamodel.DefaultGroupConfig.
 * Use `create(DefaultGroupConfigSchema)` to create a new message.
 */
export declare const DefaultGroupConfigSchema: GenMessage<DefaultGroupConfig>;

/**
 * A MessageType represents either an ItemType or an ObjectType defined in schema.
 *
 * @generated from message stately.schemamodel.MessageType
 */
export declare type MessageType = Message<"stately.schemamodel.MessageType"> & {
  /**
   * type_name is the human-readable name of the underlying type. Unlike file descriptors,
   * this type name does _not_ include a package prefix.
   * When a wire model is generated in the DSL, this name *must* be present
   *
   * @generated from field: string type_name = 1;
   */
  typeName: string;

  /**
   * type_storage_id is the unique identifier for the underlying type that is used in
   * the storage model.
   * This will be absent for a schema definition generated by the DSL, but will be populated
   * by the schema.Package parser and persisted with the wire and storage schema definitions.
   *
   * @generated from field: uint32 type_storage_id = 2;
   */
  typeStorageId: number;

  /**
   * comments are multi-line comments parsed from source code, where
   * each line is separated by a '\n' character.
   *
   * @generated from field: string comments = 3;
   */
  comments: string;

  /**
   * A set of validation constraints that must all be true for the message to be valid.
   *
   * @generated from field: repeated stately.schemamodel.Constraint validations = 4;
   */
  validations: Constraint[];

  /**
   * The fields of this object.
   *
   * @generated from field: repeated stately.schemamodel.Field fields = 5;
   */
  fields: Field[];

  /**
   * MessageOptions are the options for this message.
   *
   * @generated from field: stately.schemamodel.MessageOptions item_type_options = 6;
   */
  itemTypeOptions?: MessageOptions;

  /**
   * deprecated indicates that this type is deprecated. This is documentation
   * and should be a description of what to use instead, or why it was
   * deprecated. It will be emitted as part of the generated code's comments.
   *
   * @generated from field: string deprecated = 7;
   */
  deprecated: string;
};

/**
 * Describes the message stately.schemamodel.MessageType.
 * Use `create(MessageTypeSchema)` to create a new message.
 */
export declare const MessageTypeSchema: GenMessage<MessageType>;

/**
 * @generated from message stately.schemamodel.EnumType
 */
export declare type EnumType = Message<"stately.schemamodel.EnumType"> & {
  /**
   * type_name is the human-readable name of the EnumType.
   * Unlike file descriptors, this type name does _not_ include a package prefix.
   * When a wire model is generated in the DSL, this name *must* be present.
   * This will be omitted from persisted storage schema as a space optimization.
   *
   * @generated from field: string type_name = 1;
   */
  typeName: string;

  /**
   * type_storage_id is the unique identifier for the EnumType that is used in the storage model.
   * This will be absent for a schema definition generated by the DSL, but will be populated
   * by the schema.Package parser and persisted with the wire and storage schema definitions.
   *
   * @generated from field: uint32 type_storage_id = 2;
   */
  typeStorageId: number;

  /**
   * comments are multi-line comments parsed from source code, where
   * each line is separated by a '\n' character.
   *
   * @generated from field: string comments = 4;
   */
  comments: string;

  /**
   * The values this enum can take!
   *
   * @generated from field: repeated stately.schemamodel.EnumValue values = 3;
   */
  values: EnumValue[];

  /**
   * deprecated indicates that this type is deprecated. This is documentation
   * and should be a description of what to use instead, or why it was
   * deprecated. It will be emitted as part of the generated code's comments.
   *
   * @generated from field: string deprecated = 5;
   */
  deprecated: string;
};

/**
 * Describes the message stately.schemamodel.EnumType.
 * Use `create(EnumTypeSchema)` to create a new message.
 */
export declare const EnumTypeSchema: GenMessage<EnumType>;

/**
 * TypeAlias are used to define a new type that is an alias for an existing type.
 *
 * @generated from message stately.schemamodel.TypeAlias
 */
export declare type TypeAlias = Message<"stately.schemamodel.TypeAlias"> & {
  /**
   * The name of the alias type.
   *
   * @generated from field: string type_name = 1;
   */
  typeName: string;

  /**
   * type_storage_id is the unique identifier for the underlying type alias. While this
   * isn't actually used in the storage model, it is tracked and used to optimize
   * the size of the package schema at rest and in transit.
   * This will be absent for a schema definition generated by the DSL, but will be populated
   * by the schema.Package parser and persisted with the wire and storage schema definitions.
   *
   * @generated from field: uint32 type_storage_id = 2;
   */
  typeStorageId: number;

  /**
   * element_type is the type that the alias is for.
   *
   * @generated from field: stately.schemamodel.Type element_type = 3;
   */
  elementType?: Type;

  /**
   * comments are per-line comments parsed from source code that are associated with this type alias.
   *
   * @generated from field: string comments = 4;
   */
  comments: string;

  /**
   * A set of validation constraints that must all be true for the type alias to be valid.
   *
   * @generated from field: repeated stately.schemamodel.Constraint validations = 5;
   */
  validations: Constraint[];

  /**
   * deprecated indicates that this type is deprecated. This is documentation
   * and should be a description of what to use instead, or why it was
   * deprecated. It will be emitted as part of the generated code's comments.
   *
   * @generated from field: string deprecated = 6;
   */
  deprecated: string;
};

/**
 * Describes the message stately.schemamodel.TypeAlias.
 * Use `create(TypeAliasSchema)` to create a new message.
 */
export declare const TypeAliasSchema: GenMessage<TypeAlias>;

/**
 * @generated from message stately.schemamodel.Field
 */
export declare type Field = Message<"stately.schemamodel.Field"> & {
  /**
   * field_name is the human-readable name of the field.
   * This *must* be present for all fields generated by the DSL.
   * This will be omitted when persisting the storage schema as a space optimization.
   *
   * @generated from field: string field_name = 1;
   */
  fieldName: string;

  /**
   * field_wire_number is the proto field number used by the wire model.
   * This will be absent when the wire model is generated in the DSL, but will be populated
   * by the schema.Package parser and persisted with the wire schema definition.
   * This will also be omitted in the storage model.
   * This will be omitted when persisting the storage schema which is independent of wire
   * schema, as well as for space optimization.
   *
   * @generated from field: uint32 field_wire_number = 3;
   */
  fieldWireNumber: number;

  /**
   * field_storage_number is the field number used by the storage model.
   * This will be zero for a schema definition generated by the DSL, but will be populated
   * by the schema.Package parser and persisted with the wire and storage schema definitions.
   *
   * @generated from field: uint32 field_storage_number = 2;
   */
  fieldStorageNumber: number;

  /**
   * comments are multi-line comments parsed from source code, where
   * each line is separated by a '\n' character.
   *
   * @generated from field: string comments = 4;
   */
  comments: string;

  /**
   * require_non_zero is a flag that indicates that the field must be non-zero.
   *
   * @generated from field: bool require_non_zero = 5;
   */
  requireNonZero: boolean;

  /**
   * A set of validation constraints that must all be true for the type alias to be valid.
   *
   * @generated from field: repeated stately.schemamodel.Constraint validations = 6;
   */
  validations: Constraint[];

  /**
   * field_type is the type of the field.
   *
   * @generated from field: stately.schemamodel.Type field_type = 7;
   */
  fieldType?: Type;

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
   * @generated from field: string read_default = 8;
   */
  readDefault: string;

  /**
   * @generated from oneof stately.schemamodel.Field.value_option
   */
  valueOption:
    | {
        /**
         * @generated from field: stately.schemamodel.FromMetadata from_metadata = 9;
         */
        value: FromMetadata;
        case: "fromMetadata";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.InitialValue initial_value = 10;
         */
        value: InitialValue;
        case: "initialValue";
      }
    | { case: undefined; value?: undefined };

  /**
   * deprecated indicates that this field is deprecated. This is documentation
   * and should be a description of what to use instead, or why it was
   * deprecated. It will be emitted as part of the generated code's comments.
   *
   * @generated from field: string deprecated = 11;
   */
  deprecated: string;
};

/**
 * Describes the message stately.schemamodel.Field.
 * Use `create(FieldSchema)` to create a new message.
 */
export declare const FieldSchema: GenMessage<Field>;

/**
 * @generated from message stately.schemamodel.EnumValue
 */
export declare type EnumValue = Message<"stately.schemamodel.EnumValue"> & {
  /**
   * short_name is the human-readable name of the enum value.
   * This *must* be present for all enum values generated by the DSL.
   * This will be omitted when persisting the storage schema as a space optimization.
   * The short_name _should not_ include the enum type name as a prefix.
   *
   * @generated from field: string short_name = 1;
   */
  shortName: string;

  /**
   * ordinal is enum ordinal, this must be consistent across storage and wire schema.
   *
   * @generated from field: int32 ordinal = 2;
   */
  ordinal: number;

  /**
   * comments are multi-line comments parsed from source code, where
   * each line is separated by a '\n' character.
   *
   * @generated from field: string comments = 4;
   */
  comments: string;

  /**
   * deprecated indicates that this value is deprecated. This is documentation
   * and should be a description of what to use instead, or why it was
   * deprecated. It will be emitted as part of the generated code's comments.
   *
   * @generated from field: string deprecated = 3;
   */
  deprecated: string;
};

/**
 * Describes the message stately.schemamodel.EnumValue.
 * Use `create(EnumValueSchema)` to create a new message.
 */
export declare const EnumValueSchema: GenMessage<EnumValue>;

/**
 * Type is a union of all possible types that a field can assume.
 *
 * @generated from message stately.schemamodel.Type
 */
export declare type Type = Message<"stately.schemamodel.Type"> & {
  /**
   * @generated from oneof stately.schemamodel.Type.type
   */
  type:
    | {
        /**
         * @generated from field: stately.schemamodel.Number number = 1;
         */
        value: Number;
        case: "number";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.Bool bool = 2;
         */
        value: Bool;
        case: "bool";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.String string = 3;
         */
        value: String;
        case: "string";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.Binary binary = 4;
         */
        value: Binary;
        case: "binary";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.List list = 5;
         */
        value: List;
        case: "list";
      }
    | {
        /**
         * reference_by_name is a reference to another type by name.
         *
         * @generated from field: string reference_by_name = 6;
         */
        value: string;
        case: "referenceByName";
      }
    | {
        /**
         * reference_by_storage_id is a reference to another type by storage id.
         *
         * @generated from field: uint32 reference_by_storage_id = 7;
         */
        value: number;
        case: "referenceByStorageId";
      }
    | { case: undefined; value?: undefined };
};

/**
 * Describes the message stately.schemamodel.Type.
 * Use `create(TypeSchema)` to create a new message.
 */
export declare const TypeSchema: GenMessage<Type>;

/**
 * List represents a repeated type of a field.
 *
 * @generated from message stately.schemamodel.List
 */
export declare type List = Message<"stately.schemamodel.List"> & {
  /**
   * element_type is the type of the elements in the list.
   *
   * @generated from field: stately.schemamodel.Type element_type = 1;
   */
  elementType?: Type;
};

/**
 * Describes the message stately.schemamodel.List.
 * Use `create(ListSchema)` to create a new message.
 */
export declare const ListSchema: GenMessage<List>;

/**
 * A Bool proto kind.
 *
 * @generated from message stately.schemamodel.Bool
 */
export declare type Bool = Message<"stately.schemamodel.Bool"> & {};

/**
 * Describes the message stately.schemamodel.Bool.
 * Use `create(BoolSchema)` to create a new message.
 */
export declare const BoolSchema: GenMessage<Bool>;

/**
 * A String proto kind.
 *
 * @generated from message stately.schemamodel.String
 */
export declare type String = Message<"stately.schemamodel.String"> & {
  /**
   * interpret_as optionally chooses how to interpret the string in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.StringInterpretAs interpret_as = 1;
   */
  interpretAs: StringInterpretAs;
};

/**
 * Describes the message stately.schemamodel.String.
 * Use `create(StringSchema)` to create a new message.
 */
export declare const StringSchema: GenMessage<String>;

/**
 * @generated from message stately.schemamodel.Binary
 */
export declare type Binary = Message<"stately.schemamodel.Binary"> & {
  /**
   * interpret_as optionally chooses how to interpret the bytes in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.BytesInterpretAs interpret_as = 1;
   */
  interpretAs: BytesInterpretAs;
};

/**
 * Describes the message stately.schemamodel.Binary.
 * Use `create(BinarySchema)` to create a new message.
 */
export declare const BinarySchema: GenMessage<Binary>;

/**
 * @generated from message stately.schemamodel.Number
 */
export declare type Number = Message<"stately.schemamodel.Number"> & {
  /**
   * Any underlying proto-kind this number is.
   *
   * @generated from field: stately.schemamodel.NumberKind kind = 1;
   */
  kind: NumberKind;

  /**
   * interpret_as optionally chooses how to interpret the number in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.Number.
 * Use `create(NumberSchema)` to create a new message.
 */
export declare const NumberSchema: GenMessage<Number>;

/**
 * @generated from message stately.schemamodel.Constraint
 */
export declare type Constraint = Message<"stately.schemamodel.Constraint"> & {
  /**
   * cel_expression is the CEL expression that must evaluate to true for the message to be valid.
   *
   * @generated from field: string cel_expression = 1;
   */
  celExpression: string;

  /**
   * message is an optional message to display when the expression is false.
   * This exists for is support of https://app.clickup.com/t/8688wpvhx
   *
   * @generated from field: string message = 2;
   */
  message: string;
};

/**
 * Describes the message stately.schemamodel.Constraint.
 * Use `create(ConstraintSchema)` to create a new message.
 */
export declare const ConstraintSchema: GenMessage<Constraint>;

/**
 * NumberKind is the set of all possible proto number kinds.
 * The enum ordinals match 1:1 with proto kinds.
 *
 * @generated from enum stately.schemamodel.NumberKind
 */
export enum NumberKind {
  /**
   * @generated from enum value: INVALID_NUMBER_KIND = 0;
   */
  INVALID_NUMBER_KIND = 0,

  /**
   * @generated from enum value: DOUBLE_KIND = 1;
   */
  DOUBLE_KIND = 1,

  /**
   * @generated from enum value: FLOAT_KIND = 2;
   */
  FLOAT_KIND = 2,

  /**
   * @generated from enum value: INT64_KIND = 3;
   */
  INT64_KIND = 3,

  /**
   * @generated from enum value: UINT64_KIND = 4;
   */
  UINT64_KIND = 4,

  /**
   * @generated from enum value: INT32_KIND = 5;
   */
  INT32_KIND = 5,

  /**
   * @generated from enum value: FIXED64_KIND = 6;
   */
  FIXED64_KIND = 6,

  /**
   * @generated from enum value: FIXED32_KIND = 7;
   */
  FIXED32_KIND = 7,

  /**
   * @generated from enum value: UINT32_KIND = 13;
   */
  UINT32_KIND = 13,

  /**
   * @generated from enum value: SFIXED32_KIND = 15;
   */
  SFIXED32_KIND = 15,

  /**
   * @generated from enum value: SFIXED64_KIND = 16;
   */
  SFIXED64_KIND = 16,

  /**
   * @generated from enum value: SINT32_KIND = 17;
   */
  SINT32_KIND = 17,

  /**
   * @generated from enum value: SINT64_KIND = 18;
   */
  SINT64_KIND = 18,
}

/**
 * Describes the enum stately.schemamodel.NumberKind.
 */
export declare const NumberKindSchema: GenEnum<NumberKind>;
