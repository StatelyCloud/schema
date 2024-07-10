# StatelyDB Schema Language

This is a TypeScript domain-specific language (DSL) for generating Stately Schemas. You use schemas to define the shape of your data model in StatelyDB, including validation, types, and other database configuration such as key paths and indexes. It is meant to be used with the `stately` CLI, e.g. `stately schema put index.ts`.

# How it's used

1. Create a `package.json` and add a dependency on `@stately-cloud/schema` (e.g. `npm init`, `npm i @stately-cloud/schema`)
2. Create a `tsconfig.json` for your schema. This is necessary to get good autocomplete in VSCode.
3. Create your schema files, each of which is a TypeScript (`.ts`) file. These import from `@stately-cloud/schema` to get types and builder functions, and export their types.
4. Run `stately schema validate index.ts` to check your schema.
5. Run `stately schema put --store-id 12345 index.ts` to upload the schema to your store.
6. Run `stately schema generate --language typescript index.ts` to generate typed models for your schema.
