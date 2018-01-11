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

import Button from "material-ui/Button";

import Message from "../Message";

import PopupIcon from "./PopupIcon";
import Row from "./Row";

import theme from "../theme";

// tslint:disable:object-literal-sort-keys
const styles = {
  root: {
    "color": theme.colors.background,
    "fontSize": 16,
    "margin": 0,
    "minHeight": 24,
    "minWidth": 48,
    "padding": 8,

    "&:hover": {
      backgroundColor: theme.colors.primaryLight,
    },
  },
};

interface ResetButtonProps {
  group: string;
}

interface ResetButtonState {
  rotateDeg: number;
}

const ResetButton = withStyles(styles)(
  class extends React.Component<
    ResetButtonProps & WithStyles<"root">,
    ResetButtonState
  > {
    private oneRotateCycle = 360;

    constructor(props) {
      super(props);

      this.state = {
        rotateDeg: 0,
      };

      this.onClick = this.onClick.bind(this);
    }

    private onClick() {
      this.setState(prevState => {
        return {
          ...prevState,
          rotateDeg: prevState.rotateDeg + this.oneRotateCycle,
        };
      });

      Message.send(
        Message.Sender.Popup,
        Message.Receiver.Background,
        Message.Intent.ResetGroup,
        this.props.group,
      );
    }

    public render() {
      return (
        <Row
          left={undefined}
          right={
            <Button
              raised={true}
              color="primary"
              onClick={this.onClick}
              classes={{ root: this.props.classes.root }}
            >
              {"Reset"}
              <PopupIcon
                color={theme.colors.background}
                iconType="reset"
                rotateDeg={this.state.rotateDeg}
                style={{ fontSize: 20, paddingLeft: "8px" }}
              />
            </Button>
          }
        />
      );
    }
  },
);

export default ResetButton;
