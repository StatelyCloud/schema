import {
  EnumDescriptorProto,
  FieldDescriptorProto,
  FieldDescriptorProto_Type,
  FieldOptions,
  Message,
  PartialMessage,
  setExtension,
} from "@bufbuild/protobuf";
import { Constraint } from "./buf/validate/expression_pb.js";
import { FieldConstraints, field as bufField } from "./buf/validate/validate_pb.js";
import { field as statelyField } from "./extensions_pb.js";
import {
  BytesInterpretAs,
  BytesOptions,
  DoubleOptions,
  FieldOptions_FromMetadata,
  FieldOptions_InitialValue,
  Fixed32Options,
  Fixed64Options,
  FloatOptions,
  Int32Options,
  Int64Options,
  NumberInterpretAs,
  SFixed32Options,
  SFixed64Options,
  SInt32Options,
  SInt64Options,
  FieldOptions as StatelyFieldOptions,
  StringInterpretAs,
  StringOptions,
  UInt32Options,
  UInt64Options,
} from "./options_pb.js";
import { Deferred, resolveDeferred } from "./type-util.js";
import { SchemaType, isItemType, resolveType } from "./types.js";

export interface FieldFromMetadata {
  /**
   * Derive the field's value from StatelyDB metadata. These are special values
   * that StatelyDB keeps track of for each item, but you must map them to
   * fields in the schema to use them. This implicitly makes the field read-only
   * - any value set here will be ignored when the item is written.
   *
   * - `createdAtTime` and `lastModifiedAtTime` must only be set on a field that
   *   has a timestamp type (`timestampSeconds`, `timestampMilliseconds`, or
   *   `timestampMicroseconds`).
   * - `createdAtVersion`, `lastModifiedAtVersion`, and `updateCount` must only
   *   be set on a field that has a `uint` type.
   * - `primaryKeyPath` must only be set on a field that has a `keyPath` type.
   */
  fromMetadata?:
    | "createdAtTime"
    | "lastModifiedAtTime"
    | "createdAtVersion"
    | "lastModifiedAtVersion"
    | "updateCount"
    | "primaryKeyPath";
}

export interface FieldInitialValue {
  /**
   * Setting `initialValue` instructs StatelyDB to automatically choose
   * the field's value when the item is created. This is especially useful
   * when `append`ing items, since the ID must be automatically selected.
   */
  initialValue?: "sequence" | "uuid" | "rand53";
}

export interface FieldFromExpression {
  /**
   * A CEL (Common Expression Language) expression that will be evaluated to
   * produce this field's value. This makes the field a readonly "computed"
   * field which is not stored in the database, but is calculated on the fly
   * whenever the item is read. This can be especially useful when declaring
   * indexes or key path templates.
   * @see https://github.com/google/cel-spec
   */
  expression?: string;
}

/**
 * A field in an item or object type. Each field has a specific type, and a
 * number that identifies it independently of its name.
 *
 * Fields will fail validation their value is not present (non-zero), unless
 * there is a default value set for that field (which can be set either here, or
 * as part of the field type). Fields with a default will reflect their default
 * value if they are not explicitly set.
 */
export type Field = {
  /**
   * The type of the field. There are a number of built-in types, and you can
   * create and reference your own types.
   */
  type: Deferred<SchemaType>;

  /**
   * A number to uniquely identify this field in its enclosing object. This is
   * used to compactly encode the field without having to write out its name,
   * which as a side effect makes name changes backwards compatible.
   */
  fieldNum: number;

  /**
   * Documentation for the field. This will be included in generated code.
   */
  docs?: string;

  /**
   * Whether this field is deprecated. This will be marked in generated code.
   */
  deprecated?: boolean;

  /**
   * If a field is required, it must be set when creating an item of this type,
   * or the item will be invalid. A value is set as long as it is not the "zero
   * value" for the type - null for messages, zero for numbers and enums, false
   * for booleans, and empty for arrays, strings and byte arrays. The default if
   * this option is not provided is true - all fields are required unless set to
   * `required: false`.
   */
  required?: boolean;

  // TODO: SourceCodeInfo
} & Pick<SchemaType, "valid"> & // Rather than force people to use a new type just to set one of these type options, we allow overriding them at the field level
  // Only one of these options can be set:
  (FieldFromMetadata | FieldInitialValue | FieldFromExpression);

/* Mappings between DSL string options and protobuf options */

const fromMetadataConvert: Record<
  NonNullable<FieldFromMetadata["fromMetadata"]>,
  FieldOptions_FromMetadata
> = {
  createdAtTime: FieldOptions_FromMetadata.CREATED_AT_TIME,
  lastModifiedAtTime: FieldOptions_FromMetadata.LAST_MODIFIED_AT_TIME,
  createdAtVersion: FieldOptions_FromMetadata.CREATED_AT_VERSION,
  lastModifiedAtVersion: FieldOptions_FromMetadata.LAST_MODIFIED_AT_VERSION,
  updateCount: FieldOptions_FromMetadata.UPDATE_COUNT,
  primaryKeyPath: FieldOptions_FromMetadata.KEY_PATH,
};

const fromInitialValue: Record<
  NonNullable<FieldInitialValue["initialValue"]>,
  FieldOptions_InitialValue
> = {
  sequence: FieldOptions_InitialValue.SEQUENCE,
  uuid: FieldOptions_InitialValue.UUID,
  rand53: FieldOptions_InitialValue.RAND53,
};

type InterpretAsValues = NonNullable<SchemaType["interpretAs"]>;
const fromNumberInterpretAs: Partial<Record<InterpretAsValues, NumberInterpretAs | undefined>> = {
  timestampSeconds: NumberInterpretAs.TIMESTAMP_SECONDS,
  timestampMilliseconds: NumberInterpretAs.TIMESTAMP_MILLISECONDS,
  timestampMicroseconds: NumberInterpretAs.TIMESTAMP_MICROSECONDS,
  durationSeconds: NumberInterpretAs.DURATION_SECONDS,
  durationMilliseconds: NumberInterpretAs.DURATION_MILLISECONDS,
};

const fromBytesInterpretAs: Partial<Record<InterpretAsValues, BytesInterpretAs | undefined>> = {
  uuid: BytesInterpretAs.UUID,
};

const fromStringInterpretAs: Partial<Record<InterpretAsValues, StringInterpretAs | undefined>> = {
  keyPath: StringInterpretAs.KEY_PATH,
  url: StringInterpretAs.URL,
};

/**
 * Field builds a FieldDescriptorProto from a FieldConfig and name.
 * @private It is used internally by itemType/objectType to build the fields of a message.
 */
export function field(fieldName: string, fieldConfig: Field): FieldDescriptorProto {
  if (fieldConfig.fieldNum <= 0 || fieldConfig.fieldNum !== Math.floor(fieldConfig.fieldNum)) {
    throw new Error(
      `Field number ${fieldConfig.fieldNum} for field ${fieldName} must be a positive nonzero integer`,
    );
  }
  const field = new FieldDescriptorProto({
    name: fieldName,
    jsonName: fieldName,
    number: fieldConfig.fieldNum,
  });
  const type = resolveDeferred(fieldConfig.type);
  if (isItemType(type)) {
    throw new Error(
      `Item types should not be used as fields - consider using pointerTo(${fieldConfig.type.name}) instead`,
    );
  }
  const typeInfo = resolveType(type);
  if (typeof typeInfo.underlyingType === "number") {
    field.type = typeInfo.underlyingType;
  } else {
    // TODO: this only works for types that are in the same namespace as the
    // type that refers to them. That's OK for now since we only have one
    // namespace but could be a problem later.
    // https://groups.google.com/g/protobuf/c/AM2tSnfwfqU/m/Fj234vSiDgAJ
    field.typeName = `.stately.generated.${typeInfo.underlyingType.name}`;
    field.type =
      typeInfo.underlyingType instanceof EnumDescriptorProto
        ? FieldDescriptorProto_Type.ENUM
        : FieldDescriptorProto_Type.MESSAGE;
  }

  field.label = typeInfo.label;

  // TODO: not sure this is the right way to handle optional - it might be
  // better for it to be our own thing that we use in our own generated code.
  // field.proto3Optional = fieldConfig.optional ?? false;

  // if (fieldConfig.required) {
  //   if (fieldConfig.optional) {
  //     throw new Error(`Optional field ${fieldName} cannot also be required`);
  //   }
  //   if (typeInfo.label === FieldDescriptorProto_Label.REPEATED) {
  //     throw new Error(`Repeated field ${fieldName} cannot also be required`);
  //   }
  //   // This means the field must always be present
  //   field.label = FieldDescriptorProto_Label.REQUIRED;
  // }

  // TODO: further validate defaults (e.g. don't allow enum defaults, null only for message/array, etc)

  let ephemeral = false;
  const statelyOptions = new StatelyFieldOptions();
  if ("fromMetadata" in fieldConfig && fieldConfig.fromMetadata) {
    statelyOptions.value = {
      case: "fromMetadata",
      value: fromMetadataConvert[fieldConfig.fromMetadata],
    };
    ephemeral = true;
  } else if ("initialValue" in fieldConfig && fieldConfig.initialValue) {
    statelyOptions.value = {
      case: "initialValue",
      value: fromInitialValue[fieldConfig.initialValue],
    };
  } else if ("expression" in fieldConfig && fieldConfig.expression) {
    statelyOptions.value = {
      case: "celExpression",
      value: fieldConfig.expression,
    };
    ephemeral = true;
  }

  if (field.type !== undefined) {
    statelyOptions.type = convertTypedOption(field.type, typeInfo.interpretAs);
  }

  // set custom options
  field.options = new FieldOptions();
  setExtension(field.options, statelyField, statelyOptions);

  // CEL-based validations
  const validations = [...(typeInfo.validations ?? []), fieldConfig.valid].filter(
    (v): v is string => v !== undefined,
  );
  const fieldConstraints = new FieldConstraints();
  let hasFieldConstraints = false;
  if (validations.length > 0) {
    for (const valid of validations) {
      fieldConstraints.cel.push(
        new Constraint({
          id: fieldName,
          message: `Field ${fieldName} is invalid`,
          expression: valid,
        }),
      );
      hasFieldConstraints = true;
    }
  }
  // Use protovalidate's definition of required over whatever Protobuf thinks it means
  if (!ephemeral && fieldConfig.required !== false) {
    // If no default is set, this field is required!
    fieldConstraints.required = true;
    hasFieldConstraints = true;
  }
  if (hasFieldConstraints) {
    setExtension(field.options, bufField, fieldConstraints);
  }

  return field;
}

/* What follows is a bunch of TS dark magic to make convertNum typecheck things. */

/** Extracts the specific type of a value type from a oneOf field */
type OneOfValue<T extends { case: string }, K extends T["case"]> = T extends {
  case: K;
  value: infer V extends Message<V>;
}
  ? V
  : never;

type InterpretAs = SchemaType["interpretAs"];

type NumberValues<T> = T extends {
  case: string;
  value: {
    interpretAs: NumberInterpretAs;
  };
}
  ? T
  : never;

type NumberFieldOptionType = NumberValues<StatelyFieldOptions["type"]>;
type NumberFieldOptionCases = NumberFieldOptionType["case"];

/**
 * Construct a field option case object for a number type. This is torturously
 * type-parameterized so that it validates the types of all of its arguments
 * agree with each other, which only really matters to make sure that it's
 * called correctly below.
 */
function convertNum<
  T extends NumberFieldOptionCases,
  Value extends OneOfValue<NumberFieldOptionType, T> & Message<Value>,
>(
  type: T,
  constructor: new (data?: PartialMessage<Value>) => Value,
  interpretAs: InterpretAs,
): {
  case: T;
  value: Value;
} {
  if (interpretAs && !fromNumberInterpretAs[interpretAs]) {
    throw new Error(`Invalid interpretAs value for number type: ${interpretAs}`);
  }
  return {
    case: type,
    value: new constructor({
      interpretAs: interpretAs ? fromNumberInterpretAs[interpretAs] : undefined,
    } as PartialMessage<Value>),
  };
}

/**
 * Create the typed Stately field option for a field based on its underlying type and other
 * options.
 */
function convertTypedOption(
  type: FieldDescriptorProto_Type,
  interpretAs: InterpretAs,
): StatelyFieldOptions["type"] {
  if (!interpretAs) {
    return { case: undefined, value: undefined };
  }
  // TODO: Maybe we shouldn't support all the number types?
  switch (type) {
    case FieldDescriptorProto_Type.INT64:
      return convertNum("int64", Int64Options, interpretAs);
    case FieldDescriptorProto_Type.UINT64:
      return convertNum("uint64", UInt64Options, interpretAs);
    case FieldDescriptorProto_Type.INT32:
      return convertNum("int32", Int32Options, interpretAs);
    case FieldDescriptorProto_Type.UINT32:
      return convertNum("uint32", UInt32Options, interpretAs);
    case FieldDescriptorProto_Type.SINT32:
      return convertNum("sint32", SInt32Options, interpretAs);
    case FieldDescriptorProto_Type.SINT64:
      return convertNum("sint64", SInt64Options, interpretAs);
    case FieldDescriptorProto_Type.FIXED32:
      return convertNum("fixed32", Fixed32Options, interpretAs);
    case FieldDescriptorProto_Type.FIXED64:
      return convertNum("fixed64", Fixed64Options, interpretAs);
    case FieldDescriptorProto_Type.SFIXED32:
      return convertNum("sfixed32", SFixed32Options, interpretAs);
    case FieldDescriptorProto_Type.SFIXED64:
      return convertNum("fixed64", SFixed64Options, interpretAs);
    case FieldDescriptorProto_Type.FLOAT:
      return convertNum("float", FloatOptions, interpretAs);
    case FieldDescriptorProto_Type.DOUBLE:
      return convertNum("double", DoubleOptions, interpretAs);
    case FieldDescriptorProto_Type.BYTES: {
      if (interpretAs && !fromBytesInterpretAs[interpretAs]) {
        throw new Error(`Invalid interpretAs value for bytes type: ${interpretAs}`);
      }
      return {
        case: "bytes",
        value: new BytesOptions({
          interpretAs: interpretAs ? fromBytesInterpretAs[interpretAs] : undefined,
        }),
      };
    }
    case FieldDescriptorProto_Type.STRING: {
      if (interpretAs && !fromStringInterpretAs[interpretAs]) {
        throw new Error(`Invalid interpretAs value for string type: ${interpretAs}`);
      }
      return {
        case: "string",
        value: new StringOptions({
          interpretAs: interpretAs ? fromStringInterpretAs[interpretAs] : undefined,
        }),
      };
    }
    default:
      return { case: undefined, value: undefined };
  }
}
