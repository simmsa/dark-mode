import * as utils from "../src/utils";

describe("`capitalize` utility", () => {
  const testCapitalize = (input: string, expected: string) => {
    expect(utils.capitalize(input)).toBe(expected);
  };

  test("Capitalizes correctly", () => {
    testCapitalize("test", "Test");
  });

  test("Handles numbers correctly", () => {
    testCapitalize("1", "1");
  });

  test("Handles spaces correctly", () => {
    testCapitalize(" word", " word");
  });
});
