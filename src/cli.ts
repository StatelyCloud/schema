import { build } from "./driver.js";

if (!(await build(process.argv[2], process.argv[3]))) {
  process.exit(1);
}
