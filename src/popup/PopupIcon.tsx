import * as React from "react";

import Icon from "material-ui/Icon";

import { muiTheme } from "./index";

export type IconType =
  | "add"
  | "autoDark"
  | "bug"
  | "collapse"
  | "contrast"
  | "darkMode"
  | "global"
  | "help"
  | "here"
  | "hue"
  | "keyboard"
  | "log"
  | "notifications"
  | "reset"
  | "rightArrow"
  | "settings"
  | "subtract"
  | "tooltip";

type IconTypes = { [icon in IconType]: string };

interface PopupIconProps {
  iconType: IconType;
  isSmall?: boolean;
  style?: any;
  rotateDeg?: number;
  color?: string;
}

class PopupIcon extends React.PureComponent<PopupIconProps, {}> {
  private static IconMap: IconTypes = {
    add: "add",
    autoDark: "brightness_auto",
    bug: "bug_report",
    collapse: "expand_more",
    contrast: "brightness_6",
    darkMode: "wb_incandescent",
    global: "public",
    help: "help",
    here: "my_location",
    hue: "color_lens",
    keyboard: "keyboard",
    log: "report",
    notifications: "notifications",
    reset: "refresh",
    rightArrow: "chevron_right",
    settings: "settings",
    subtract: "remove",
    tooltip: "help",
  };

  public render() {
    const style = this.props.style;
    const fontSize = this.props.isSmall ? { fontSize: 18 } : undefined;
    const transition =
      typeof this.props.rotateDeg === "number"
        ? {
            transform: `rotate(${this.props.rotateDeg}deg)`,
            transition: muiTheme.transitions.create("transform", {
              duration: muiTheme.transitions.duration.standard,
            }),
          }
        : undefined;
    const color = this.props.color
      ? {
          color: this.props.color,
          transition: muiTheme.transitions.create("color", {
            duration: muiTheme.transitions.duration.standard,
          }),
        }
      : { color: "#ffffff" };

    return (
      <Icon style={{ ...style, ...fontSize, ...transition, ...color }}>
        {PopupIcon.IconMap[this.props.iconType]}
      </Icon>
    );
  }
}

export default PopupIcon;
