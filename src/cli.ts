#!/usr/bin/env node
import { build } from "./driver.js";

try {
  const [
    _nodePath,
    _scriptPath,
    inputFile,
    outputFileDescriptorName,
    migrationsFromSchemaVersionStr = undefined,
  ] = process.argv;
  const migrationsFromSchemaVersion = migrationsFromSchemaVersionStr
    ? BigInt(migrationsFromSchemaVersionStr)
    : undefined;
  await build(inputFile, outputFileDescriptorName, migrationsFromSchemaVersion);
} catch (e) {
  if ((e && typeof e === "string") || e instanceof Error) {
    process.stderr.write(e.toString());
  } else {
    process.stderr.write("An error occurred");
  }
  process.exit(1);
}
