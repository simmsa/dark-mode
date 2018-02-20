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

describe("`truncate` utility", () => {
  test("Truncates a word correctly", () => {
    expect(utils.truncate("testing", 2)).toBe("t…g");
  });

  test("Truncates odd lengths correctly", () => {
    expect(utils.truncate("testing", 3)).toBe("t…g");
  });

  test("Truncates longer lengths correctly", () => {
    expect(utils.truncate("testing", 4)).toBe("te…ng");
  });

  test("Doesn't truncate words shorter than the threshold", () => {
    expect(utils.truncate("test", 6)).toBe("test");
  });

  test("Handles words at the truncate threshold correctly", () => {
    expect(utils.truncate("test", 4)).toBe("test");
  });

  test("Handles small `maxChars` correctly", () => {
    expect(utils.truncate("testing", 2)).toBe("t…g");
    expect(utils.truncate("test", 1)).toBe("t…t");
  });

  test("Handles small input correctly", () => {
    expect(utils.truncate("tes", 3)).toBe("tes");
    expect(utils.truncate("te", 2)).toBe("te");
    expect(utils.truncate("t", 1)).toBe("t");
  });

  test("Logs errors when input is invalid", () => {
    expect(utils.truncate("t", 0)).toBe("t");
    expect(console.trace).toBeCalled();
  });
});
