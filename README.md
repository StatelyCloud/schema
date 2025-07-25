# StatelyDB Schema Language

StatelyDB is a document database built on top of DynamoDB. It uses Elastic Schema to allow you to update your data model at any time, with automatic backwards and forwards compatibility.

This is a TypeScript domain-specific language (DSL) for generating StatelyDB Schemas. You use schemas to define the shape of your data model in StatelyDB, including validation, types, and other database configuration such as key paths and indexes. You can also use migrations to change your data model, automatically preserving backwards and forwards compatibility with existing schema versions. It is meant to be used with the `stately` CLI, e.g. `stately schema put index.ts`.

# How it's used

1. Follow our [Getting Started](https://docs.stately.cloud/guides/getting-started/) guide to install the Stately CLI.
1. Run `stately schema init myschema` to create a new schema in the folder `myschema`.
1. Develop your schema in TypeScript (`.ts`) files. These import from `@stately-cloud/schema` to get types and builder functions.
1. Run `stately schema validate myschema/index.ts` to check your schema.
1. Run `stately schema put --schema-id 12345 --message "an update message" myschema/index.ts` to upload the schema to your store.
1. Run `stately schema generate --language typescript --schema-id 12345 <output-dir>` to generate typed models for your schema.
