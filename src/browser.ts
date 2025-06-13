import { create, toBinary } from "@bufbuild/protobuf";
import pkg from "../package.json" with { type: "json" };
import { DSLResponse, DSLResponseSchema } from "./dsl/cli_pb.js";
import { SchemaError } from "./errors.js";
import { StatelyErrorDetailsSchema } from "./errors/error_details_pb.js";
import { file } from "./file.js";
import * as schema from "./index.js";
import { Deferred, Plural } from "./index.js";
import { DeferredMigration } from "./migrate.js";
import { SchemaPackage } from "./package_pb.js";
import { SchemaDefaults } from "./schema-defaults.js";
import * as typeRegistry from "./type-registry.js";
import { resolvePlural } from "./type-util.js";
import { type SchemaType } from "./types.js";

// executeCommonJS is a fun lil thing. it allows us to execute compiled CommonJS in the browser by injecting
// a require function that returns the dependencies we pass in. We should only ever need to inject our library.
const executeCommonJS = (code: string, dependencies: Record<any, any> = {}): any => {
  const module = { exports: {} };
  const require = (name: string): any =>
    dependencies[name] ||
    (() => {
      throw new Error(`Module ${name} not found`);
    })();

  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const moduleFunction = new Function("module", "exports", "require", code);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  moduleFunction(module, module.exports, require);

  return module.exports;
};

/**
 * The build function is used by a browser to build a binary DSLResponse file from
 * a single Javascript source.
 *
 * The result will be returned as a binary proto DSLResponse. Any
 * errors should also be returned in the binary proto .
 *
 * @example
 * const dslResponse = build(<Javascript string>);
 */
export function build(
  jsSource: string,
  fileName: string,
  migrationsFromSchemaVersion?: number,
): Uint8Array {
  // We need to be able to generate unique package names for each schema file so that
  // types do not collide in proto registries. (e.g. My app uses two different unrelated
  // schemas: cpschema and testschema). To do this we will add the file name to the package
  // we generate.
  const packageName = fileName ? `stately.generated.${fileName}` : "stately.generated";

  let exportedValues: {
    // Deferred because the exported value may be a function that returns a type, instead of the type itself.
    // Plural because the function may return multiple types (currently only done from tests).
    [name: string]: Deferred<Plural<SchemaType>> | DeferredMigration;
  };
  try {
    exportedValues = executeCommonJS(jsSource, { [pkg.name]: schema }) as typeof exportedValues;
    // Now run the jsSource in the browser.
  } catch (e) {
    // We don't want to include the stack here, so we just return the error message.
    return respondWithError(
      (e as Error).message,
      "SchemaCode",
      "Failed to evaluate your schema code.",
    );
  }

  const { getAllMigrations, getAllTypes, getSchemaDefaults } = typeRegistry as {
    getAllMigrations: () => DeferredMigration[];
    getAllTypes: () => SchemaType[];
    getSchemaDefaults: () => SchemaDefaults;
  };

  const deferredMigrations = getAllMigrations();
  const schemaTypes = getAllTypes();
  const schemaDefaults = getSchemaDefaults();

  // Also look through the exported values for more types. This is mostly to
  // catch types that were declared as functions that weren't then used
  // elsewhere.
  for (const value of Object.values(exportedValues)) {
    if (typeof value === "function" && value.length === 0) {
      const maybeTypes = value();
      for (const maybeType of resolvePlural(maybeTypes)) {
        if (
          maybeType &&
          typeof maybeType === "object" &&
          "type" in maybeType &&
          ["item", "object", "enum", "alias"].includes(maybeType.type)
        ) {
          if (schemaTypes.includes(maybeType)) {
            // This type has already been registered, so skip it.
            continue;
          }
          schemaTypes.push(maybeType);
        }
      }
    }
  }

  // Process into a SchemaPackage
  let sPkg: SchemaPackage;
  try {
    sPkg = file(schemaTypes, schemaDefaults, fileName, packageName);
  } catch (e) {
    if (e instanceof SchemaError) {
      const output = create(DSLResponseSchema, {
        errors: [createError(e.statelyCode, e.message)],
      });
      return respond(output);
    } else {
      return respondWithError(
        e,
        "SchemaCode",
        "An error occurred while evaluating your schema code",
      );
    }
  }

  // Collect and expand all the migrations from selected schema version.
  // If an old version of the CLI has not passed migrationsFromSchemaVersion then just
  // return the migrations with the highest version number.
  const migrationsFromTargetVersions =
    migrationsFromSchemaVersion !== undefined
      ? deferredMigrations.filter((m) => m.fromSchemaVersion === migrationsFromSchemaVersion)
      : getLatestMigrations(deferredMigrations);
  const migrations = migrationsFromTargetVersions.map((migration) => migration.build());

  const output = create(DSLResponseSchema, {
    package: sPkg,
    migrations: migrations,
  });
  return respond(output);
}

function createError(statelyCode: string, message: string) {
  return create(StatelyErrorDetailsSchema, {
    statelyCode,
    message,
    /* InvalidArgument is closest for "your code doesn't work" or "we found validation errors" */
    code: 3,
  });
}

function respondWithError(e: unknown, statelyCode: string, message: string): Uint8Array {
  if ((e && typeof e === "string") || e instanceof Error) {
    const output = create(DSLResponseSchema, {
      errors: [
        createError(
          statelyCode,
          `${message}: ${e.toString()}\n${e instanceof Error ? e.stack : ""}`,
        ),
      ],
    });
    return respond(output);
  } else {
    throw e;
  }
}

function respond(output: DSLResponse) {
  output.dslVersion = pkg.version;
  // Export the DSLResponse to the output path
  return toBinary(DSLResponseSchema, output);
}

/**
 * Select only those migrations that start at the highest version number.
 */
export function getLatestMigrations(deferredMigrations: DeferredMigration[]) {
  let highestVersion = 0;
  let latestMigrations: DeferredMigration[] = [];
  for (const migration of deferredMigrations) {
    if (migration.fromSchemaVersion > highestVersion) {
      highestVersion = migration.fromSchemaVersion;
      latestMigrations = [migration];
    } else if (migration.fromSchemaVersion === highestVersion) {
      latestMigrations.push(migration);
    }
  }
  return latestMigrations;
}
