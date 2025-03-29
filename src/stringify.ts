/**
 * This massages an unknown type into a Stately-serializable type. This is used
 * to serialize default values for fields.
 */
export function stringifyDefault(def: unknown): undefined | string {
  if (def === undefined || def === null) {
    return undefined;
  }
  const result = stringifyDefaultInner(def);
  switch (typeof result) {
    case "undefined":
      return undefined;
    case "string":
      return result;
    default:
      return JSON.stringify(result);
  }
}

export function stringifyDefaultInner(def: unknown): undefined | string | object {
  if (def === undefined || def === null) {
    return undefined;
  }

  switch (typeof def) {
    case "undefined":
      return undefined;
    case "number":
    case "string":
    case "boolean":
    case "bigint":
    case "symbol":
      return def.toString();
    case "function":
      throw new Error("Cannot serialize a function as a default value");
    case "object":
      // TODO: handle more types here (e.g. our UUID type when we make it)
      if (Array.isArray(def)) {
        return def.map(stringifyDefaultInner);
      } else if (def instanceof Uint8Array) {
        return Buffer.from(def).toString("base64");
      } else if (def instanceof Date) {
        return def.toISOString();
      } else if (Symbol.iterator in def && typeof def[Symbol.iterator] === "function") {
        // Handles Set, other iterables
        return Array.from(def as Iterable<unknown>).map(stringifyDefaultInner);
      }
      if (Object.getPrototypeOf(def) === Object.prototype || Object.getPrototypeOf(def) === null) {
        return Object.fromEntries(
          Object.entries(
            def as {
              [s: string]: unknown;
            },
          ).map(([k, v]) => [k, stringifyDefaultInner(v)]),
        );
      }
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Cannot serialize object of type ${Object.getPrototypeOf(def).constructor.name}`,
      );
  }
}
