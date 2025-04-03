import { Console } from "node:console";

// Print *everything* to stderr, so it can be captured by the CLI.
globalThis.console = new Console(process.stderr, process.stderr);
