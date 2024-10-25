/**
 * SchemaError allows us to communicate Stately error codes to the Stately CLI
 * from the Schema DSL.
 */
export class SchemaError extends Error {
  /**
   * The more fine-grained Stately error code, which is a human-readable string.
   */
  readonly statelyCode: string;

  override name = "SchemaError";

  constructor(statelyCode: string, message: string) {
    super(message);
    // see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    Object.setPrototypeOf(this, new.target.prototype);
    this.statelyCode = statelyCode;
  }
}
