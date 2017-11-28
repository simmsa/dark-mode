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
