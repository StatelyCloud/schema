import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDeferred, resolvePlural } from "./type-util.js";

describe("resolvePlural", () => {
  it("handles singular", () => {
    assert.deepEqual(resolvePlural(1), [1]);
  });

  it("handles plural", () => {
    assert.deepEqual(resolvePlural([1]), [1]);
  });
});

describe("resolveDeferred", () => {
  it("handles normal object", () => {
    assert.deepEqual(resolveDeferred({ foo: 1 }), { foo: 1 });
  });

  it("handles function", () => {
    assert.deepEqual(
      resolveDeferred(() => ({ foo: 1 })),
      { foo: 1 },
    );
  });
});
