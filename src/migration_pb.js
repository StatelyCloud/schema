// @generated by protoc-gen-es v2.2.3 with parameter "target=js+dts,import_extension=.js"
// @generated from file migration.proto (package stately.schemamodel, syntax proto3)
/* eslint-disable */

import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_buf_validate_validate } from "./buf/validate/validate_pb.js";

/**
 * Describes the file migration.proto.
 */
export const file_migration =
  /*@__PURE__*/
  fileDesc(
    "Cg9taWdyYXRpb24ucHJvdG8SE3N0YXRlbHkuc2NoZW1hbW9kZWwifwoJTWlncmF0aW9uEiMKE2Zyb21fc2NoZW1hX3ZlcnNpb24YASABKARCBrpIA8gBARIMCgRuYW1lGAIgASgJEj8KCGNvbW1hbmRzGAMgAygLMiUuc3RhdGVseS5zY2hlbWFtb2RlbC5NaWdyYXRpb25Db21tYW5kQga6SAPIAQEiagoQTWlncmF0aW9uQ29tbWFuZBIZCgl0eXBlX25hbWUYASABKAlCBrpIA8gBARI7CgdhY3Rpb25zGAIgAygLMiIuc3RhdGVseS5zY2hlbWFtb2RlbC5NaWdyYXRlQWN0aW9uQga6SAPIAQEi6gIKDU1pZ3JhdGVBY3Rpb24SMgoJYWRkX2ZpZWxkGAIgASgLMh0uc3RhdGVseS5zY2hlbWFtb2RlbC5BZGRGaWVsZEgAEjgKDHJlbW92ZV9maWVsZBgDIAEoCzIgLnN0YXRlbHkuc2NoZW1hbW9kZWwuUmVtb3ZlRmllbGRIABI4CgxyZW5hbWVfZmllbGQYBCABKAsyIC5zdGF0ZWx5LnNjaGVtYW1vZGVsLlJlbmFtZUZpZWxkSAASNgoLcmVuYW1lX3R5cGUYBiABKAsyHy5zdGF0ZWx5LnNjaGVtYW1vZGVsLlJlbmFtZVR5cGVIABI2CgtyZW1vdmVfdHlwZRgHIAEoCzIfLnN0YXRlbHkuc2NoZW1hbW9kZWwuUmVtb3ZlVHlwZUgAEjAKCGFkZF90eXBlGAggASgLMhwuc3RhdGVseS5zY2hlbWFtb2RlbC5BZGRUeXBlSABCDwoGYWN0aW9uEgW6SAIIASIgCghBZGRGaWVsZBIUCgRuYW1lGAEgASgJQga6SAPIAQEiIwoLUmVtb3ZlRmllbGQSFAoEbmFtZRgBIAEoCUIGukgDyAEBIkEKC1JlbmFtZUZpZWxkEhgKCG9sZF9uYW1lGAEgASgJQga6SAPIAQESGAoIbmV3X25hbWUYAiABKAlCBrpIA8gBASImCgpSZW5hbWVUeXBlEhgKCG5ld19uYW1lGAIgASgJQga6SAPIAQEiDAoKUmVtb3ZlVHlwZSIJCgdBZGRUeXBlQpYBChdjb20uc3RhdGVseS5zY2hlbWFtb2RlbEIOTWlncmF0aW9uUHJvdG9QAaICA1NTWKoCE1N0YXRlbHkuU2NoZW1hbW9kZWzKAhNTdGF0ZWx5XFNjaGVtYW1vZGVs4gIfU3RhdGVseVxTY2hlbWFtb2RlbFxHUEJNZXRhZGF0YeoCFFN0YXRlbHk6OlNjaGVtYW1vZGVsYgZwcm90bzM",
    [file_buf_validate_validate],
  );

/**
 * Describes the message stately.schemamodel.Migration.
 * Use `create(MigrationSchema)` to create a new message.
 */
export const MigrationSchema = /*@__PURE__*/ messageDesc(file_migration, 0);

/**
 * Describes the message stately.schemamodel.MigrationCommand.
 * Use `create(MigrationCommandSchema)` to create a new message.
 */
export const MigrationCommandSchema = /*@__PURE__*/ messageDesc(file_migration, 1);

/**
 * Describes the message stately.schemamodel.MigrateAction.
 * Use `create(MigrateActionSchema)` to create a new message.
 */
export const MigrateActionSchema = /*@__PURE__*/ messageDesc(file_migration, 2);

/**
 * Describes the message stately.schemamodel.AddField.
 * Use `create(AddFieldSchema)` to create a new message.
 */
export const AddFieldSchema = /*@__PURE__*/ messageDesc(file_migration, 3);

/**
 * Describes the message stately.schemamodel.RemoveField.
 * Use `create(RemoveFieldSchema)` to create a new message.
 */
export const RemoveFieldSchema = /*@__PURE__*/ messageDesc(file_migration, 4);

/**
 * Describes the message stately.schemamodel.RenameField.
 * Use `create(RenameFieldSchema)` to create a new message.
 */
export const RenameFieldSchema = /*@__PURE__*/ messageDesc(file_migration, 5);

/**
 * Describes the message stately.schemamodel.RenameType.
 * Use `create(RenameTypeSchema)` to create a new message.
 */
export const RenameTypeSchema = /*@__PURE__*/ messageDesc(file_migration, 6);

/**
 * Describes the message stately.schemamodel.RemoveType.
 * Use `create(RemoveTypeSchema)` to create a new message.
 */
export const RemoveTypeSchema = /*@__PURE__*/ messageDesc(file_migration, 7);

/**
 * Describes the message stately.schemamodel.AddType.
 * Use `create(AddTypeSchema)` to create a new message.
 */
export const AddTypeSchema = /*@__PURE__*/ messageDesc(file_migration, 8);
