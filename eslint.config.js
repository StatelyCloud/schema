import { library } from "@stately-cloud/eslint";

export default [
  ...library,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ["dist/", "**/*_pb.ts"],
  },
];
