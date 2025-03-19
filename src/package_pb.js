// @generated by protoc-gen-es v2.2.4 with parameter "target=js+dts,import_extension=.js"
// @generated from file package.proto (package stately.schemamodel, syntax proto3)
/* eslint-disable */

import { enumDesc, fileDesc, messageDesc, tsEnum } from "@bufbuild/protobuf/codegenv1";
import { file_buf_validate_validate } from "./buf/validate/validate_pb.js";
import { file_options } from "./options_pb.js";

/**
 * Describes the file package.proto.
 */
export const file_package =
  /*@__PURE__*/
  fileDesc(
    "Cg1wYWNrYWdlLnByb3RvEhNzdGF0ZWx5LnNjaGVtYW1vZGVsIp8CCg1TY2hlbWFQYWNrYWdlEhQKDHBhY2thZ2VfbmFtZRgBIAEoCRIRCglmaWxlX25hbWUYAiABKAkSMgoIbWVzc2FnZXMYAyADKAsyIC5zdGF0ZWx5LnNjaGVtYW1vZGVsLk1lc3NhZ2VUeXBlEiwKBWVudW1zGAQgAygLMh0uc3RhdGVseS5zY2hlbWFtb2RlbC5FbnVtVHlwZRI0Cgx0eXBlX2FsaWFzZXMYBSADKAsyHi5zdGF0ZWx5LnNjaGVtYW1vZGVsLlR5cGVBbGlhcxJNChRkZWZhdWx0X2dyb3VwX2NvbmZpZxgGIAEoCzInLnN0YXRlbHkuc2NoZW1hbW9kZWwuRGVmYXVsdEdyb3VwQ29uZmlnQga6SAPIAQEigQEKEkRlZmF1bHRHcm91cENvbmZpZxJHChdzdXBwb3J0ZWRfZmVhdHVyZV9mbGFncxgBIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuU3VwcG9ydGVkRmVhdHVyZXMSIgoadG9tYnN0b25lX2R1cmF0aW9uX3NlY29uZHMYAiABKAQihAMKC01lc3NhZ2VUeXBlEhEKCXR5cGVfbmFtZRgBIAEoCRIXCg90eXBlX3N0b3JhZ2VfaWQYAiABKA0SEAoIY29tbWVudHMYAyABKAkSNAoLdmFsaWRhdGlvbnMYBCADKAsyHy5zdGF0ZWx5LnNjaGVtYW1vZGVsLkNvbnN0cmFpbnQSNAoGZmllbGRzGAUgAygLMhouc3RhdGVseS5zY2hlbWFtb2RlbC5GaWVsZEIIukgFkgECCAESPgoRaXRlbV90eXBlX29wdGlvbnMYBiABKAsyIy5zdGF0ZWx5LnNjaGVtYW1vZGVsLk1lc3NhZ2VPcHRpb25zOooBukiGARqDAQoYdHlwZV9pZGVudGlmaWVyLnJlcXVpcmVkEjVhdCBsZWFzdCBvbmUgdHlwZV9uYW1lIG9yIHR5cGVfc3RvcmFnZV9pZCBtdXN0IGJlIHNldBowaGFzKHRoaXMudHlwZV9uYW1lKSB8fCBoYXModGhpcy50eXBlX3N0b3JhZ2VfaWQpIoUCCghFbnVtVHlwZRIRCgl0eXBlX25hbWUYASABKAkSFwoPdHlwZV9zdG9yYWdlX2lkGAIgASgNEhAKCGNvbW1lbnRzGAQgASgJEi4KBnZhbHVlcxgDIAMoCzIeLnN0YXRlbHkuc2NoZW1hbW9kZWwuRW51bVZhbHVlOooBukiGARqDAQoYdHlwZV9pZGVudGlmaWVyLnJlcXVpcmVkEjVhdCBsZWFzdCBvbmUgdHlwZV9uYW1lIG9yIHR5cGVfc3RvcmFnZV9pZCBtdXN0IGJlIHNldBowaGFzKHRoaXMudHlwZV9uYW1lKSB8fCBoYXModGhpcy50eXBlX3N0b3JhZ2VfaWQpIrYDCglUeXBlQWxpYXMSGQoJdHlwZV9uYW1lGAEgASgJQga6SAPIAQESFwoPdHlwZV9zdG9yYWdlX2lkGAIgASgNEjcKDGVsZW1lbnRfdHlwZRgDIAEoCzIZLnN0YXRlbHkuc2NoZW1hbW9kZWwuVHlwZUIGukgDyAEBEhAKCGNvbW1lbnRzGAQgASgJEjQKC3ZhbGlkYXRpb25zGAUgAygLMh8uc3RhdGVseS5zY2hlbWFtb2RlbC5Db25zdHJhaW50OvMBukjvARrsAQoidHlwZV9hbGlhcy5kaXNhbGxvd2VkX2VsZW1lbnRfdHlwZRJIdHlwZSBhbGlhc2VzIGNhbm5vdCBiZSBmb3IgY29sbGVjdGlvbnMsIG9uZS1vZnMsIG90aGVyIGFsaWFzZXMsIG9yIGVudW1zGnwhaGFzKHRoaXMuZWxlbWVudF90eXBlLmxpc3QpICYmICFoYXModGhpcy5lbGVtZW50X3R5cGUucmVmZXJlbmNlX2J5X25hbWUpICYmICFoYXModGhpcy5lbGVtZW50X3R5cGUucmVmZXJlbmNlX2J5X3N0b3JhZ2VfaWQpIs8FCgVGaWVsZBISCgpmaWVsZF9uYW1lGAEgASgJEhkKEWZpZWxkX3dpcmVfbnVtYmVyGAMgASgNEhwKFGZpZWxkX3N0b3JhZ2VfbnVtYmVyGAIgASgNEhAKCGNvbW1lbnRzGAQgASgJEhgKEHJlcXVpcmVfbm9uX3plcm8YBSABKAgSNAoLdmFsaWRhdGlvbnMYBiADKAsyHy5zdGF0ZWx5LnNjaGVtYW1vZGVsLkNvbnN0cmFpbnQSLQoKZmllbGRfdHlwZRgHIAEoCzIZLnN0YXRlbHkuc2NoZW1hbW9kZWwuVHlwZRIUCgxyZWFkX2RlZmF1bHQYCCABKAkSOgoNZnJvbV9tZXRhZGF0YRgJIAEoDjIhLnN0YXRlbHkuc2NoZW1hbW9kZWwuRnJvbU1ldGFkYXRhSAASOgoNaW5pdGlhbF92YWx1ZRgKIAEoDjIhLnN0YXRlbHkuc2NoZW1hbW9kZWwuSW5pdGlhbFZhbHVlSAA6yQK6SMUCGsICChlmaWVsZF9pZGVudGlmaWVyLnJlcXVpcmVkEo8BV2hlbiBmaWVsZF9zdG9yYWdlX251bWJlciBpcyBzZXQsIGZpZWxkX3dpcmVfbnVtYmVyIGFuZCBmaWVsZF9uYW1lIG1heSBiZSBvbWl0dGVkLCBvdGhlcndpc2UgYm90aCBmaWVsZF93aXJlX251bWJlciBhbmQgZmllbGRfbmFtZSBtdXN0IGJlIHNldC4akgEoaGFzKHRoaXMuZmllbGRfc3RvcmFnZV9udW1iZXIpICYmICFoYXModGhpcy5maWVsZF9uYW1lKSAmJiAhaGFzKHRoaXMuZmllbGRfd2lyZV9udW1iZXIpKSB8fCAoaGFzKHRoaXMuZmllbGRfbmFtZSkgJiYgaGFzKHRoaXMuZmllbGRfd2lyZV9udW1iZXIpKUIOCgx2YWx1ZV9vcHRpb24iQgoJRW51bVZhbHVlEhIKCnNob3J0X25hbWUYASABKAkSDwoHb3JkaW5hbBgCIAEoBRIQCghjb21tZW50cxgEIAEoCSK4AgoEVHlwZRItCgZudW1iZXIYASABKAsyGy5zdGF0ZWx5LnNjaGVtYW1vZGVsLk51bWJlckgAEikKBGJvb2wYAiABKAsyGS5zdGF0ZWx5LnNjaGVtYW1vZGVsLkJvb2xIABItCgZzdHJpbmcYAyABKAsyGy5zdGF0ZWx5LnNjaGVtYW1vZGVsLlN0cmluZ0gAEi0KBmJpbmFyeRgEIAEoCzIbLnN0YXRlbHkuc2NoZW1hbW9kZWwuQmluYXJ5SAASKQoEbGlzdBgFIAEoCzIZLnN0YXRlbHkuc2NoZW1hbW9kZWwuTGlzdEgAEhsKEXJlZmVyZW5jZV9ieV9uYW1lGAYgASgJSAASIQoXcmVmZXJlbmNlX2J5X3N0b3JhZ2VfaWQYByABKA1IAEINCgR0eXBlEgW6SAIIASK/AQoETGlzdBIvCgxlbGVtZW50X3R5cGUYASABKAsyGS5zdGF0ZWx5LnNjaGVtYW1vZGVsLlR5cGU6hQG6SIEBGn8KHGxpc3QuZGlzYWxsb3dlZF9lbGVtZW50X3R5cGUSJmxpc3RzIGNhbm5vdCBjb250YWluIG90aGVyIGNvbGxlY3Rpb25zGjchaGFzKHRoaXMuZWxlbWVudF90eXBlKSB8fCAhaGFzKHRoaXMuZWxlbWVudF90eXBlLmxpc3QpIgYKBEJvb2wiUAoGU3RyaW5nEkYKDGludGVycHJldF9hcxgBIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuU3RyaW5nSW50ZXJwcmV0QXNCCLpIBYIBAhABIvkBCgZCaW5hcnkSRQoMaW50ZXJwcmV0X2FzGAEgASgOMiUuc3RhdGVseS5zY2hlbWFtb2RlbC5CeXRlc0ludGVycHJldEFzQgi6SAWCAQIQARI4Cg1pbml0aWFsX3ZhbHVlGAIgASgOMiEuc3RhdGVseS5zY2hlbWFtb2RlbC5Jbml0aWFsVmFsdWU6brpIaxppChNCeXRlcy5pbml0aWFsX3ZhbHVlEjVCeXRlcyBjYW4gb25seSBjYW4gb25seSBiZSBVVUlEIGluaXRpYWwgdmFsdWUgZmllbGRzLhobdGhpcy5pbml0aWFsX3ZhbHVlIGluIFswLDJdIooBCgZOdW1iZXISOAoEa2luZBgBIAEoDjIfLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVyS2luZEIJukgGggEDIgEAEkYKDGludGVycHJldF9hcxgCIAEoDjImLnN0YXRlbHkuc2NoZW1hbW9kZWwuTnVtYmVySW50ZXJwcmV0QXNCCLpIBYIBAhABIj0KCkNvbnN0cmFpbnQSHgoOY2VsX2V4cHJlc3Npb24YASABKAlCBrpIA8gBARIPCgdtZXNzYWdlGAIgASgJKvQBCgpOdW1iZXJLaW5kEhcKE0lOVkFMSURfTlVNQkVSX0tJTkQQABIPCgtET1VCTEVfS0lORBABEg4KCkZMT0FUX0tJTkQQAhIOCgpJTlQ2NF9LSU5EEAMSDwoLVUlOVDY0X0tJTkQQBBIOCgpJTlQzMl9LSU5EEAUSEAoMRklYRUQ2NF9LSU5EEAYSEAoMRklYRUQzMl9LSU5EEAcSDwoLVUlOVDMyX0tJTkQQDRIRCg1TRklYRUQzMl9LSU5EEA8SEQoNU0ZJWEVENjRfS0lORBAQEg8KC1NJTlQzMl9LSU5EEBESDwoLU0lOVDY0X0tJTkQQEkKUAQoXY29tLnN0YXRlbHkuc2NoZW1hbW9kZWxCDFBhY2thZ2VQcm90b1ABogIDU1NYqgITU3RhdGVseS5TY2hlbWFtb2RlbMoCE1N0YXRlbHlcU2NoZW1hbW9kZWziAh9TdGF0ZWx5XFNjaGVtYW1vZGVsXEdQQk1ldGFkYXRh6gIUU3RhdGVseTo6U2NoZW1hbW9kZWxiBnByb3RvMw",
    [file_buf_validate_validate, file_options],
  );

/**
 * Describes the message stately.schemamodel.SchemaPackage.
 * Use `create(SchemaPackageSchema)` to create a new message.
 */
export const SchemaPackageSchema = /*@__PURE__*/ messageDesc(file_package, 0);

/**
 * Describes the message stately.schemamodel.DefaultGroupConfig.
 * Use `create(DefaultGroupConfigSchema)` to create a new message.
 */
export const DefaultGroupConfigSchema = /*@__PURE__*/ messageDesc(file_package, 1);

/**
 * Describes the message stately.schemamodel.MessageType.
 * Use `create(MessageTypeSchema)` to create a new message.
 */
export const MessageTypeSchema = /*@__PURE__*/ messageDesc(file_package, 2);

/**
 * Describes the message stately.schemamodel.EnumType.
 * Use `create(EnumTypeSchema)` to create a new message.
 */
export const EnumTypeSchema = /*@__PURE__*/ messageDesc(file_package, 3);

/**
 * Describes the message stately.schemamodel.TypeAlias.
 * Use `create(TypeAliasSchema)` to create a new message.
 */
export const TypeAliasSchema = /*@__PURE__*/ messageDesc(file_package, 4);

/**
 * Describes the message stately.schemamodel.Field.
 * Use `create(FieldSchema)` to create a new message.
 */
export const FieldSchema = /*@__PURE__*/ messageDesc(file_package, 5);

/**
 * Describes the message stately.schemamodel.EnumValue.
 * Use `create(EnumValueSchema)` to create a new message.
 */
export const EnumValueSchema = /*@__PURE__*/ messageDesc(file_package, 6);

/**
 * Describes the message stately.schemamodel.Type.
 * Use `create(TypeSchema)` to create a new message.
 */
export const TypeSchema = /*@__PURE__*/ messageDesc(file_package, 7);

/**
 * Describes the message stately.schemamodel.List.
 * Use `create(ListSchema)` to create a new message.
 */
export const ListSchema = /*@__PURE__*/ messageDesc(file_package, 8);

/**
 * Describes the message stately.schemamodel.Bool.
 * Use `create(BoolSchema)` to create a new message.
 */
export const BoolSchema = /*@__PURE__*/ messageDesc(file_package, 9);

/**
 * Describes the message stately.schemamodel.String.
 * Use `create(StringSchema)` to create a new message.
 */
export const StringSchema = /*@__PURE__*/ messageDesc(file_package, 10);

/**
 * Describes the message stately.schemamodel.Binary.
 * Use `create(BinarySchema)` to create a new message.
 */
export const BinarySchema = /*@__PURE__*/ messageDesc(file_package, 11);

/**
 * Describes the message stately.schemamodel.Number.
 * Use `create(NumberSchema)` to create a new message.
 */
export const NumberSchema = /*@__PURE__*/ messageDesc(file_package, 12);

/**
 * Describes the message stately.schemamodel.Constraint.
 * Use `create(ConstraintSchema)` to create a new message.
 */
export const ConstraintSchema = /*@__PURE__*/ messageDesc(file_package, 13);

/**
 * Describes the enum stately.schemamodel.NumberKind.
 */
export const NumberKindSchema = /*@__PURE__*/ enumDesc(file_package, 0);

/**
 * NumberKind is the set of all possible proto number kinds.
 * The enum ordinals match 1:1 with proto kinds.
 *
 * @generated from enum stately.schemamodel.NumberKind
 */
export const NumberKind = /*@__PURE__*/ tsEnum(NumberKindSchema);
