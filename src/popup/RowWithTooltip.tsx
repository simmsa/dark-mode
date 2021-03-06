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
import MaterialUiCollapse from "material-ui/transitions/Collapse";
import Typography from "material-ui/Typography";

import Label from "./Label";
import { IconType } from "./PopupIcon";
import Row from "./Row";

import theme from "../theme";

interface SwitchProps {
  label: string;
  iconType: IconType;
  labelIconColor: string;
  tooltip: string;
  rightComponent: any;
  isDisabled?: boolean;
}

interface SwitchState {
  toolTipOpen: boolean;
  toolTipIconDeg: number;
}

class RowWithTooltip extends React.Component<SwitchProps, SwitchState> {
  private fullRotation = 360;

  constructor(props) {
    super(props);

    this.state = {
      toolTipIconDeg: 0,
      toolTipOpen: false,
    };

    this.handleTooltipClick = this.handleTooltipClick.bind(this);
  }

  private handleTooltipClick() {
    this.setState(prevState => {
      return {
        ...prevState,
        toolTipIconDeg: prevState.toolTipOpen ? 0 : this.fullRotation,
        toolTipOpen: !prevState.toolTipOpen,
      };
    });
  }

  public render() {
    return (
      <div
        style={this.props.isDisabled ? { opacity: 0.5 } : {}}
        title={`${this.props.isDisabled
          ? this.props.label + " is disabled when dark mode is off!"
          : ""}`}
      >
        <Row
          equalWidth={true}
          dividerColor={this.state.toolTipOpen ? "transparent" : undefined}
          left={
            <ButtonBase
              onClick={this.handleTooltipClick}
              style={{ padding: 0, borderWidth: 0, width: "100%" }}
              // This container has a weird size so disabling the ripple
              // negates the weird size
              disableRipple={true}
              disabled={this.props.isDisabled}
            >
              <Label
                iconType={this.props.iconType}
                hasTooltip={true}
                iconColor={
                  this.props.isDisabled
                    ? theme.colors.disabled
                    : this.props.labelIconColor
                }
                tooltipRotateDeg={this.state.toolTipIconDeg}
              >
                {this.props.label}
              </Label>
            </ButtonBase>
          }
          right={this.props.rightComponent}
        />
        <MaterialUiCollapse in={this.state.toolTipOpen}>
          <Row
            left={
              <Typography
                type="caption"
                style={{ fontSize: "15px", color: "#ffffff" }}
                gutterBottom={true}
              >
                {this.props.tooltip}
              </Typography>
            }
            right={undefined}
            flexHeight={true}
          />
        </MaterialUiCollapse>
      </div>
    );
  }
}

export default RowWithTooltip;
