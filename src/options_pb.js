// @generated by protoc-gen-es v2.0.0 with parameter "target=js+dts,import_extension=.js"
// @generated from file options.proto (package stately.schemamodel, syntax proto3)
/* eslint-disable */

import { enumDesc, fileDesc, messageDesc, tsEnum } from "@bufbuild/protobuf/codegenv1";
import { file_buf_validate_validate } from "./buf/validate/validate_pb.js";

/**
 * Describes the file options.proto.
 */
export const file_options =
  /*@__PURE__*/
  fileDesc(
    "Cg1vcHRpb25zLnByb3RvEhNzdGF0ZWx5LnNjaGVtYW1vZGVsIrYDCg5NZXNzYWdlT3B0aW9ucxJLCglrZXlfcGF0aHMYASADKAsyKy5zdGF0ZWx5LnNjaGVtYW1vZGVsLk1lc3NhZ2VPcHRpb25zLktleVBhdGhCC7pICMgBAZIBAhAFEiUKA3R0bBgCIAEoCzIYLnN0YXRlbHkuc2NoZW1hbW9kZWwuVHRsEjoKB2luZGV4ZXMYBCADKAsyKS5zdGF0ZWx5LnNjaGVtYW1vZGVsLk1lc3NhZ2VPcHRpb25zLkluZGV4GigKB0tleVBhdGgSHQoNcGF0aF90ZW1wbGF0ZRgBIAEoCUIGukgDyAEBGkoKBUluZGV4Eh0KDXByb3BlcnR5X3BhdGgYASABKAlCBrpIA8gBARIiChFncm91cF9sb2NhbF9pbmRleBgCIAEoDUIHukgEKgIYBDp+ukh7GnkKDmluZGV4ZXMudW5pcXVlEjR5b3UgY2FuJ3QgaGF2ZSB0d28gY29uZmlndXJhdGlvbnMgZm9yIHRoZSBzYW1lIGluZGV4GjF0aGlzLmluZGV4ZXMubWFwKGMsIGMuZ3JvdXBfbG9jYWxfaW5kZXgpLnVuaXF1ZSgpIpACCgNUdGwSIwoQZHVyYXRpb25fc2Vjb25kcxgBIAEoBEIHukgEMgIgAEgAEhgKBWZpZWxkGAIgASgJQge6SARyAhABSAASOgoGc291cmNlGAMgASgOMiIuc3RhdGVseS5zY2hlbWFtb2RlbC5UdGwuVHRsU291cmNlQga6SAPIAQEifgoJVHRsU291cmNlEhQKEFRUTF9TT1VSQ0VfVU5TRVQQABIbChdUVExfU09VUkNFX0ZST01fQ1JFQVRFRBABEiEKHVRUTF9TT1VSQ0VfRlJPTV9MQVNUX01PRElGSUVEEAISGwoXVFRMX1NPVVJDRV9BVF9USU1FU1RBTVAQA0IOCgV2YWx1ZRIFukgCCAEi2woKDEZpZWxkT3B0aW9ucxIyCgVmbG9hdBgBIAEoCzIhLnN0YXRlbHkuc2NoZW1hbW9kZWwuRmxvYXRPcHRpb25zSAASNAoGZG91YmxlGAIgASgLMiIuc3RhdGVseS5zY2hlbWFtb2RlbC5Eb3VibGVPcHRpb25zSAASMgoFaW50MzIYAyABKAsyIS5zdGF0ZWx5LnNjaGVtYW1vZGVsLkludDMyT3B0aW9uc0gAEjIKBWludDY0GAQgASgLMiEuc3RhdGVseS5zY2hlbWFtb2RlbC5JbnQ2NE9wdGlvbnNIABI0CgZ1aW50MzIYBSABKAsyIi5zdGF0ZWx5LnNjaGVtYW1vZGVsLlVJbnQzMk9wdGlvbnNIABI0CgZ1aW50NjQYBiABKAsyIi5zdGF0ZWx5LnNjaGVtYW1vZGVsLlVJbnQ2NE9wdGlvbnNIABI0CgZzaW50MzIYByABKAsyIi5zdGF0ZWx5LnNjaGVtYW1vZGVsLlNJbnQzMk9wdGlvbnNIABI0CgZzaW50NjQYCCABKAsyIi5zdGF0ZWx5LnNjaGVtYW1vZGVsLlNJbnQ2NE9wdGlvbnNIABI2CgdmaXhlZDMyGAkgASgLMiMuc3RhdGVseS5zY2hlbWFtb2RlbC5GaXhlZDMyT3B0aW9uc0gAEjYKB2ZpeGVkNjQYCiABKAsyIy5zdGF0ZWx5LnNjaGVtYW1vZGVsLkZpeGVkNjRPcHRpb25zSAASOAoIc2ZpeGVkMzIYCyABKAsyJC5zdGF0ZWx5LnNjaGVtYW1vZGVsLlNGaXhlZDMyT3B0aW9uc0gAEjgKCHNmaXhlZDY0GAwgASgLMiQuc3RhdGVseS5zY2hlbWFtb2RlbC5TRml4ZWQ2NE9wdGlvbnNIABIwCgRib29sGA0gASgLMiAuc3RhdGVseS5zY2hlbWFtb2RlbC5Cb29sT3B0aW9uc0gAEjQKBnN0cmluZxgOIAEoCzIiLnN0YXRlbHkuc2NoZW1hbW9kZWwuU3RyaW5nT3B0aW9uc0gAEjIKBWJ5dGVzGA8gASgLMiEuc3RhdGVseS5zY2hlbWFtb2RlbC5CeXRlc09wdGlvbnNIABJHCg1pbml0aWFsX3ZhbHVlGBggASgOMi4uc3RhdGVseS5zY2hlbWFtb2RlbC5GaWVsZE9wdGlvbnMuSW5pdGlhbFZhbHVlSAESRwoNZnJvbV9tZXRhZGF0YRgZIAEoDjIuLnN0YXRlbHkuc2NoZW1hbW9kZWwuRmllbGRPcHRpb25zLkZyb21NZXRhZGF0YUgBEhgKDmNlbF9leHByZXNzaW9uGBogASgJSAEi7QEKDEZyb21NZXRhZGF0YRIdChlGUk9NX01FVEFEQVRBX1VOU1BFQ0lGSUVEEAASIQodRlJPTV9NRVRBREFUQV9DUkVBVEVEX0FUX1RJTUUQARInCiNGUk9NX01FVEFEQVRBX0xBU1RfTU9ESUZJRURfQVRfVElNRRACEiQKIEZST01fTUVUQURBVEFfQ1JFQVRFRF9BVF9WRVJTSU9OEAMSKgomRlJPTV9NRVRBREFUQV9MQVNUX01PRElGSUVEX0FUX1ZFUlNJT04QBBIaChZGUk9NX01FVEFEQVRBX0tFWV9QQVRIEAYiBAgFEAUidAoMSW5pdGlhbFZhbHVlEhYKEklOSVRJQUxfVkFMVUVfTk9ORRAAEhoKFklOSVRJQUxfVkFMVUVfU0VRVUVOQ0UQARIWChJJTklUSUFMX1ZBTFVFX1VVSUQQAhIYChRJTklUSUFMX1ZBTFVFX1JBTkQ1MxAEQgYKBHR5cGVCBwoFdmFsdWUiTAoMRmxvYXRPcHRpb25zEjwKDGludGVycHJldF9hcxgCIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVySW50ZXJwcmV0QXMiTQoNRG91YmxlT3B0aW9ucxI8CgxpbnRlcnByZXRfYXMYAiABKA4yJi5zdGF0ZWx5LnNjaGVtYW1vZGVsLk51bWJlckludGVycHJldEFzIkwKDEludDMyT3B0aW9ucxI8CgxpbnRlcnByZXRfYXMYAiABKA4yJi5zdGF0ZWx5LnNjaGVtYW1vZGVsLk51bWJlckludGVycHJldEFzIkwKDEludDY0T3B0aW9ucxI8CgxpbnRlcnByZXRfYXMYAiABKA4yJi5zdGF0ZWx5LnNjaGVtYW1vZGVsLk51bWJlckludGVycHJldEFzIk0KDVVJbnQzMk9wdGlvbnMSPAoMaW50ZXJwcmV0X2FzGAIgASgOMiYuc3RhdGVseS5zY2hlbWFtb2RlbC5OdW1iZXJJbnRlcnByZXRBcyJNCg1VSW50NjRPcHRpb25zEjwKDGludGVycHJldF9hcxgCIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVySW50ZXJwcmV0QXMiTQoNU0ludDMyT3B0aW9ucxI8CgxpbnRlcnByZXRfYXMYAiABKA4yJi5zdGF0ZWx5LnNjaGVtYW1vZGVsLk51bWJlckludGVycHJldEFzIk0KDVNJbnQ2NE9wdGlvbnMSPAoMaW50ZXJwcmV0X2FzGAIgASgOMiYuc3RhdGVseS5zY2hlbWFtb2RlbC5OdW1iZXJJbnRlcnByZXRBcyJOCg5GaXhlZDMyT3B0aW9ucxI8CgxpbnRlcnByZXRfYXMYAiABKA4yJi5zdGF0ZWx5LnNjaGVtYW1vZGVsLk51bWJlckludGVycHJldEFzIk4KDkZpeGVkNjRPcHRpb25zEjwKDGludGVycHJldF9hcxgCIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVySW50ZXJwcmV0QXMiTwoPU0ZpeGVkMzJPcHRpb25zEjwKDGludGVycHJldF9hcxgCIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVySW50ZXJwcmV0QXMiTwoPU0ZpeGVkNjRPcHRpb25zEjwKDGludGVycHJldF9hcxgCIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVySW50ZXJwcmV0QXMiDQoLQm9vbE9wdGlvbnMiTQoNU3RyaW5nT3B0aW9ucxI8CgxpbnRlcnByZXRfYXMYAiABKA4yJi5zdGF0ZWx5LnNjaGVtYW1vZGVsLlN0cmluZ0ludGVycHJldEFzIksKDEJ5dGVzT3B0aW9ucxI7CgxpbnRlcnByZXRfYXMYAiABKA4yJS5zdGF0ZWx5LnNjaGVtYW1vZGVsLkJ5dGVzSW50ZXJwcmV0QXMqlwIKEU51bWJlckludGVycHJldEFzEh4KGk5VTUJFUl9JTlRFUlBSRVRfQVNfTlVNQkVSEAASKQolTlVNQkVSX0lOVEVSUFJFVF9BU19USU1FU1RBTVBfU0VDT05EUxABEi4KKk5VTUJFUl9JTlRFUlBSRVRfQVNfVElNRVNUQU1QX01JTExJU0VDT05EUxACEi4KKk5VTUJFUl9JTlRFUlBSRVRfQVNfVElNRVNUQU1QX01JQ1JPU0VDT05EUxADEigKJE5VTUJFUl9JTlRFUlBSRVRfQVNfRFVSQVRJT05fU0VDT05EUxAEEi0KKU5VTUJFUl9JTlRFUlBSRVRfQVNfRFVSQVRJT05fTUlMTElTRUNPTkRTEAUqTQoQQnl0ZXNJbnRlcnByZXRBcxIcChhCWVRFU19JTlRFUlBSRVRfQVNfQllURVMQABIbChdCWVRFU19JTlRFUlBSRVRfQVNfVVVJRBABKnIKEVN0cmluZ0ludGVycHJldEFzEh4KGlNUUklOR19JTlRFUlBSRVRfQVNfU1RSSU5HEAASIAocU1RSSU5HX0lOVEVSUFJFVF9BU19LRVlfUEFUSBABEhsKF1NUUklOR19JTlRFUlBSRVRfQVNfVVJMEAJClAEKF2NvbS5zdGF0ZWx5LnNjaGVtYW1vZGVsQgxPcHRpb25zUHJvdG9QAaICA1NTWKoCE1N0YXRlbHkuU2NoZW1hbW9kZWzKAhNTdGF0ZWx5XFNjaGVtYW1vZGVs4gIfU3RhdGVseVxTY2hlbWFtb2RlbFxHUEJNZXRhZGF0YeoCFFN0YXRlbHk6OlNjaGVtYW1vZGVsYgZwcm90bzM",
    [file_buf_validate_validate],
  );

/**
 * Describes the message stately.schemamodel.MessageOptions.
 * Use `create(MessageOptionsSchema)` to create a new message.
 */
export const MessageOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 0);

/**
 * Describes the message stately.schemamodel.MessageOptions.KeyPath.
 * Use `create(MessageOptions_KeyPathSchema)` to create a new message.
 */
export const MessageOptions_KeyPathSchema = /*@__PURE__*/ messageDesc(file_options, 0, 0);

/**
 * Describes the message stately.schemamodel.MessageOptions.Index.
 * Use `create(MessageOptions_IndexSchema)` to create a new message.
 */
export const MessageOptions_IndexSchema = /*@__PURE__*/ messageDesc(file_options, 0, 1);

/**
 * Describes the message stately.schemamodel.Ttl.
 * Use `create(TtlSchema)` to create a new message.
 */
export const TtlSchema = /*@__PURE__*/ messageDesc(file_options, 1);

/**
 * Describes the enum stately.schemamodel.Ttl.TtlSource.
 */
export const Ttl_TtlSourceSchema = /*@__PURE__*/ enumDesc(file_options, 1, 0);

/**
 * TtlSource is an enum that specifies how the TTL of an item should be
 * calculated based on the value of a field.
 *
 * @generated from enum stately.schemamodel.Ttl.TtlSource
 */
export const Ttl_TtlSource = /*@__PURE__*/ tsEnum(Ttl_TtlSourceSchema);

/**
 * Describes the message stately.schemamodel.FieldOptions.
 * Use `create(FieldOptionsSchema)` to create a new message.
 */
export const FieldOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 2);

/**
 * Describes the enum stately.schemamodel.FieldOptions.FromMetadata.
 */
export const FieldOptions_FromMetadataSchema = /*@__PURE__*/ enumDesc(file_options, 2, 0);

/**
 * @generated from enum stately.schemamodel.FieldOptions.FromMetadata
 */
export const FieldOptions_FromMetadata = /*@__PURE__*/ tsEnum(FieldOptions_FromMetadataSchema);

/**
 * Describes the enum stately.schemamodel.FieldOptions.InitialValue.
 */
export const FieldOptions_InitialValueSchema = /*@__PURE__*/ enumDesc(file_options, 2, 1);

/**
 * InitialValue specifies where the initial value for a field should come from
 * if it is not explicitly set when created. All of these values would be
 * assigned by the server at creation time.
 *
 * @generated from enum stately.schemamodel.FieldOptions.InitialValue
 */
export const FieldOptions_InitialValue = /*@__PURE__*/ tsEnum(FieldOptions_InitialValueSchema);

/**
 * Describes the message stately.schemamodel.FloatOptions.
 * Use `create(FloatOptionsSchema)` to create a new message.
 */
export const FloatOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 3);

/**
 * Describes the message stately.schemamodel.DoubleOptions.
 * Use `create(DoubleOptionsSchema)` to create a new message.
 */
export const DoubleOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 4);

/**
 * Describes the message stately.schemamodel.Int32Options.
 * Use `create(Int32OptionsSchema)` to create a new message.
 */
export const Int32OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 5);

/**
 * Describes the message stately.schemamodel.Int64Options.
 * Use `create(Int64OptionsSchema)` to create a new message.
 */
export const Int64OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 6);

/**
 * Describes the message stately.schemamodel.UInt32Options.
 * Use `create(UInt32OptionsSchema)` to create a new message.
 */
export const UInt32OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 7);

/**
 * Describes the message stately.schemamodel.UInt64Options.
 * Use `create(UInt64OptionsSchema)` to create a new message.
 */
export const UInt64OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 8);

/**
 * Describes the message stately.schemamodel.SInt32Options.
 * Use `create(SInt32OptionsSchema)` to create a new message.
 */
export const SInt32OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 9);

/**
 * Describes the message stately.schemamodel.SInt64Options.
 * Use `create(SInt64OptionsSchema)` to create a new message.
 */
export const SInt64OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 10);

/**
 * Describes the message stately.schemamodel.Fixed32Options.
 * Use `create(Fixed32OptionsSchema)` to create a new message.
 */
export const Fixed32OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 11);

/**
 * Describes the message stately.schemamodel.Fixed64Options.
 * Use `create(Fixed64OptionsSchema)` to create a new message.
 */
export const Fixed64OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 12);

/**
 * Describes the message stately.schemamodel.SFixed32Options.
 * Use `create(SFixed32OptionsSchema)` to create a new message.
 */
export const SFixed32OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 13);

/**
 * Describes the message stately.schemamodel.SFixed64Options.
 * Use `create(SFixed64OptionsSchema)` to create a new message.
 */
export const SFixed64OptionsSchema = /*@__PURE__*/ messageDesc(file_options, 14);

/**
 * Describes the message stately.schemamodel.BoolOptions.
 * Use `create(BoolOptionsSchema)` to create a new message.
 */
export const BoolOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 15);

/**
 * Describes the message stately.schemamodel.StringOptions.
 * Use `create(StringOptionsSchema)` to create a new message.
 */
export const StringOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 16);

/**
 * Describes the message stately.schemamodel.BytesOptions.
 * Use `create(BytesOptionsSchema)` to create a new message.
 */
export const BytesOptionsSchema = /*@__PURE__*/ messageDesc(file_options, 17);

/**
 * Describes the enum stately.schemamodel.NumberInterpretAs.
 */
export const NumberInterpretAsSchema = /*@__PURE__*/ enumDesc(file_options, 0);

/**
 * TODO: Not sure if I'll regret using a single "number" enum for ints and
 * floats, but we can always fork them later.
 *
 * @generated from enum stately.schemamodel.NumberInterpretAs
 */
export const NumberInterpretAs = /*@__PURE__*/ tsEnum(NumberInterpretAsSchema);

/**
 * Describes the enum stately.schemamodel.BytesInterpretAs.
 */
export const BytesInterpretAsSchema = /*@__PURE__*/ enumDesc(file_options, 1);

/**
 * @generated from enum stately.schemamodel.BytesInterpretAs
 */
export const BytesInterpretAs = /*@__PURE__*/ tsEnum(BytesInterpretAsSchema);

/**
 * Describes the enum stately.schemamodel.StringInterpretAs.
 */
export const StringInterpretAsSchema = /*@__PURE__*/ enumDesc(file_options, 2);

/**
 * @generated from enum stately.schemamodel.StringInterpretAs
 */
export const StringInterpretAs = /*@__PURE__*/ tsEnum(StringInterpretAsSchema);
