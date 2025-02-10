import { create, isMessage, setExtension } from "@bufbuild/protobuf";
import { GenMessage } from "@bufbuild/protobuf/codegenv1";
import {
  EnumDescriptorProtoSchema,
  FieldDescriptorProto,
  FieldDescriptorProtoSchema,
  FieldDescriptorProto_Type,
  FieldOptionsSchema,
} from "@bufbuild/protobuf/wkt";
import { ConstraintSchema } from "./buf/validate/expression_pb.js";
import { FieldConstraintsSchema, field as bufField } from "./buf/validate/validate_pb.js";
import { getPackageName } from "./driver.js";
import { field as statelyField } from "./extensions_pb.js";
import {
  BytesInterpretAs,
  BytesOptionsSchema,
  DoubleOptionsSchema,
  FieldOptions_FromMetadata,
  FieldOptions_InitialValue,
  Fixed32OptionsSchema,
  Fixed64OptionsSchema,
  FloatOptionsSchema,
  Int32OptionsSchema,
  Int64OptionsSchema,
  NumberInterpretAs,
  SFixed32OptionsSchema,
  SInt32OptionsSchema,
  SInt64OptionsSchema,
  FieldOptions as StatelyFieldOptions,
  FieldOptionsSchema as StatelyFieldOptionsSchema,
  StringInterpretAs,
  StringOptionsSchema,
  UInt32OptionsSchema,
  UInt64OptionsSchema,
} from "./options_pb.js";
import { Deferred, resolveDeferred } from "./type-util.js";
import { SchemaType, isItemType, resolveType } from "./types.js";

export interface FieldFromMetadata {
  /**
   * Derive the field's value from StatelyDB metadata. These are special values
   * that StatelyDB keeps track of for each item, but you must map them to
   * fields in the schema to use them. This implicitly makes the field
   * read-only. Any value set for this field will be ignored when the item is
   * written.
   *
   * - `createdAtTime` and `lastModifiedAtTime` must only be set on a field that
   *   has a timestamp type (`timestampSeconds`, `timestampMilliseconds`, or
   *   `timestampMicroseconds`). These represent the time the database first
   *   created or last modified the item.
   * - `createdAtVersion` and `lastModifiedAtVersion` must only be set on a
   *   field that has a `uint` type. These represent a monotonically increasing
   *   version number within a Group that tracks modifications of items and can
   *   be used to strictly order changes. Note that multiple items can have the
   *   same createdAt/lastModifiedAtVersion if they were created/modified in the
   *   same transaction, since they logically were modified at the same time.
   */
  fromMetadata?:
    | "createdAtTime"
    | "lastModifiedAtTime"
    | "createdAtVersion"
    | "lastModifiedAtVersion";
}

export interface FieldInitialValue {
  /**
   * Setting `initialValue` instructs StatelyDB to automatically choose
   * the field's value when the item is created. This is especially useful
   * when `append`ing items, since the ID must be automatically selected.
   */
  initialValue?: "sequence" | "uuid" | "rand53";
}

// export interface FieldFromExpression {
//   /**
//    * A CEL (Common Expression Language) expression that will be evaluated to
//    * produce this field's value. This makes the field a readonly "computed"
//    * field which is not stored in the database, but is calculated on the fly
//    * whenever the item is read. This can be especially useful when declaring
//    * indexes or key path templates.
//    * @see https://github.com/google/cel-spec
//    */
//   expression?: string;
// }

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
  (FieldFromMetadata | FieldInitialValue) /* | FieldFromExpression */;

/* Mappings between DSL string options and protobuf options */

const fromMetadataConvert: Record<
  NonNullable<FieldFromMetadata["fromMetadata"]>,
  FieldOptions_FromMetadata
> = {
  createdAtTime: FieldOptions_FromMetadata.CREATED_AT_TIME,
  lastModifiedAtTime: FieldOptions_FromMetadata.LAST_MODIFIED_AT_TIME,
  createdAtVersion: FieldOptions_FromMetadata.CREATED_AT_VERSION,
  lastModifiedAtVersion: FieldOptions_FromMetadata.LAST_MODIFIED_AT_VERSION,
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
  const field = create(FieldDescriptorProtoSchema, {
    name: fieldName,
    jsonName: fieldName,
  });
  const type = resolveDeferred(fieldConfig.type);
  if (isItemType(type)) {
    throw new Error(
      `Item types should not be used as fields - consider storing just the key path string pointing to ${type.name} instead, or declare it using objectType instead of itemType.`,
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
    field.typeName = `.${getPackageName()}.${typeInfo.underlyingType.name}`;
    field.type = isMessage(typeInfo.underlyingType, EnumDescriptorProtoSchema)
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
  const statelyOptions = create(StatelyFieldOptionsSchema);
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
    ephemeral = true;
  } /* else if ("expression" in fieldConfig && fieldConfig.expression) {
    statelyOptions.value = {
      case: "celExpression",
      value: fieldConfig.expression,
    };
    ephemeral = true;
  } */

  if (field.type !== undefined) {
    statelyOptions.type = convertTypedOption(field.type, typeInfo.interpretAs);
  }

  // set custom options
  field.options = create(FieldOptionsSchema);
  setExtension(field.options, statelyField, statelyOptions);

  // CEL-based validations
  const validations = [...(typeInfo.validations ?? []), fieldConfig.valid].filter(
    (v): v is string => v !== undefined,
  );
  const fieldConstraints = create(FieldConstraintsSchema);
  let hasFieldConstraints = false;
  if (validations.length > 0) {
    for (const valid of validations) {
      fieldConstraints.cel.push(
        create(ConstraintSchema, {
          id: fieldName,
          message: `value does not satisfy "${valid}"`,
          expression: valid,
        }),
      );
      hasFieldConstraints = true;
    }
  }

  if (field.type === FieldDescriptorProto_Type.BOOL && fieldConfig.required === true) {
    throw new Error(
      `Field ${fieldName} is a boolean field that's marked required - that would mean it could only have the value "true". This probably isn't what you want.`,
    );
  }

  // Fields default to required. Unless the field has "required: false", we'll
  // add a required validation. We use protovalidate's definition of required
  // over whatever Protobuf thinks it means (i.e. proto3 optional) because it's
  // easier to deal with as a validation error.
  if (
    // Ignore ephemeral/generated fields
    !ephemeral &&
    // Required defaults to true for non-bool fields, false for bool
    (fieldConfig.required ??
      // Booleans are exempt from the "default required" rule, since they can
      // only be true or false, and false is their zero value, which means a
      // required boolean could only be true.
      field.type !== FieldDescriptorProto_Type.BOOL)
  ) {
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
  value: infer V;
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
  Value extends OneOfValue<NumberFieldOptionType, T>,
>(
  type: T,
  schema: GenMessage<Value>,
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
    value: create(schema, {
      interpretAs: interpretAs ? fromNumberInterpretAs[interpretAs] : undefined,
    } as Value),
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
      return convertNum("int64", Int64OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.UINT64:
      return convertNum("uint64", UInt64OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.INT32:
      return convertNum("int32", Int32OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.UINT32:
      return convertNum("uint32", UInt32OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.SINT32:
      return convertNum("sint32", SInt32OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.SINT64:
      return convertNum("sint64", SInt64OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.FIXED32:
      return convertNum("fixed32", Fixed32OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.FIXED64:
      return convertNum("fixed64", Fixed64OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.SFIXED32:
      return convertNum("sfixed32", SFixed32OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.SFIXED64:
      return convertNum("fixed64", Fixed64OptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.FLOAT:
      return convertNum("float", FloatOptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.DOUBLE:
      return convertNum("double", DoubleOptionsSchema, interpretAs);
    case FieldDescriptorProto_Type.BYTES: {
      if (interpretAs && !fromBytesInterpretAs[interpretAs]) {
        throw new Error(`Invalid interpretAs value for bytes type: ${interpretAs}`);
      }
      return {
        case: "bytes",
        value: create(BytesOptionsSchema, {
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
        value: create(StringOptionsSchema, {
          interpretAs: interpretAs ? fromStringInterpretAs[interpretAs] : undefined,
        }),
      };
    }
    default:
      return { case: undefined, value: undefined };
  }
}
