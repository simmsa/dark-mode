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
