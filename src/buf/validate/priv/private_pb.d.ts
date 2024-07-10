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

// @generated by protoc-gen-es v1.10.0 with parameter "target=js+dts"
// @generated from file buf/validate/priv/private.proto (package buf.validate.priv, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type {
  BinaryReadOptions,
  Extension,
  FieldList,
  FieldOptions,
  JsonReadOptions,
  JsonValue,
  PartialMessage,
  PlainMessage,
} from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * Do not use. Internal to protovalidate library
 *
 * @generated from message buf.validate.priv.FieldConstraints
 */
export declare class FieldConstraints extends Message<FieldConstraints> {
  /**
   * @generated from field: repeated buf.validate.priv.Constraint cel = 1;
   */
  cel: Constraint[];

  constructor(data?: PartialMessage<FieldConstraints>);

  static readonly runtime: typeof proto3;
  static readonly typeName = "buf.validate.priv.FieldConstraints";
  static readonly fields: FieldList;

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FieldConstraints;

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FieldConstraints;

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FieldConstraints;

  static equals(
    a: FieldConstraints | PlainMessage<FieldConstraints> | undefined,
    b: FieldConstraints | PlainMessage<FieldConstraints> | undefined,
  ): boolean;
}

/**
 * Do not use. Internal to protovalidate library
 *
 * @generated from message buf.validate.priv.Constraint
 */
export declare class Constraint extends Message<Constraint> {
  /**
   * @generated from field: string id = 1;
   */
  id: string;

  /**
   * @generated from field: string message = 2;
   */
  message: string;

  /**
   * @generated from field: string expression = 3;
   */
  expression: string;

  constructor(data?: PartialMessage<Constraint>);

  static readonly runtime: typeof proto3;
  static readonly typeName = "buf.validate.priv.Constraint";
  static readonly fields: FieldList;

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Constraint;

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Constraint;

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Constraint;

  static equals(
    a: Constraint | PlainMessage<Constraint> | undefined,
    b: Constraint | PlainMessage<Constraint> | undefined,
  ): boolean;
}

/**
 * Do not use. Internal to protovalidate library
 *
 * @generated from extension: optional buf.validate.priv.FieldConstraints field = 1160;
 */
export declare const field: Extension<FieldOptions, FieldConstraints>;
