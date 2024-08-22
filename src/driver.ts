import { create, toBinary } from "@bufbuild/protobuf";
import { FileDescriptorSetSchema } from "@bufbuild/protobuf/wkt";
import path from "node:path";
import process from "node:process";
import { tsImport } from "tsx/esm/api";
import ts from "typescript";
import { file } from "./file.js";
import { type SchemaType } from "./types.js";

/**
 * The build function is used by the CLI to build a binary FileDescriptorSet
 * file from input TypeScript files. The TypeScript files should include public
 * exports of the types that should be included in the schema.
 *
 * The result will be printed to stdout as a binary proto FileDescriptorSet.
 *
 * @example
 * await build("input.ts");
 */
export async function build(inputPath: string, fileName: string) {
  const fullInputPath = path.resolve(inputPath);

  process.stderr.write(`Building schema from ${fullInputPath}`);

  // Use TypeScript to parse the input files

  const program = ts.createProgram([fullInputPath], {
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
  });

  const allDiagnostics = ts.getPreEmitDiagnostics(program);

  // const emitResult = program.emit();
  // Could hook the result files and use them to add in-memory modules: https://nodejs.org/api/module.html#customization-hooks

  // TODO: I guess we could walk the AST of the source files to find a mapping of JSDoc??
  // https://joshuakgoldberg.github.io/ts-api-utils/stable/types/ForEachCommentCallback.html

  for (const diagnostic of allDiagnostics) {
    if (diagnostic.file) {
      const { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start!,
      );
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      process.stderr.write(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
      );
    } else {
      process.stderr.write(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  }

  if (allDiagnostics.length) {
    return false;
  }

  // Import from the generated code.
  try {
    const exportedValues = (await tsImport(fullInputPath, import.meta.url)) as {
      [name: string]: SchemaType | SchemaType[] | (() => SchemaType);
    };
    // Process into a FileDescriptorProto
    const fd = file(exportedValues, fileName);

    const fds = create(FileDescriptorSetSchema, {
      file: [fd],
    });

    // Export the FileDescriptorProto to the output path
    const fdBytes = toBinary(FileDescriptorSetSchema, fds);

    // Write the file
    await new Promise((resolve, reject) =>
      // use the process stdout API here because we want to block on the callback
      process.stdout.write(fdBytes, (err) => (err ? reject(err) : resolve(undefined))),
    );
  } catch (e) {
    if ((e && typeof e === "string") || e instanceof Error) {
      process.stderr.write(e.toString());
    } else {
      process.stderr.write("An error occurred while importing the generated code.");
    }
    return false;
  }
  return true;
}
