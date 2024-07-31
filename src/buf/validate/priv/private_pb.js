// Copyright 2023 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// @generated by protoc-gen-es v2.0.0 with parameter "target=js+dts,import_extension=.js"
// @generated from file buf/validate/priv/private.proto (package buf.validate.priv, syntax proto3)
/* eslint-disable */

import { extDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import { file_google_protobuf_descriptor } from "@bufbuild/protobuf/wkt";

/**
 * Describes the file buf/validate/priv/private.proto.
 */
export const file_buf_validate_priv_private =
  /*@__PURE__*/
  fileDesc(
    "Ch9idWYvdmFsaWRhdGUvcHJpdi9wcml2YXRlLnByb3RvEhFidWYudmFsaWRhdGUucHJpdiI+ChBGaWVsZENvbnN0cmFpbnRzEioKA2NlbBgBIAMoCzIdLmJ1Zi52YWxpZGF0ZS5wcml2LkNvbnN0cmFpbnQiPQoKQ29uc3RyYWludBIKCgJpZBgBIAEoCRIPCgdtZXNzYWdlGAIgASgJEhIKCmV4cHJlc3Npb24YAyABKAk6XAoFZmllbGQSHS5nb29nbGUucHJvdG9idWYuRmllbGRPcHRpb25zGIgJIAEoCzIjLmJ1Zi52YWxpZGF0ZS5wcml2LkZpZWxkQ29uc3RyYWludHNSBWZpZWxkiAEBQtkBChVjb20uYnVmLnZhbGlkYXRlLnByaXZCDFByaXZhdGVQcm90b1ABWkxidWYuYnVpbGQvZ2VuL2dvL2J1ZmJ1aWxkL3Byb3RvdmFsaWRhdGUvcHJvdG9jb2xidWZmZXJzL2dvL2J1Zi92YWxpZGF0ZS9wcml2ogIDQlZQqgIRQnVmLlZhbGlkYXRlLlByaXbKAhFCdWZcVmFsaWRhdGVcUHJpduICHUJ1ZlxWYWxpZGF0ZVxQcml2XEdQQk1ldGFkYXRh6gITQnVmOjpWYWxpZGF0ZTo6UHJpdmIGcHJvdG8z",
    [file_google_protobuf_descriptor],
  );

/**
 * Describes the message buf.validate.priv.FieldConstraints.
 * Use `create(FieldConstraintsSchema)` to create a new message.
 */
export const FieldConstraintsSchema = /*@__PURE__*/ messageDesc(file_buf_validate_priv_private, 0);

/**
 * Describes the message buf.validate.priv.Constraint.
 * Use `create(ConstraintSchema)` to create a new message.
 */
export const ConstraintSchema = /*@__PURE__*/ messageDesc(file_buf_validate_priv_private, 1);

/**
 * Do not use. Internal to protovalidate library
 *
 * @generated from extension: optional buf.validate.priv.FieldConstraints field = 1160;
 */
export const field = /*@__PURE__*/ extDesc(file_buf_validate_priv_private, 0);
