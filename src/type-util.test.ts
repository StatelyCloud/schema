import { resolveDeferred, resolvePlural } from "./type-util.js";

describe("resolvePlural", () => {
  it("handles singular", () => {
    expect(resolvePlural(1)).toEqual([1]);
  });

  it("handles plural", () => {
    expect(resolvePlural([1])).toEqual([1]);
  });
});

describe("resolveDeferred", () => {
  it("handles normal object", () => {
    expect(resolveDeferred({ foo: 1 })).toEqual({ foo: 1 });
  });

  it("handles function", () => {
    expect(resolveDeferred(() => ({ foo: 1 }))).toEqual({ foo: 1 });
  });
});
