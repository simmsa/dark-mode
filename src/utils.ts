export const ParseIntBase10 = (input: string): number => {
  const base = 10;
  return parseInt(input, base);
};

export const capitalize = (s: string): string => {
  try {
    return s[0].toUpperCase() + s.slice(1);
  } catch (e) {
    return s;
  }
};

export const truncate = (input: string, maxChars: number = 25): string => {
  const truncateChar = "…";

  if (input.length < maxChars) {
    return input;
  } else {
    const half = 2;
    const sliceChars = maxChars / half;
    return `${input.slice(0, sliceChars)}${truncateChar}${input.slice(
      sliceChars * -1,
    )}`;
  }
};
