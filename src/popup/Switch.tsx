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

import { withStyles, WithStyles } from "material-ui/styles";

import ButtonBase from "material-ui/ButtonBase";
import Grid from "material-ui/Grid";
import MaterialUiSwitch from "material-ui/Switch";

import Message from "../Message";

import theme from "../theme";

import { IconType } from "./PopupIcon";
import RowWithTooltip from "./RowWithTooltip";

// tslint:disable:no-string-literal
const styles = {
  bar: {
    backgroundColor: "#ffffff",
  },
  checked: {
    "& + $bar": {
      backgroundColor: theme.colors.primaryBackground,
    },
    "color": theme.colors.primary,
  },
  root: {
    right: "4px",
  },
};

interface SwitchProps {
  title: string;
  group: string;
  field: string;
  tooltip: string;
  isChecked: boolean;
  iconType: IconType;
  isDisabled?: boolean;
}

const Switch = withStyles(styles)(
  class extends React.Component<
    SwitchProps & WithStyles<"bar" | "checked" | "root">,
    {}
  > {
    constructor(props) {
      super(props);

      this.state = {
        toolTipIconDeg: 0,
        toolTipOpen: false,
      };

      this.sendToggleFieldMessage = this.sendToggleFieldMessage.bind(this);
    }

    private sendToggleFieldMessage() {
      if (!this.props.isDisabled) {
        Message.send(
          Message.Sender.Popup,
          Message.Receiver.Background,
          Message.Intent.ToggleField,
          {
            Field: this.props.field,
            Group: this.props.group,
          },
        );
      }
    }

    public render() {
      return (
        <RowWithTooltip
          label={this.props.title}
          iconType={this.props.iconType}
          labelIconColor={
            this.props.isChecked ? theme.colors.primary : theme.colors.disabled
          }
          tooltip={this.props.tooltip}
          isDisabled={this.props.isDisabled}
          rightComponent={
            <ButtonBase
              onClick={this.sendToggleFieldMessage}
              style={{ padding: 0, margin: 0, borderWidth: 0, width: "100%" }}
              disableRipple={true}
            >
              <Grid
                container={true}
                direction="row"
                alignContent="center"
                justify={"flex-end"}
              >
                <MaterialUiSwitch
                  disabled={this.props.isDisabled}
                  classes={{
                    bar: this.props.classes.bar,
                    checked: this.props.classes.checked,
                    root: this.props.classes.root,
                  }}
                  checked={this.props.isDisabled ? false : this.props.isChecked}
                />
              </Grid>
            </ButtonBase>
          }
        />
      );
    }
  },
);

export default Switch;
