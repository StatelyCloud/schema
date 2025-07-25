import { create } from "@bufbuild/protobuf";
import { EnumType } from "./enum.js";
import { SchemaError } from "./errors.js";
import { Field, FieldFromMetadata, FieldInitialValue } from "./fields.js";
import { GroupLocalIndexConfig, ItemType, ObjectType, TTLConfig } from "./item-types.js";
import {
  BytesInterpretAs,
  FromMetadata,
  InitialValue,
  MessageOptions_Index,
  MessageOptions_IndexConfigSchema,
  MessageOptions_IndexSchema,
  MessageOptions_KeyPath,
  MessageOptions_KeyPathSchema,
  NumberInterpretAs,
  StringInterpretAs,
  SupportedFeatures,
  Ttl,
  Ttl_TtlSource,
  TtlSchema,
} from "./options_pb.js";
import {
  BinarySchema,
  BoolSchema,
  Constraint,
  ConstraintSchema,
  EnumTypeSchema,
  EnumValueSchema,
  FieldSchema,
  ListSchema,
  MessageType,
  MessageTypeSchema,
  NumberKind,
  NumberSchema,
  EnumType as PkgEnumType,
  Field as PkgField,
  Type as PkgType,
  TypeAlias as PkgTypeAlias,
  SchemaPackage,
  SchemaPackageSchema,
  StringSchema,
  TypeAliasSchema,
  TypeSchema,
} from "./package_pb.js";
import { SchemaDefaults } from "./schema-defaults.js";
import { stringifyDefault } from "./stringify.js";
import { resolveDeferred, resolvePlural } from "./type-util.js";
import {
  ProtoScalarType,
  resolveType,
  SchemaType,
  TypeAlias,
  TypeInfo,
  Validation,
} from "./types.js";

/**
 * Convert the list of known schema types into a SchemaPackage protobuf message.
 */
export function file(
  schemaTypes: SchemaType[],
  schemaDefaults: SchemaDefaults,
  fileName: string,
  packageName: string,
): SchemaPackage {
  // TODO: We don't actually need to set this at the schema level.
  let supportedFeatureFlags: SupportedFeatures = 0;
  if (schemaDefaults.syncable ?? true) {
    supportedFeatureFlags |= SupportedFeatures.SYNC;
  }
  if (schemaDefaults.versioned ?? true) {
    supportedFeatureFlags |= SupportedFeatures.VERSIONED_GROUP;
  }

  const pkg = create(SchemaPackageSchema, {
    // TODO: let the backend fill these in
    fileName: `${fileName || "stately"}.proto`,
    packageName: packageName,
    messages: [],
    enums: [],
    typeAliases: [],
    defaultGroupConfig: {
      tombstoneDurationSeconds: BigInt(
        schemaDefaults.tombstoneTTLHours ?? 0 /* 0 = default = 60 days */,
      ),
      supportedFeatureFlags,
    },
  });

  // This shouldn't be possible because of the type registry, but just in case
  const seenTypes = new Map<string, SchemaType>();

  const addType = (schemaType: SchemaType) => {
    const name = schemaType.name;

    const { underlyingType } = resolveType(schemaType);
    // Don't add the same type twice (e.g. if it's exported multiple times)
    if (seenTypes.has(name)) {
      if (seenTypes.get(name) !== underlyingType) {
        throw new SchemaError("SchemaDuplicateType", `Found two types with the same name: ${name}`);
      }
      return;
    }

    // If the underlying type is a ProtoScalarType enum value, it's really a
    // number. Everything else is an object.
    if (typeof underlyingType === "number") {
      if (schemaType.type === "alias" && !schemaType.noAlias) {
        pkg.typeAliases.push(convertAlias(schemaType));
        seenTypes.set(name, schemaType);
      }
      return;
    }

    seenTypes.set(name, underlyingType);
    switch (underlyingType.type) {
      case "enum":
        pkg.enums.push(convertEnum(underlyingType));
        break;
      case "item":
        pkg.messages.push(convertMessage(underlyingType, schemaDefaults, addType));
        break;
      case "object":
        pkg.messages.push(convertMessage(underlyingType, schemaDefaults, addType));
        break;
      default:
        // It's either a proto scalar or something we don't know about
        return;
    }
  };

  for (const schemaType of schemaTypes) {
    // First check to see if this is even a field config. TODO: We could
    // switch this to a class, or add a symbol type to the objects, to make
    // this more robust.
    if (
      typeof schemaType !== "object" ||
      !("type" in schemaType) ||
      !["type", "item", "object", "enum"].includes(schemaType.type)
    ) {
      // Skip this, it allows exporting string/number constants and such
      continue;
    }
    addType(schemaType);
  }

  return pkg;
}
function convertEnum(enumType: EnumType): PkgEnumType {
  const pkgEnumType = create(EnumTypeSchema, {
    typeName: enumType.name,
    comments: enumType.comments,
    deprecated: enumType.deprecated,
  });
  for (const [name, value] of Object.entries(enumType.values)) {
    const pkgEnumValue = create(EnumValueSchema, {
      shortName: name,
      ordinal: value.value,
      comments: value.comments,
      deprecated: value.deprecated,
    });
    pkgEnumType.values.push(pkgEnumValue);
  }

  // TODO: I don't know if we need to add the UNSPECIFIED value in the schema package version
  const hasZeroValue = pkgEnumType.values.some((v) => v.ordinal === 0);

  if (!hasZeroValue) {
    pkgEnumType.values.unshift(
      create(EnumValueSchema, {
        shortName: "UNSPECIFIED",
        ordinal: 0,
        comments: `The zero value for ${enumType.name}, used when it is not set to any other value.`,
      }),
    );
  }
  return pkgEnumType;
}

function convertAlias(typeAlias: TypeAlias): PkgTypeAlias {
  const typeInfo = resolveType(typeAlias);
  const pkgTypeAlias = create(TypeAliasSchema, {
    typeName: typeAlias.name,
    comments: typeAlias.comments,
    deprecated: typeAlias.deprecated,
    validations: buildValidation(typeAlias.valid ? resolvePlural(typeAlias.valid) : []),
    elementType: buildElementType(typeInfo),
  });
  return pkgTypeAlias;
}

function convertMessage(
  type: ObjectType | ItemType,
  schemaDefaults: SchemaDefaults,
  addType: (t: SchemaType) => void,
): MessageType {
  const messageType = create(MessageTypeSchema, {
    typeName: type.name,
    comments: type.comments,
    deprecated: type.deprecated,
    fields: [],
    itemTypeOptions:
      type.type === "item"
        ? {
            keyPaths: buildKeyPaths(type, schemaDefaults),
            ttl: buildTTL(type.ttl),
            indexes: buildIndexes(type.indexes),
          }
        : undefined,
  });
  for (const [name, field] of Object.entries(type.fields)) {
    messageType.fields.push(buildField(name, field, addType));
  }
  return messageType;
}

/* Mappings between DSL string options and protobuf options */

const fromMetadataConvert: Record<NonNullable<FieldFromMetadata["fromMetadata"]>, FromMetadata> = {
  createdAtTime: FromMetadata.CREATED_AT_TIME,
  lastModifiedAtTime: FromMetadata.LAST_MODIFIED_AT_TIME,
  createdAtVersion: FromMetadata.CREATED_AT_VERSION,
  lastModifiedAtVersion: FromMetadata.LAST_MODIFIED_AT_VERSION,
  ttl: FromMetadata.TTL,
};

const fromInitialValue: Record<NonNullable<FieldInitialValue["initialValue"]>, InitialValue> = {
  sequence: InitialValue.SEQUENCE,
  uuid: InitialValue.UUID,
  rand53: InitialValue.RAND53,
};

function buildField(name: string, field: Field, addType: (t: SchemaType) => void): PkgField {
  const type = resolveDeferred(field.type);
  // TODO: Move this check to the schema lib
  if (type.type === "item") {
    throw new Error(
      `Item types should not be used as fields - consider storing just the key path string pointing to ${type.name} instead, or declare it using objectType instead of itemType.`,
    );
  }
  const typeInfo = resolveType(type);

  const pkgField = create(FieldSchema, {
    fieldName: name,
    comments: field.comments,
    deprecated: field.deprecated,
    validations: buildValidation(
      field.valid ? [...typeInfo.validations, ...resolvePlural(field.valid)] : typeInfo.validations,
    ),
    fieldType: buildElementType(typeInfo),
    readDefault: stringifyDefault(field.readDefault /* ?? typeInfo.readDefault */),
  });
  if (typeof typeInfo.underlyingType !== "number") {
    addType(typeInfo.underlyingType);
  }

  let ephemeral = false;
  if ("fromMetadata" in field && field.fromMetadata) {
    pkgField.valueOption = {
      case: "fromMetadata",
      value: requireDefined(
        fromMetadataConvert[field.fromMetadata],
        `fromMetadata "${field.fromMetadata}" is not one of the valid values`,
      ),
    };
    ephemeral = true;
    pkgField.requireNonZero = false;
  } else if ("initialValue" in field && field.initialValue) {
    pkgField.valueOption = {
      case: "initialValue",
      value: requireDefined(
        fromInitialValue[field.initialValue],
        `initialValue "${field.initialValue}" is not one of the valid values`,
      ),
    };
    ephemeral = true;
    pkgField.requireNonZero = false;
  }

  // requireNonZero defaults to true for non-bool fields, false for bool and ephemeral fields
  pkgField.requireNonZero =
    field.required ?? (pkgField.fieldType?.type.case !== "bool" && !ephemeral);

  return pkgField;
}

function requireDefined<T>(value: T | undefined, message: string): T {
  if (value === undefined) {
    throw new SchemaError("SchemaInvalidOption", message);
  }
  return value;
}

function buildValidation(valid: (string | Validation)[]): Constraint[] {
  return valid.map((v): Constraint => {
    const validation = typeof v === "string" ? { valid: v, message: "" } : v;
    return create(ConstraintSchema, {
      celExpression: validation.valid,
      message: validation.message,
    });
  });
}

function buildKeyPaths(
  itemType: ItemType,
  schemaDefaults: SchemaDefaults,
): MessageOptions_KeyPath[] {
  return resolvePlural(itemType.keyPath).map((keyPath) => {
    const keyConfig = typeof keyPath === "string" ? { path: keyPath } : keyPath;
    const k = create(MessageOptions_KeyPathSchema, {
      pathTemplate: keyConfig.path,
      supportedFeatureFlags: 0,
      indexConfigs: keyConfig.indexes
        ? resolvePlural(keyConfig.indexes).map((pathTemplate) =>
            create(MessageOptions_IndexConfigSchema, { pathTemplate }),
          )
        : undefined,
    });
    const syncable = keyConfig.syncable ?? itemType.syncable ?? schemaDefaults.syncable ?? true;
    const versioned = keyConfig.versioned ?? itemType.versioned ?? schemaDefaults.syncable ?? true;
    if (syncable) {
      k.supportedFeatureFlags! |= SupportedFeatures.SYNC;
    }
    if (versioned) {
      k.supportedFeatureFlags! |= SupportedFeatures.VERSIONED_GROUP;
    }
    return k;
  });
}

/**
 * Mapping from the string TTL source names to the protobuf enum.
 */
const ttlSourceConvert: Record<TTLConfig["source"], Ttl_TtlSource> = {
  fromCreated: Ttl_TtlSource.FROM_CREATED,
  fromLastModified: Ttl_TtlSource.FROM_LAST_MODIFIED,
  atTimestamp: Ttl_TtlSource.AT_TIMESTAMP,
};

function buildTTL(ttl: TTLConfig | undefined): Ttl | undefined {
  if (!ttl) {
    return undefined;
  }
  const pkgTTL = create(TtlSchema, {
    source: requireDefined(
      ttlSourceConvert[ttl.source],
      `TTL source "${ttl.source}" is not one of the valid values`,
    ),
  });

  if ("durationSeconds" in ttl) {
    // Constant offset
    pkgTTL.value = {
      case: "durationSeconds",
      value: BigInt(ttl.durationSeconds),
    };
  } else if ("field" in ttl) {
    // Offset from a field reference
    pkgTTL.value = {
      case: "field",
      value: ttl.field,
    };
  }

  return pkgTTL;
}

function buildIndexes(
  indexes: GroupLocalIndexConfig[] | undefined,
): MessageOptions_Index[] | undefined {
  if (!indexes) {
    return undefined;
  }
  return indexes.map((index) =>
    create(MessageOptions_IndexSchema, {
      groupLocalIndex: index.groupLocalIndex,
      propertyPath: index.field,
    }),
  );
}

function buildElementType(typeInfo: TypeInfo): PkgType {
  const { underlyingType, repeated, interpretAs } = typeInfo;
  // TODO: This is where we could reference a registered type alias by name
  // instead of just using its underlying type. That would allow codegen to
  // "remember" what aliases were used where.
  const pkgType = create(TypeSchema, {
    type: buildType(underlyingType, repeated, interpretAs),
  });
  return pkgType;
}

/* Mappings between DSL string options and protobuf options */

type InterpretAsValues = NonNullable<TypeAlias["interpretAs"]>;
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

function buildType(
  // The underlying type shouldn't be a type alias - it should've been resolved
  // to a non-alias type by resolveType.
  underlyingType: Exclude<TypeAlias["parentType"], TypeAlias>,
  repeated: boolean,
  interpretAs: TypeAlias["interpretAs"],
): PkgType["type"] {
  if (repeated) {
    return {
      case: "list",
      value: create(ListSchema, {
        elementType: {
          // Recurse to build the element type
          type: buildType(underlyingType, false, interpretAs),
        },
      }),
    };
  }

  if (typeof underlyingType !== "number") {
    return {
      case: "referenceByName",
      value: underlyingType.name,
    };
  }

  if (underlyingType in NumberKind) {
    return {
      case: "number",
      value: create(NumberSchema, {
        kind: underlyingType as number as NumberKind,
        interpretAs: interpretAs
          ? requireDefined(
              fromNumberInterpretAs[interpretAs],
              `Invalid interpretAs value for number type: ${interpretAs}`,
            )
          : undefined,
      }),
    };
  }
  switch (underlyingType) {
    case ProtoScalarType.BOOL: {
      return {
        case: "bool",
        value: create(BoolSchema, {}),
      };
    }
    case ProtoScalarType.BYTES: {
      return {
        case: "binary",
        value: create(BinarySchema, {
          interpretAs: interpretAs
            ? requireDefined(
                fromBytesInterpretAs[interpretAs],
                `Invalid interpretAs value for bytes type: ${interpretAs}`,
              )
            : undefined,
        }),
      };
    }
    case ProtoScalarType.STRING: {
      return {
        case: "string",
        value: create(StringSchema, {
          interpretAs: interpretAs
            ? requireDefined(
                fromStringInterpretAs[interpretAs],
                `Invalid interpretAs value for string type: ${interpretAs}`,
              )
            : undefined,
        }),
      };
    }
    default:
      throw new SchemaError("SchemaUnknownType", `Unknown type: ${underlyingType}`);
  }
}
