#!/usr/bin/env node
import { build } from "./driver.js";

try {
  await build(process.argv[2], process.argv[3]);
} catch (e) {
  if ((e && typeof e === "string") || e instanceof Error) {
    process.stderr.write(e.toString());
  } else {
    process.stderr.write("An error occurred");
  }
  process.exit(1);
}
