/**
 * A deferred version of a type may also be a function that returns that type.
 * Consumers should use resolveDeferred to get the original type.
 */
export type Deferred<T extends object> = T | (() => T);

/**
 * Resolves a deferred type to its underlying type.
 */
export function resolveDeferred<T extends object>(type: Deferred<T>): T {
  return typeof type === "function" ? type() : type;
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
