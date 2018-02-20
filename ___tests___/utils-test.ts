import * as utils from "../src/utils";

global.console = { ...global.console, trace: jest.fn() };

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

describe("`ParseIntBase10` utility", () => {
  test("Parses a number correctly", () => {
    // tslint:disable:no-magic-numbers
    expect(utils.ParseIntBase10("10")).toBe(10);
  });

  test("Logs an error when passed an invalid string", () => {
    expect(utils.ParseIntBase10("test")).toBe(0);
    expect(console.trace).toBeCalled();
  });
});
