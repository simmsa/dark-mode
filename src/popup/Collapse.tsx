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

import ButtonBase from "material-ui/ButtonBase";
import Icon from "material-ui/Icon";

import MaterialUiCollapse from "material-ui/transitions/Collapse";

import { muiTheme } from "./index";

import theme from "../theme";

import Label from "./Label";
import { IconType } from "./PopupIcon";
import Row from "./Row";

interface CollapseProps {
  children: any;
  iconType: IconType;
  isOpen?: boolean;
  text: string;
}

interface CollapseState {
  isOpen: boolean;
  rotateDeg: number;
}

class Collapse extends React.Component<CollapseProps, CollapseState> {
  private rotateIncrement = 180;
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen || false,
      rotateDeg: props.isOpen === true ? this.rotateIncrement : 0,
    };

    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  private toggleCollapse() {
    this.setState(prevState => {
      return {
        isOpen: !prevState.isOpen,
        rotateDeg: prevState.rotateDeg + this.rotateIncrement,
      };
    });
  }

  public render() {
    return (
      <div>
        <ButtonBase
          onClick={this.toggleCollapse}
          style={{
            margin: 0,
            padding: 0,
            width: "100%",
          }}
        >
          <Row
            backgroundColor={theme.colors.backgroundLight}
            dividerColor={theme.colors.backgroundLight}
            wideLeft={true}
            left={
              <Label iconType={this.props.iconType}>{this.props.text}</Label>}
            right={
              <Icon
                style={{
                  transform: `rotate(${this.state.rotateDeg}deg)`,
                  transition: muiTheme.transitions.create("transform", {
                    duration: muiTheme.transitions.duration.standard,
                  }),
                }}
              >
                expand_more
              </Icon>
            }
          />
        </ButtonBase>
        <MaterialUiCollapse in={this.state.isOpen}>
          {this.props.children}
        </MaterialUiCollapse>
      </div>
    );
  }
}

export default Collapse;
