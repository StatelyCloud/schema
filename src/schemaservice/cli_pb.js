// @generated by protoc-gen-es v2.2.3 with parameter "target=js+dts,import_extension=.js"
// @generated from file schemaservice/cli.proto (package stately.schemaservice, syntax proto3)
/* eslint-disable */

import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_descriptor } from "@bufbuild/protobuf/wkt";
import { file_buf_validate_validate } from "../buf/validate/validate_pb.js";
import { file_errors_error_details } from "../errors/error_details_pb.js";
import { file_migration } from "../migration_pb.js";

/**
 * Describes the file schemaservice/cli.proto.
 */
export const file_schemaservice_cli =
  /*@__PURE__*/
  fileDesc(
    "ChdzY2hlbWFzZXJ2aWNlL2NsaS5wcm90bxIVc3RhdGVseS5zY2hlbWFzZXJ2aWNlItoBCgtEU0xSZXNwb25zZRJFCg9maWxlX2Rlc2NyaXB0b3IYASABKAsyJC5nb29nbGUucHJvdG9idWYuRmlsZURlc2NyaXB0b3JQcm90b0IGukgDyAEBEjIKCm1pZ3JhdGlvbnMYAiADKAsyHi5zdGF0ZWx5LnNjaGVtYW1vZGVsLk1pZ3JhdGlvbhIzCgZlcnJvcnMYAyADKAsyIy5zdGF0ZWx5LmVycm9ycy5TdGF0ZWx5RXJyb3JEZXRhaWxzEhsKC2RzbF92ZXJzaW9uGAQgASgJQga6SAPIAQFCmgEKGWNvbS5zdGF0ZWx5LnNjaGVtYXNlcnZpY2VCCENsaVByb3RvUAGiAgNTU1iqAhVTdGF0ZWx5LlNjaGVtYXNlcnZpY2XKAhVTdGF0ZWx5XFNjaGVtYXNlcnZpY2XiAiFTdGF0ZWx5XFNjaGVtYXNlcnZpY2VcR1BCTWV0YWRhdGHqAhZTdGF0ZWx5OjpTY2hlbWFzZXJ2aWNlYgZwcm90bzM",
    [
      file_buf_validate_validate,
      file_errors_error_details,
      file_google_protobuf_descriptor,
      file_migration,
    ],
  );

/**
 * Describes the message stately.schemaservice.DSLResponse.
 * Use `create(DSLResponseSchema)` to create a new message.
 */
export const DSLResponseSchema = /*@__PURE__*/ messageDesc(file_schemaservice_cli, 0);
