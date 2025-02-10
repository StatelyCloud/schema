import { create, setExtension } from "@bufbuild/protobuf";
import { message as messageExtension } from "./extensions_pb.js";
import { Field, field } from "./fields.js";
import {
  MessageOptions_IndexSchema,
  MessageOptions_KeyPathSchema,
  MessageOptionsSchema as StatelyMessageOptionsSchema,
  Ttl_TtlSource,
  TtlSchema,
} from "./options_pb.js";
import { Plural, resolveDeferred, resolvePlural } from "./type-util.js";
import { SchemaType } from "./types.js";

import {
  DescriptorProto,
  DescriptorProtoSchema,
  FieldDescriptorProto,
  MessageOptionsSchema,
} from "@bufbuild/protobuf/wkt";
import { getRegisteredType, registerType, TypeDefinitionError } from "./type-registry.js";
import { validateName } from "./validate.js";

/**
 * A PathTemplate is a url pattern that will be used to generate the path for an
 * item's Key Path. The template should be a valid URL Pattern as defined in
 * https://urlpattern.spec.whatwg.org/ (see also
 * https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API and
 * https://github.com/soongo/path-to-regexp). It should also be a valid Stately
 * key path when all variables are substituted into it. Each variable should
 * correspond to the name or field ID of a field in the parent message, and each
 * of those fields should be a number, string, or binary type.
 *
 * For example, a `User` message with fields `user_id` and `org_id` could have a
 * key path template of `/orgs-:org_id/users-:user_id`.
 */
export type PathTemplate = string;

/**
 * A string representation of a property path into this item's fields. At its
 * simplest it is just a property name, but it can also reference nested
 * properties, including digging into JSON/map fields. For example:
 *
 * - "name": the field "name"
 * - "address.city": the field "city" in the nested object "address"
 * - "address.city.id": the field "id" in the nested object "city" in the
 *   nested object "address"
 */
export type PropertyPath = string;

/**
 * The list of fields that can be defined on an item or object type. You can use
 * this type to declare fields outside an item type definition, and then
 * reference them in multiple item types.
 *
 * @example
 * const sharedFields: Fields = {
 *   name: {
 *     type: string,
 *   }
 * };
 *
 * export const ItemType1 = itemType("ItemType1", {
 *   keyPath: "/itemType1-:id",
 *   fields: {
 *     ...sharedFields,
 *     description: {
 *       type: string,
 *     },
 *   },
 * });
 */
export interface Fields {
  [fieldName: string]: Field;
}

export interface ItemTypeConfig {
  /**
   * One or more key paths that determine where the item is stored in the database.
   */
  // TODO: In the future there may be more options than just the template - in
  // that case this can be Plural<string | KeyPathConfig>
  keyPath: Plural<PathTemplate>;

  /**
   * The set of fields that are defined on this type.
   */
  // TODO: fieldNames must be camelCase and json-safe?
  fields: Fields;

  /**
   * An optional TTL for the item, which will cause it to be automatically
   * deleted after some time.
   */
  ttl?: TTLConfig;

  /**
   * An optional set of indexes that should be maintained for this item type.
   * You can have up to 4 group-local indexes.
   */
  // TODO: In the future this could be a union with other index types
  indexes?: GroupLocalIndexConfig[];

  /**
   * Field names that are no longer used but used to be. When removing or
   * renaming a field, the old field name should be added to this list to
   * prevent re-use.
   */
  reservedNames?: string[];

  /**
   * Whether this entire item type is deprecated. This can affect generated
   * code.
   */
  deprecated?: boolean;

  // TODO: message-level CEL validations?
}

/**
 * Configuration for item-level TTL. This consists of a source for the TTL
 * value, and either a constant value or a field reference.
 */
export type TTLConfig = {
  source: "fromCreated" | "fromLastModified" | "atTimestamp";
} & (
  | {
      field: PropertyPath;
    }
  | {
      durationSeconds: number;
    }
);

/**
 * Configuration for a group-local index.
 */
// TODO: We should validate that the groupLocalIndex is unique across all of
// them.
export interface GroupLocalIndexConfig {
  groupLocalIndex: 1 | 2 | 3 | 4;
  field: PropertyPath;
}

/**
 * Mapping from the string TTL source names to the protobuf enum.
 */
const ttlSourceConvert: Record<TTLConfig["source"], Ttl_TtlSource> = {
  fromCreated: Ttl_TtlSource.FROM_CREATED,
  fromLastModified: Ttl_TtlSource.FROM_LAST_MODIFIED,
  atTimestamp: Ttl_TtlSource.AT_TIMESTAMP,
};

/**
 * Create a new item type. These are the "top level" items that are stored in
 * StatelyDB, and include information not only about the shape of their data but
 * also their key paths, indexes, TTL, etc.
 */
export function itemType(name: string, itemTypeConfig: ItemTypeConfig): SchemaType {
  const cachedType = getRegisteredType(name, "itemType", itemTypeConfig);
  if (cachedType) {
    return cachedType;
  }
  if (!validateName(name)) {
    // TODO: It would be nice to accumulate errors and return them all at once
    throw new Error(`Invalid item type name: ${name}`);
  }
  const message = create(DescriptorProtoSchema, {
    name,
  });
  const statelyOptions = create(StatelyMessageOptionsSchema);

  // keyPath
  for (const keyPath of resolvePlural(itemTypeConfig.keyPath)) {
    statelyOptions.keyPaths.push(create(MessageOptions_KeyPathSchema, { pathTemplate: keyPath }));
  }

  // TTL
  if (itemTypeConfig.ttl) {
    statelyOptions.ttl = create(TtlSchema, {
      source: ttlSourceConvert[itemTypeConfig.ttl.source],
    });

    if ("durationSeconds" in itemTypeConfig.ttl) {
      // Constant offset
      statelyOptions.ttl.value = {
        case: "durationSeconds",
        value: BigInt(itemTypeConfig.ttl.durationSeconds),
      };
    } else if ("field" in itemTypeConfig.ttl) {
      // Offset from a field reference
      statelyOptions.ttl.value = {
        case: "field",
        value: itemTypeConfig.ttl.field,
      };
    }
  }

  // Indexes
  for (const index of itemTypeConfig.indexes ?? []) {
    statelyOptions.indexes.push(
      create(MessageOptions_IndexSchema, {
        groupLocalIndex: index.groupLocalIndex,
        propertyPath: index.field,
      }),
    );
  }

  // set custom options
  message.options = create(MessageOptionsSchema);
  setExtension(message.options, messageExtension, statelyOptions);

  // Set the cache early to stop infinite recursion
  const schemaType = { name, parentType: message };
  registerType("itemType", schemaType, itemTypeConfig);

  // fields
  message.field = populateFields(name, itemTypeConfig.fields);

  // Reserved field names
  populateReserved(message, itemTypeConfig);

  // addSyntheticOneofs(message);

  return schemaType;
}

export type ObjectTypeConfig = Pick<ItemTypeConfig, "fields" | "reservedNames" | "deprecated">;

/**
 * An object type is very much like an item type, but it can only be used as a
 * field of another item type or object type. In other words, it is meant for
 * nested structures.
 */
export function objectType(name: string, itemTypeConfig: ObjectTypeConfig): SchemaType {
  const cachedType = getRegisteredType(name, "objectType", itemTypeConfig);
  if (cachedType) {
    return cachedType;
  }
  const message = create(DescriptorProtoSchema, {
    name,
  });

  // Set the cache early to stop infinite recursion
  const schemaType = { name, parentType: message };
  registerType("objectType", schemaType, itemTypeConfig);

  // fields
  message.field = populateFields(name, itemTypeConfig.fields);

  // Reserved field names
  populateReserved(message, itemTypeConfig);

  // addSyntheticOneofs(message);

  return schemaType;
}

/**
 * Build up all the FieldDescriptorProtos for the fields in an item type or
 * object type.
 */
function populateFields(typeName: string, fieldConfigs: ItemTypeConfig["fields"]) {
  const fields: FieldDescriptorProto[] = [];
  for (const [fieldName, fieldConfig] of Object.entries(fieldConfigs)) {
    // TODO: validate field names further? e.g. force them to be camelCase?
    if (!validateName(fieldName)) {
      throw new Error(`Invalid field name in item type ${typeName}: ${fieldName}`);
    }
    try {
      const fieldProto = field(fieldName, resolveDeferred(fieldConfig));
      fields.push(fieldProto);
    } catch (e) {
      if (e instanceof TypeDefinitionError) {
        throw e;
      }
      if (e instanceof Error) {
        const match = /Cannot access '([^']+)' before initialization/.exec(e.message);
        if (match) {
          const badType = match[1];
          throw new Error(
            `Error in field ${typeName}.${fieldName}: ${e.message}.\nDeclare ${badType} as a function to allow using it before it's declared: export function ${badType}() { return objectType("${badType}", ...); }`,
          );
        }
        throw new Error(`Error in field ${typeName}.${fieldName}: ${e.name}: ${e.message}`);
      }
      throw e;
    }
  }
  return fields;
}

/**
 * Add reserved field ranges and reserved field names to a message
 * DescriptorProto.
 */
function populateReserved(
  message: DescriptorProto,
  itemTypeConfig: Pick<ItemTypeConfig, "reservedNames">,
) {
  for (const fieldName of itemTypeConfig.reservedNames ?? []) {
    if (message.field.some((field) => field.name === fieldName)) {
      throw new Error(
        `Field name ${fieldName} is reserved in ${message.name} but is also used as a field name.`,
      );
    }
    message.reservedName.push(fieldName);
  }
}

// /**
//  * This adds "synthetic oneofs" to the message for each proto3 optional field.
//  * @see https://protobuf.com/docs/descriptors#field-presence
//  */
// function addSyntheticOneofs(message: DescriptorProto) {
//   if (message.oneofDecl.length) {
//     throw new Error("addSyntheticOneofs should only be called on messages without existing oneofs");
//   }
//   for (const field of message.field) {
//     if (field.proto3Optional) {
//       message.oneofDecl.push(
//         new OneofDescriptorProto({
//           // The name must be the field name prepended with an underscore.
//           name: `_${field.name}`,
//         }),
//       );
//       field.oneofIndex = message.oneofDecl.length - 1;
//     }
//   }
// }
