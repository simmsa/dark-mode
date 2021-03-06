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

import * as Color from "color";

interface Theme {
  colors: {
    background: string;
    backgroundLight: string;
    backgroundVeryLight: string;
    primary: string;
    primaryBackground: string;
    primaryLight: string;
    disabled: string;
  };
}

export type SizeType =
  | "extraSmall"
  | "small"
  | "smallNormal"
  | "normal"
  | "largeNormal"
  | "large"
  | "extraLarge"
  | "extraExtraLarge";

const lightenColor = (color: string, amount: number): string => {
  return Color(color)
    .lighten(amount)
    .hex();
};

// tslint:disable:no-magic-numbers
// tslint:disable:object-literal-sort-keys
const theme: Theme = {
  colors: {
    background: "#001019",
    get backgroundLight() {
      return lightenColor(this.background, 0.5);
    },
    get backgroundVeryLight() {
      return lightenColor(this.background, 1);
    },
    // Cyan A400
    primary: "#00E5FF",
    primaryBackground: "#26C6DA",
    get primaryLight() {
      return lightenColor(this.primary, 0.2);
    },
    disabled: "#AAAAAA",
  },
};

export default theme;
