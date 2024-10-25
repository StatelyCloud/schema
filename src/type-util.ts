/**
 * A deferred version of a type may also be a function that returns that type.
 * Consumers should use resolveDeferred to get the original type.
 */
export type Deferred<T extends object> = T | (() => T);

/**
 * Resolves a deferred type to its underlying type.
 */
export function resolveDeferred<T extends object>(type: Deferred<T>): T {
  // The "type as T" is a bit of a lie if `type` is a function with multiple
  // arguments, but it'll be caught elsewhere
  return typeof type === "function" && type.length === 0 ? type() : (type as T);
}

/**
 * A plural version of a type may either be an array of that type or a single
 * value of that type. This can be convenient for callers so they don't have to
 * always wrap a single value in an array.
 */
export type Plural<T> = T | T[];

/**
 * Resolves a plural type to an array of that type.
 */
export function resolvePlural<T>(value: Plural<T>): T[] {
  return Array.isArray(value) ? value : [value];
}
