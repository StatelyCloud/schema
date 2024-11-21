import { create } from "@bufbuild/protobuf";
import {
  DescriptorProto,
  EnumDescriptorProto,
  FileDescriptorProto,
  FileDescriptorProtoSchema,
} from "@bufbuild/protobuf/wkt";
import { SchemaError } from "./errors.js";
import { Deferred, Plural, resolveDeferred, resolvePlural } from "./type-util.js";
import { SchemaType, resolveType } from "./types.js";

export function file(
  schemaTypes: Deferred<Plural<SchemaType>>[],
  fileName: string,
  packageName: string,
): FileDescriptorProto {
  const fd = create(FileDescriptorProtoSchema, {
    name: `${fileName || "stately"}.proto`, // TODO: for now, we pretend everything was in a single "file"
    package: packageName, // TODO: for now, we pretend everything was in a single "package"
    // Add in any dependencies. Right now these can be hardcoded. We need our
    // own options, plus buf for validation (though we could eventually fold
    // validation into our options since we only use the cel expression
    // validation stuff).
    dependency: ["buf/validate/validate.proto", "extensions.proto"],
    syntax: "proto3",
  });

  // TODO: SourceCodeInfo from the "docs" fields?

  const seenTypes = new Map<string, EnumDescriptorProto | DescriptorProto>();

  for (const exportValue of schemaTypes) {
    const fieldConfigs = resolvePlural(resolveDeferred(exportValue));
    for (const fieldConfig of fieldConfigs) {
      // First check to see if this is even a field config. TODO: We could
      // switch this to a class, or add a symbol type to the objects, to make
      // this more robust.
      if (
        typeof fieldConfig !== "object" ||
        !("name" in fieldConfig) ||
        !("parentType" in fieldConfig)
      ) {
        // Skip this, it allows exporting string/number constants and such
        continue;
      }

      const name = fieldConfig.name;
      const fqName = `.${packageName}.${name}`;

      const { underlyingType } = resolveType(fieldConfig);
      // Don't add the same type twice (e.g. if it's exported multiple times)
      if (seenTypes.has(fqName)) {
        if (seenTypes.get(fqName) !== underlyingType) {
          throw new SchemaError(
            "SchemaDuplicateType",
            `Found two types with the same name: ${fqName}`,
          );
        }
        continue;
      }

      if (typeof underlyingType === "number") {
        // ignore it
        continue;
      } else if ("value" in underlyingType) {
        fd.enumType.push(underlyingType);
      } else {
        fd.messageType.push(underlyingType);
      }
      seenTypes.set(fqName, underlyingType);
    }
  }

  // Check messages for references to unexported types
  for (const messageType of fd.messageType) {
    for (const field of messageType.field) {
      if (field.typeName && !seenTypes.has(field.typeName)) {
        // TODO: some sort of error accumulator
        // TODO: show the full typename in the error once the user has control over namespacing
        const shortName = field.typeName.split(".").at(-1)!;
        throw new SchemaError(
          "SchemaUnexportedType",
          `Type ${shortName} was not exported. Please export it (e.g. 'export const ${shortName} = ...;').`,
        );
      }
    }
  }

  return fd;
}
