/*
 *  ____             _      __  __           _
 * |  _ \  __ _ _ __| | __ |  \/  | ___   __| | ___
 * | | | |/ _` | '__| |/ / | |\/| |/ _ \ / _` |/ _ \
 * | |_| | (_| | |  |   <  | |  | | (_) | (_| |  __/
 * |____/ \__,_|_|  |_|\_\ |_|  |_|\___/ \__,_|\___|
 *
 * Copyright (c) 2015-present, Andrew Simms
 * Author: Andrew Simms <simms.andrew@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import LogError from "./LogError";

export const ParseIntBase10 = (input: string): number => {
  const base = 10;
  const result = parseInt(input, base);
  const isNaNResult = 0;

  if (isNaN(result)) {
    LogError(
      `ParseIntBase10 cannot convert "${input}" to a base ten integer and returned "${isNaNResult}" instead`,
    );

    return isNaNResult;
  }

  return result;
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
  const minChars = 3;

  if (maxChars <= 0) {
    LogError("Cannot truncate less than one character");
    return input;
  }

  if (input.length <= maxChars) {
    return input;
  } else if (maxChars < minChars) {
    return `${input.slice(0, 1)}${truncateChar}${input.slice(-1)}`;
  } else {
    const half = 2;
    const sliceChars = maxChars / half;
    return `${input.slice(0, sliceChars)}${truncateChar}${input.slice(
      sliceChars * -1,
    )}`;
  }
};
