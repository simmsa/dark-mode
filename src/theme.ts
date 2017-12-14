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
