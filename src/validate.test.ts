import { describe, expect, test } from "@jest/globals";
import { validateName } from "./validate.js";

describe("validateName", () => {
  const cases: [input: string, valid: boolean][] = [
    ["", false],
    ["GameType", true],
    ["gameType", true],
    ["game_type", true],
    ["gameType1", true],
    ["game type", false],
    ["1gameType", false],
  ];

  test.each(cases)("validateName(%p) === %p", (input, valid) => {
    expect(validateName(input)).toBe(valid);
  });
});
