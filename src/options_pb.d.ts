// @generated by protoc-gen-es v2.2.4 with parameter "target=js+dts,import_extension=.js"
// @generated from file options.proto (package stately.schemamodel, syntax proto3)
/* eslint-disable */

import type { Message } from "@bufbuild/protobuf";
import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";

/**
 * Describes the file options.proto.
 */
export declare const file_options: GenFile;

/**
 * @generated from message stately.schemamodel.MessageOptions
 */
export declare type MessageOptions = Message<"stately.schemamodel.MessageOptions"> & {
  /**
   * key_paths is a list of key paths that this message will be stored at. The
   * first entry in this list is required, while subsequent entries represent
   * aliased alternative paths. For example, a user might be stored at both
   * `/org-id/user-id` and `/user-id`. The first path is the "primary" path that
   * can be used as the item's canonical full ID, and the subsequent paths are
   * "aliases" that can also be used to get/list/put/delete the item.
   *
   * @generated from field: repeated stately.schemamodel.MessageOptions.KeyPath key_paths = 1;
   */
  keyPaths: MessageOptions_KeyPath[];

  /**
   * ttl optionally controls the TTL of the item as a whole.
   *
   * @generated from field: stately.schemamodel.Ttl ttl = 2;
   */
  ttl?: Ttl;

  /**
   * @generated from field: repeated stately.schemamodel.MessageOptions.Index indexes = 4;
   */
  indexes: MessageOptions_Index[];
};

/**
 * Describes the message stately.schemamodel.MessageOptions.
 * Use `create(MessageOptionsSchema)` to create a new message.
 */
export declare const MessageOptionsSchema: GenMessage<MessageOptions>;

/**
 * @generated from message stately.schemamodel.MessageOptions.KeyPath
 */
export declare type MessageOptions_KeyPath =
  Message<"stately.schemamodel.MessageOptions.KeyPath"> & {
    /**
     * path_template is a url pattern that will be used to generate the path for
     * this key. The template should be a valid URL Pattern as defined in
     * https://urlpattern.spec.whatwg.org/ (see also
     * https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API and
     * https://github.com/soongo/path-to-regexp). It should also be a valid
     * Stately key path when all variables are substituted into it. Each variable
     * should correspond to the name or field ID of a field in the parent message,
     * and each of those fields should be a number, string, or binary type.
     *
     * For example, a `User` message with fields `user_id` and `org_id` could have
     * a key path template of `/orgs-:org_id/users-:user_id`.
     *
     * @generated from field: string path_template = 1;
     */
    pathTemplate: string;

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
     * Note: this field is 'optional' to distinguish between 0, a valid configuration,
     * and not having the field set at all, which may indicate a customer calling from
     * an older CLI that doesn't support this feature.
     *
     * @generated from field: optional stately.schemamodel.SupportedFeatures supported_feature_flags = 2;
     */
    supportedFeatureFlags?: SupportedFeatures;
  };

/**
 * Describes the message stately.schemamodel.MessageOptions.KeyPath.
 * Use `create(MessageOptions_KeyPathSchema)` to create a new message.
 */
export declare const MessageOptions_KeyPathSchema: GenMessage<MessageOptions_KeyPath>;

/**
 * Index configures how we should build indexes based on the fields of the
 * item. Today this can only configure LSIs but could be extended to configure
 * other indexes, or we could use another structure for that.
 *
 * @generated from message stately.schemamodel.MessageOptions.Index
 */
export declare type MessageOptions_Index = Message<"stately.schemamodel.MessageOptions.Index"> & {
  /**
   * property_path is the path to the field that should be indexed. This is a
   * required field, and should be a valid path to a field in the message in
   * property path syntax.
   *
   * @generated from field: string property_path = 1;
   */
  propertyPath: string;

  /**
   * group_local_index optionally chooses a group-local index (LSI) that should be
   * populated with this field's value. We support up to 4 group-local indexed
   * fields per message.
   *
   * @generated from field: uint32 group_local_index = 2;
   */
  groupLocalIndex: number;
};

/**
 * Describes the message stately.schemamodel.MessageOptions.Index.
 * Use `create(MessageOptions_IndexSchema)` to create a new message.
 */
export declare const MessageOptions_IndexSchema: GenMessage<MessageOptions_Index>;

/**
 * @generated from message stately.schemamodel.Ttl
 */
export declare type Ttl = Message<"stately.schemamodel.Ttl"> & {
  /**
   * @generated from oneof stately.schemamodel.Ttl.value
   */
  value:
    | {
        /**
         * duration_seconds sets the offset for the TTL source. For example, if the
         * source is FROM_CREATED, and offset_duration_s is 15, then the item
         * will expire 15s after it was created.
         *
         * @generated from field: uint64 duration_seconds = 1;
         */
        value: bigint;
        case: "durationSeconds";
      }
    | {
        /**
         * field sets a field to control the TTL, in property path syntax. For
         * example, if the source is FROM_CREATED, and ttl_field is "lifetime", and
         * "lifetime" is a field that holds a duration in seconds, then the item
         * will expire "lifetime" seconds after the item was created.
         *
         * @generated from field: string field = 2;
         */
        value: string;
        case: "field";
      }
    | { case: undefined; value?: undefined };

  /**
   * ttl_source explains how the value should be used to calculate the item TTL.
   *
   * @generated from field: stately.schemamodel.Ttl.TtlSource source = 3;
   */
  source: Ttl_TtlSource;
};

/**
 * Describes the message stately.schemamodel.Ttl.
 * Use `create(TtlSchema)` to create a new message.
 */
export declare const TtlSchema: GenMessage<Ttl>;

/**
 * TtlSource is an enum that specifies how the TTL of an item should be
 * calculated based on the value of a field.
 *
 * @generated from enum stately.schemamodel.Ttl.TtlSource
 */
export enum Ttl_TtlSource {
  /**
   * The default value is no TTL. The item will not automatically expire. This
   * shouldn't actually be used - instead, ttl should not be set on the
   * message.
   *
   * @generated from enum value: TTL_SOURCE_UNSET = 0;
   */
  UNSET = 0,

  /**
   * Set the TTL of the item to the value in seconds from the time the
   * item was created.
   *
   * @generated from enum value: TTL_SOURCE_FROM_CREATED = 1;
   */
  FROM_CREATED = 1,

  /**
   * Set the TTL of the item to the value in seconds from the time the
   * item was last modified. This expiry is pushed out every time the item is
   * modified.
   *
   * @generated from enum value: TTL_SOURCE_FROM_LAST_MODIFIED = 2;
   */
  FROM_LAST_MODIFIED = 2,

  /**
   * Set the TTL of the item to the value as an absolute UNIX
   * timestamp.
   *
   * @generated from enum value: TTL_SOURCE_AT_TIMESTAMP = 3;
   */
  AT_TIMESTAMP = 3,
}

/**
 * Describes the enum stately.schemamodel.Ttl.TtlSource.
 */
export declare const Ttl_TtlSourceSchema: GenEnum<Ttl_TtlSource>;

/**
 * @generated from message stately.schemamodel.FieldOptions
 */
export declare type FieldOptions = Message<"stately.schemamodel.FieldOptions"> & {
  /**
   * TODO: Originally I imagined we'd have a bunch more options that are
   * type-specific, but it turns out that it's mostly just the interpret_as
   * options. Replace this with a oneof of the string/bytes/number interpret_as?
   *
   * @generated from oneof stately.schemamodel.FieldOptions.type
   */
  type:
    | {
        /**
         * Scalar Field Types
         *
         * @generated from field: stately.schemamodel.FloatOptions float = 1;
         */
        value: FloatOptions;
        case: "float";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.DoubleOptions double = 2;
         */
        value: DoubleOptions;
        case: "double";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.Int32Options int32 = 3;
         */
        value: Int32Options;
        case: "int32";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.Int64Options int64 = 4;
         */
        value: Int64Options;
        case: "int64";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.UInt32Options uint32 = 5;
         */
        value: UInt32Options;
        case: "uint32";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.UInt64Options uint64 = 6;
         */
        value: UInt64Options;
        case: "uint64";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.SInt32Options sint32 = 7;
         */
        value: SInt32Options;
        case: "sint32";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.SInt64Options sint64 = 8;
         */
        value: SInt64Options;
        case: "sint64";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.Fixed32Options fixed32 = 9;
         */
        value: Fixed32Options;
        case: "fixed32";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.Fixed64Options fixed64 = 10;
         */
        value: Fixed64Options;
        case: "fixed64";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.SFixed32Options sfixed32 = 11;
         */
        value: SFixed32Options;
        case: "sfixed32";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.SFixed64Options sfixed64 = 12;
         */
        value: SFixed64Options;
        case: "sfixed64";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.StringOptions string = 14;
         */
        value: StringOptions;
        case: "string";
      }
    | {
        /**
         * @generated from field: stately.schemamodel.BytesOptions bytes = 15;
         */
        value: BytesOptions;
        case: "bytes";
      }
    | { case: undefined; value?: undefined };

  /**
   * @generated from oneof stately.schemamodel.FieldOptions.value
   */
  value:
    | {
        /**
         * initial_value optionally chooses where the initial value for a field
         * comes from if it is not provided at creation. The field behaves normally
         * after its default is populated. Not all values are valid for all types -
         * I guess we could have only the valid options defined in each type option
         * message, but that feels unnecessary.
         * TODO: Maybe rename this "generate_id" to be more specific
         *
         * @generated from field: stately.schemamodel.InitialValue initial_value = 24;
         */
        value: InitialValue;
        case: "initialValue";
      }
    | {
        /**
         * from_metadata optionally chooses which metadata field to reflect into
         * this field. This implicitly makes the field read-only. Any value
         * specified in this field by customers is ignored, as it will be populated
         * by the system.
         *
         * @generated from field: stately.schemamodel.FromMetadata from_metadata = 25;
         */
        value: FromMetadata;
        case: "fromMetadata";
      }
    | { case: undefined; value?: undefined };

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
   * @generated from field: string read_default = 16;
   */
  readDefault: string;
};

/**
 * Describes the message stately.schemamodel.FieldOptions.
 * Use `create(FieldOptionsSchema)` to create a new message.
 */
export declare const FieldOptionsSchema: GenMessage<FieldOptions>;

/**
 * The following are options that differ based on the underlying type of the field.
 *
 * @generated from message stately.schemamodel.FloatOptions
 */
export declare type FloatOptions = Message<"stately.schemamodel.FloatOptions"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.FloatOptions.
 * Use `create(FloatOptionsSchema)` to create a new message.
 */
export declare const FloatOptionsSchema: GenMessage<FloatOptions>;

/**
 * @generated from message stately.schemamodel.DoubleOptions
 */
export declare type DoubleOptions = Message<"stately.schemamodel.DoubleOptions"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.DoubleOptions.
 * Use `create(DoubleOptionsSchema)` to create a new message.
 */
export declare const DoubleOptionsSchema: GenMessage<DoubleOptions>;

/**
 * @generated from message stately.schemamodel.Int32Options
 */
export declare type Int32Options = Message<"stately.schemamodel.Int32Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.Int32Options.
 * Use `create(Int32OptionsSchema)` to create a new message.
 */
export declare const Int32OptionsSchema: GenMessage<Int32Options>;

/**
 * @generated from message stately.schemamodel.Int64Options
 */
export declare type Int64Options = Message<"stately.schemamodel.Int64Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.Int64Options.
 * Use `create(Int64OptionsSchema)` to create a new message.
 */
export declare const Int64OptionsSchema: GenMessage<Int64Options>;

/**
 * @generated from message stately.schemamodel.UInt32Options
 */
export declare type UInt32Options = Message<"stately.schemamodel.UInt32Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.UInt32Options.
 * Use `create(UInt32OptionsSchema)` to create a new message.
 */
export declare const UInt32OptionsSchema: GenMessage<UInt32Options>;

/**
 * @generated from message stately.schemamodel.UInt64Options
 */
export declare type UInt64Options = Message<"stately.schemamodel.UInt64Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.UInt64Options.
 * Use `create(UInt64OptionsSchema)` to create a new message.
 */
export declare const UInt64OptionsSchema: GenMessage<UInt64Options>;

/**
 * @generated from message stately.schemamodel.SInt32Options
 */
export declare type SInt32Options = Message<"stately.schemamodel.SInt32Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.SInt32Options.
 * Use `create(SInt32OptionsSchema)` to create a new message.
 */
export declare const SInt32OptionsSchema: GenMessage<SInt32Options>;

/**
 * @generated from message stately.schemamodel.SInt64Options
 */
export declare type SInt64Options = Message<"stately.schemamodel.SInt64Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.SInt64Options.
 * Use `create(SInt64OptionsSchema)` to create a new message.
 */
export declare const SInt64OptionsSchema: GenMessage<SInt64Options>;

/**
 * @generated from message stately.schemamodel.Fixed32Options
 */
export declare type Fixed32Options = Message<"stately.schemamodel.Fixed32Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.Fixed32Options.
 * Use `create(Fixed32OptionsSchema)` to create a new message.
 */
export declare const Fixed32OptionsSchema: GenMessage<Fixed32Options>;

/**
 * @generated from message stately.schemamodel.Fixed64Options
 */
export declare type Fixed64Options = Message<"stately.schemamodel.Fixed64Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.Fixed64Options.
 * Use `create(Fixed64OptionsSchema)` to create a new message.
 */
export declare const Fixed64OptionsSchema: GenMessage<Fixed64Options>;

/**
 * @generated from message stately.schemamodel.SFixed32Options
 */
export declare type SFixed32Options = Message<"stately.schemamodel.SFixed32Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.SFixed32Options.
 * Use `create(SFixed32OptionsSchema)` to create a new message.
 */
export declare const SFixed32OptionsSchema: GenMessage<SFixed32Options>;

/**
 * @generated from message stately.schemamodel.SFixed64Options
 */
export declare type SFixed64Options = Message<"stately.schemamodel.SFixed64Options"> & {
  /**
   * interpret_as optionally chooses how to interpret the value in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.NumberInterpretAs interpret_as = 2;
   */
  interpretAs: NumberInterpretAs;
};

/**
 * Describes the message stately.schemamodel.SFixed64Options.
 * Use `create(SFixed64OptionsSchema)` to create a new message.
 */
export declare const SFixed64OptionsSchema: GenMessage<SFixed64Options>;

/**
 * @generated from message stately.schemamodel.StringOptions
 */
export declare type StringOptions = Message<"stately.schemamodel.StringOptions"> & {
  /**
   * interpret_as optionally chooses how to interpret the string in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.StringInterpretAs interpret_as = 2;
   */
  interpretAs: StringInterpretAs;
};

/**
 * Describes the message stately.schemamodel.StringOptions.
 * Use `create(StringOptionsSchema)` to create a new message.
 */
export declare const StringOptionsSchema: GenMessage<StringOptions>;

/**
 * @generated from message stately.schemamodel.BytesOptions
 */
export declare type BytesOptions = Message<"stately.schemamodel.BytesOptions"> & {
  /**
   * interpret_as optionally chooses how to interpret the bytes in this field,
   * which can affect how they are exposed via generated SDK code.
   *
   * @generated from field: stately.schemamodel.BytesInterpretAs interpret_as = 2;
   */
  interpretAs: BytesInterpretAs;
};

/**
 * Describes the message stately.schemamodel.BytesOptions.
 * Use `create(BytesOptionsSchema)` to create a new message.
 */
export declare const BytesOptionsSchema: GenMessage<BytesOptions>;

/**
 * SupportedFeatures is the set of enum bit flags which
 * are combined to indicate which features are enabled for a key path.
 * Each enum value is a power of 2, so they can be combined with bitwise OR.
 * For example, to indicate that a key path supports both VERSIONED_GROUP and SYNC,
 * the supported_feature_flags would be 1 << 1 | 1 << 2 = 3.
 *
 * @generated from enum stately.schemamodel.SupportedFeatures
 */
export enum SupportedFeatures {
  /**
   * NONE does not represent any feature. This is not a valid value. I would have
   * preferred to omit this but buf validate requires a zero value.
   *
   * @generated from enum value: NONE = 0;
   */
  NONE = 0,

  /**
   * VERSIONED_GROUP indicates that the key path supports group versioning.
   *
   * @generated from enum value: VERSIONED_GROUP = 1;
   */
  VERSIONED_GROUP = 1,

  /**
   * SYNC indicates that the key path supports syncing.
   *
   * @generated from enum value: SYNC = 2;
   */
  SYNC = 2,
}

/**
 * Describes the enum stately.schemamodel.SupportedFeatures.
 */
export declare const SupportedFeaturesSchema: GenEnum<SupportedFeatures>;

/**
 * @generated from enum stately.schemamodel.FromMetadata
 */
export enum FromMetadata {
  /**
   * @generated from enum value: FROM_METADATA_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * Populate this field with the timestamp when the item was first created.
   *
   * @generated from enum value: FROM_METADATA_CREATED_AT_TIME = 1;
   */
  CREATED_AT_TIME = 1,

  /**
   * Populate this field with the timestamp when the item was most recently modified.
   *
   * @generated from enum value: FROM_METADATA_LAST_MODIFIED_AT_TIME = 2;
   */
  LAST_MODIFIED_AT_TIME = 2,

  /**
   * Populate this field with the group version when the item was first created.
   *
   * @generated from enum value: FROM_METADATA_CREATED_AT_VERSION = 3;
   */
  CREATED_AT_VERSION = 3,

  /**
   * Populate this field with the group version when the item was most recently modified.
   *
   * @generated from enum value: FROM_METADATA_LAST_MODIFIED_AT_VERSION = 4;
   */
  LAST_MODIFIED_AT_VERSION = 4,

  /**
   * Populate this field with the TTL of the item.
   *
   * @generated from enum value: FROM_METADATA_TTL = 7;
   */
  TTL = 7,
}

/**
 * Describes the enum stately.schemamodel.FromMetadata.
 */
export declare const FromMetadataSchema: GenEnum<FromMetadata>;

/**
 * InitialValue specifies where the initial value for a field should come from
 * if it is not explicitly set when created. All of these values would be
 * assigned by the server at creation time.
 *
 * @generated from enum stately.schemamodel.InitialValue
 */
export enum InitialValue {
  /**
   * @generated from enum value: INITIAL_VALUE_NONE = 0;
   */
  NONE = 0,

  /**
   * SEQUENCE will assign the field a monotonically increasing, contiguous ID
   * that is unique *within the parent path and item type*. This is only valid
   * for a numeric ID field of a non-root item.
   *
   * @generated from enum value: INITIAL_VALUE_SEQUENCE = 1;
   */
  SEQUENCE = 1,

  /**
   * UUID will assign the field a globally unique, random 128-bit UUIDv4. This
   * will be encoded in the item key path as a binary ID. This is usable
   * anywhere, in any store config. This is only valid for bytes types.
   *
   * @generated from enum value: INITIAL_VALUE_UUID = 2;
   */
  UUID = 2,

  /**
   * RAND53 will assign the field a random 53-bit numeric ID that is unique
   * *within the parent path and item type*, but is not globally unique. This is
   * usable anywhere, in any store config. We use 53 bits instead of 64 because
   * 53 bits is still a lot of bits, and it's the largest integer that can be
   * represented exactly in JavaScript. This is only valid for a numeric ID
   * field of a non-root item.
   *
   * @generated from enum value: INITIAL_VALUE_RAND53 = 4;
   */
  RAND53 = 4,
}

/**
 * Describes the enum stately.schemamodel.InitialValue.
 */
export declare const InitialValueSchema: GenEnum<InitialValue>;

/**
 * TODO: Not sure if I'll regret using a single "number" enum for ints and
 * floats, but we can always fork them later.
 *
 * @generated from enum stately.schemamodel.NumberInterpretAs
 */
export enum NumberInterpretAs {
  /**
   * The default value is to interpret as the numeric value.
   *
   * @generated from enum value: NUMBER_INTERPRET_AS_NUMBER = 0;
   */
  NUMBER = 0,

  /**
   * The value is a UNIX timestamp in seconds. The precision is based on the
   * original type's capacity (e.g. ints are truncated, floats are as close to
   * microseconds as possible).
   *
   * @generated from enum value: NUMBER_INTERPRET_AS_TIMESTAMP_SECONDS = 1;
   */
  TIMESTAMP_SECONDS = 1,

  /**
   * The value is a UNIX timestamp in milliseconds. The precision is based on
   * the original type's capacity (e.g. ints are truncated, floats are as close
   * to microseconds as possible).
   *
   * @generated from enum value: NUMBER_INTERPRET_AS_TIMESTAMP_MILLISECONDS = 2;
   */
  TIMESTAMP_MILLISECONDS = 2,

  /**
   * The value is a UNIX timestamp in microseconds. The precision is based on
   * the original type's capacity (e.g. ints are truncated, floats are as close
   * to microseconds as possible).
   *
   * @generated from enum value: NUMBER_INTERPRET_AS_TIMESTAMP_MICROSECONDS = 3;
   */
  TIMESTAMP_MICROSECONDS = 3,

  /**
   * The value is a duration in seconds. The precision is based on the original
   * type's capacity (e.g. ints are truncated, floats are not).
   *
   * @generated from enum value: NUMBER_INTERPRET_AS_DURATION_SECONDS = 4;
   */
  DURATION_SECONDS = 4,

  /**
   * The value is a duration in milliseconds. The precision is based on the
   * original type's capacity (e.g. ints are truncated, floats are not).
   *
   * @generated from enum value: NUMBER_INTERPRET_AS_DURATION_MILLISECONDS = 5;
   */
  DURATION_MILLISECONDS = 5,
}

/**
 * Describes the enum stately.schemamodel.NumberInterpretAs.
 */
export declare const NumberInterpretAsSchema: GenEnum<NumberInterpretAs>;

/**
 * @generated from enum stately.schemamodel.BytesInterpretAs
 */
export enum BytesInterpretAs {
  /**
   * The default value is to interpret the bytes as a binary blob.
   *
   * @generated from enum value: BYTES_INTERPRET_AS_BYTES = 0;
   */
  BYTES = 0,

  /**
   * The bytes are a 128-bit (16 byte) UUID. The length should be validated.
   *
   * @generated from enum value: BYTES_INTERPRET_AS_UUID = 1;
   */
  UUID = 1,
}

/**
 * Describes the enum stately.schemamodel.BytesInterpretAs.
 */
export declare const BytesInterpretAsSchema: GenEnum<BytesInterpretAs>;

/**
 * @generated from enum stately.schemamodel.StringInterpretAs
 */
export enum StringInterpretAs {
  /**
   * The default value is to interpret the string as a string.
   *
   * @generated from enum value: STRING_INTERPRET_AS_STRING = 0;
   */
  STRING = 0,

  /**
   * The string is a key path to another item. The path should be validated.
   *
   * @generated from enum value: STRING_INTERPRET_AS_KEY_PATH = 1;
   */
  KEY_PATH = 1,

  /**
   * The string is a URL. The URL should be validated.
   *
   * @generated from enum value: STRING_INTERPRET_AS_URL = 2;
   */
  URL = 2,
}

/**
 * Describes the enum stately.schemamodel.StringInterpretAs.
 */
export declare const StringInterpretAsSchema: GenEnum<StringInterpretAs>;
