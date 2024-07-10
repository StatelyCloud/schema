/**
 * Validation helpers. Most validation occurs in the Go library, but we need to
 * make sure we produce generally valid descriptors to even get that far.
 */

/**
 * Validate identifier names against the proto rules.
 * @see https://protobuf.com/docs/language-spec#identifiers-and-keywords
 */
export function validateName(name: string): boolean {
  return /^[A-Za-z_]([A-Za-z0-9_])*$/.test(name);
}
