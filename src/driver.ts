import { create, toBinary } from "@bufbuild/protobuf";
import { readFile } from "node:fs/promises";
import { findPackageJSON } from "node:module";
import path from "node:path";
import process from "node:process";
import { register } from "tsx/esm/api";
import ts from "typescript";
import { buildSourceCodeInfo, extractCommentBindings } from "./comments.js";
import { DSLResponse, DSLResponseSchema } from "./dsl/cli_pb.js";
import { SchemaError } from "./errors.js";
import { StatelyErrorDetails, StatelyErrorDetailsSchema } from "./errors/error_details_pb.js";
import { file } from "./file.js";
import { DeferredMigration } from "./migrate.js";
import { SchemaPackage } from "./package_pb.js";
import { SchemaDefaults } from "./schema-defaults.js";
import { Deferred, Plural, resolvePlural } from "./type-util.js";
import { type SchemaType } from "./types.js";

/**
 * The build function is used by the CLI to build a binary DSLResponse file from
 * input TypeScript files. The TypeScript files should include public exports of
 * the types that should be included in the schema.
 *
 * The result will be printed to stdout as a binary proto DSLResponse. Any
 * errors should also be returned in a binary proto DSLResponse, unless there's
 * an error writing to stdout.
 *
 * @example
 * await build("input.ts");
 */
export async function build(
  inputPath: string,
  fileName: string,
  migrationsFromSchemaVersion?: number,
): Promise<void> {
  const fullInputPath = path.resolve(inputPath);

  // Load the input schema file's Node package to make sure it is a valid
  try {
    const schemaPackageJsonPath = findPackageJSON(fullInputPath, import.meta.url);
    if (!schemaPackageJsonPath) {
      await respondWithError(
        new Error(`Could not find package.json for schema package at ${fullInputPath}`),
        "SchemaPackageJson",
        "The schema must be in a package with a package.json file.",
      );
      return;
    }
    // Read the package.json file to get the schema ID.
    const packageJson = JSON.parse((await readFile(schemaPackageJsonPath)).toString("utf8")) as {
      type?: string;
    };
    if (packageJson.type !== "module") {
      await respondWithError(
        new Error(`The package.json file at ${schemaPackageJsonPath} must have "type": "module"`),
        "SchemaPackageType",
        'The schema package must be an ES module, so it must have "type": "module" in its package.json.',
      );
      return;
    }
  } catch (e) {
    await respondWithError(
      e,
      "SchemaPackageJson",
      "An error occurred while finding the package.json file for your schema.",
    );
    return;
  }

  // We need to be able to generate unique package names for each schema file so that
  // types do not collide in proto registries. (e.g. My app uses two different unrelated
  // schemas, cpschema, and testschema). To do this we will add the file name to the package
  // we generate.
  const packageName = fileName ? `stately.generated.${fileName}` : "stately.generated";
  process.stderr.write(`Building schema from ${inputPath}\n`);

  // Use TypeScript to parse the input files.
  // TODO: Read the tsconfig.json file and use that to set the compiler options.
  const tsOpts: ts.CompilerOptions = {
    strict: true,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noUnusedLocals: false, // Don't whine if they don't use all the imports.
    noUnusedParameters: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    baseUrl: ".",
    allowJs: true,
    useUnknownInCatchVariables: true,
  };
  const program = ts.createProgram([fullInputPath], tsOpts);

  // Validate and type check the program
  const allDiagnostics = ts.getPreEmitDiagnostics(program);

  // Emit typescript files to disk:
  // const emitResult = program.emit();
  // Could hook the result files and use them to add in-memory modules: https://nodejs.org/api/module.html#customization-hooks

  const errors: StatelyErrorDetails[] = [];

  for (const diagnostic of allDiagnostics) {
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!,
      );
      message = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
    }
    errors.push(createError("InvalidTypeScript", message));
  }

  if (allDiagnostics.length) {
    await respond(create(DSLResponseSchema, { errors }));
    return;
  }

  // Import from the generated code. This form of tsx's import function will
  // preserve the imported namespace between invocations so we can do two
  // imports (one for the schema, one for the registry) and they'll share state.
  const tsx = register({
    namespace: Date.now().toString(),
  });

  // Patch the console within the tsx context so that we can capture console.log from stderr - stdout is reserved for
  // the output of the schema.
  await tsx.import("./patch-console.js", import.meta.url);

  let exportedValues: {
    // Deferred because the exported value may be a function that returns a type, instead of the type itself.
    // Plural because the function may return multiple types (currently only done from tests).
    [name: string]: Deferred<Plural<SchemaType>> | DeferredMigration;
  };
  // First import the user's schema, which runs all the top level declarations.
  try {
    exportedValues = (await tsx.import(fullInputPath, import.meta.url)) as typeof exportedValues;
  } catch (e) {
    await respondWithError(
      e,
      "SchemaModuleInit",
      "An error occurred while importing your schema code.",
    );
    return;
  }

  // Then fish out all the types and migrations from the registry, which records
  // them as they are invoked.
  const { getAllTypes, getAllMigrations, getSchemaDefaults } = (await tsx.import(
    "./type-registry.js",
    import.meta.url,
  )) as {
    getAllTypes: () => SchemaType[];
    getAllMigrations: () => DeferredMigration[];
    getSchemaDefaults: () => SchemaDefaults;
  };

  const deferredMigrations: DeferredMigration[] = getAllMigrations();
  const schemaTypes: SchemaType[] = getAllTypes();
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
  let pkg: SchemaPackage;
  try {
    pkg = file(schemaTypes, schemaDefaults, fileName, packageName);
  } catch (e) {
    if (e instanceof SchemaError) {
      const output = create(DSLResponseSchema, {
        errors: [createError(e.statelyCode, e.message)],
      });
      await respond(output);
    } else {
      await respondWithError(e, "SchemaCode", "An error occurred while running your schema code.");
    }
    return;
  }

  // Add comment information to the SchemaPackage, statically extracted
  // from the TypeScript AST.
  try {
    const commentBindings = extractCommentBindings(program);
    buildSourceCodeInfo(pkg, commentBindings);
  } catch (e) {
    await respondWithError(
      e,
      "SchemaComment",
      "An error occurred while extracting comments from your schema code.",
    );
    return;
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
    package: pkg,
    migrations: migrations,
  });
  respond(output);
}

function createError(statelyCode: string, message: string) {
  return create(StatelyErrorDetailsSchema, {
    statelyCode,
    message,
    /* InvalidArgument is closest for "your code doesn't work" or "we found validation errors" */
    code: 3,
  });
}

async function respondWithError(e: unknown, statelyCode: string, message: string) {
  if ((e && typeof e === "string") || e instanceof Error) {
    const output = create(DSLResponseSchema, {
      errors: [
        createError(
          statelyCode,
          `${message}: ${e.toString()}\n${e instanceof Error ? e.stack : ""}`,
        ),
      ],
    });
    await respond(output);
  } else {
    throw e;
  }
}

async function respond(output: DSLResponse) {
  // Get the version of the @stately-cloud/schema package from its package.json
  const packageJson = JSON.parse(
    (await readFile(new URL("../package.json", import.meta.url))).toString("utf8"),
  ) as { version: string };
  output.dslVersion = packageJson.version;
  // Export the DSLResponse to the output path
  const outputBytes = toBinary(DSLResponseSchema, output);

  // Write the file
  await new Promise((resolve, reject) =>
    // use the process stdout API here because we want to block on the callback
    process.stdout.write(outputBytes, (err) => (err ? reject(err) : resolve(undefined))),
  );
}

/**
 * Select only those migrations that start at the highest version number.
 */
function getLatestMigrations(deferredMigrations: DeferredMigration[]) {
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
