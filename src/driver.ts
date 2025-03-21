import { create, toBinary } from "@bufbuild/protobuf";
import { FileDescriptorProto } from "@bufbuild/protobuf/wkt";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { tsImport } from "tsx/esm/api";
import ts from "typescript";
import { buildSourceCodeInfo, extractCommentBindings } from "./comments.js";
import { DSLResponse, DSLResponseSchema } from "./dsl/cli_pb.js";
import { SchemaError } from "./errors.js";
import { StatelyErrorDetails, StatelyErrorDetailsSchema } from "./errors/error_details_pb.js";
import { file } from "./file.js";
import { DeferredMigration } from "./migrate.js";
import { Deferred, Plural } from "./type-util.js";
import { type SchemaType } from "./types.js";

// getPackageName returns the package name to use for the schema.
export const getPackageName = () => process.env.PACKAGE || "stately.generated";

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
  migrationsFromSchemaVersion?: bigint,
): Promise<void> {
  const fullInputPath = path.resolve(inputPath);

  // We need to be able to generate unique package names for each schema file so that
  // types do not collide in proto registries. (e.g. My app uses two different unrelated
  // schemas, cpschema, and testschema). To do this we will add the file name to the package
  // we generate. However, the program we create below to parse the input schema
  // essentially runs a disconnected version of the DSL i.e. variables cannot be shared
  // between the current runtime and the program we create below. Thus, when types are
  // registered they will be registered with a default package name unless we have a way
  // to communicate the package name to the program. Since we are still running in the same
  // process, we can use an environment variable to do this.
  process.env.PACKAGE = fileName ? `stately.generated.${fileName}` : "stately.generated";
  process.stderr.write(`Building schema from ${inputPath}\n`);

  // Use TypeScript to parse the input files.
  const tsOpts: ts.CompilerOptions = {
    strict: true,
    esModuleInterop: true,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noUnusedLocals: true,
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

  // const emitResult = program.emit();
  // Could hook the result files and use them to add in-memory modules: https://nodejs.org/api/module.html#customization-hooks

  // TODO: I guess we could walk the AST of the source files to find a mapping
  // of JSDoc?? to types/fields, and use that to write a SourceCodeInfo section
  // in the FileDescriptorProto (or do our own comment representation).
  // https://joshuakgoldberg.github.io/ts-api-utils/stable/types/ForEachCommentCallback.html

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

  // Import from the generated code.
  let exportedValues: {
    [name: string]: Deferred<Plural<SchemaType>> | DeferredMigration;
  };
  try {
    exportedValues = (await tsImport(fullInputPath, import.meta.url)) as typeof exportedValues;
  } catch (e) {
    await respondWithError(
      e,
      "SchemaModuleInit",
      "An error occurred while importing your schema code.",
    );
    return;
  }

  const deferredMigrations: DeferredMigration[] = [];
  const schemaTypes: Deferred<Plural<SchemaType>>[] = [];

  // The export names don't matter, only the exported values
  for (const value of Object.values(exportedValues)) {
    // We cannot compare types of values with "instanceof" because the
    // DeferredMigration type used in the customer's schema file is
    // a different copy of the class from the one we've imported here.
    // One is imported directly and the other is interpreted through
    // "tsImport". So instead we use the constructor name to compare types.
    if (value.constructor.name === "DeferredMigration") {
      deferredMigrations.push(value as DeferredMigration);
    } else {
      schemaTypes.push(value as Deferred<Plural<SchemaType>>);
    }
  }

  // Process into a FileDescriptorProto
  let fd: FileDescriptorProto;
  try {
    fd = file(schemaTypes, fileName, getPackageName());
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

  // Add comment information to the FileDescriptorProto, statically extracted
  // from the TypeScript AST.
  try {
    const commentBindings = extractCommentBindings(program);
    fd.sourceCodeInfo = buildSourceCodeInfo(fd, commentBindings);
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
    fileDescriptor: fd,
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
  // Get the version of the DSL from the package.json
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
  let highestVersion = 0n;
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
