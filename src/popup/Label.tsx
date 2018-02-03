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

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";

import PopupIcon, { IconType } from "./PopupIcon";

interface LabelProps {
  children: string;
  iconType: IconType;
  hasTooltip?: boolean;
  hasSemicolon?: boolean;
  iconRotateDeg?: number;
  iconColor?: string;
  tooltipRotateDeg?: number;
}

class Label extends React.PureComponent<LabelProps, {}> {
  public render() {
    return (
      <Grid
        container={true}
        direction="row"
        style={{ height: "60px" }}
        alignItems="center"
      >
        <PopupIcon
          iconType={this.props.iconType}
          style={{ marginLeft: "8px" }}
          rotateDeg={this.props.iconRotateDeg}
          color={this.props.iconColor}
        />
        <Typography style={{ marginLeft: "8px", marginRight: "8px" }}>
          {`${this.props.children}${
            this.props.hasSemicolon !== false ? ":" : ""
          }`}
        </Typography>
        {this.props.hasTooltip ? (
          <PopupIcon
            iconType={"tooltip"}
            isSmall={true}
            rotateDeg={this.props.tooltipRotateDeg}
          />
        ) : null}
      </Grid>
    );
  }
}

export default Label;
