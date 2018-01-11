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

import theme from "../theme";

interface RowProps {
  backgroundColor?: string;
  dividerColor?: string;
  left: any;
  right: any;
  wideLeft?: boolean;
  wideRight?: boolean;
  equalWidth?: boolean;
  flexHeight?: boolean;
  flexDirection?: string;
}

class Row extends React.Component<RowProps, {}> {
  public render() {
    // tslint:disable:no-magic-numbers
    type widthRange = 12 | 11 | 9 | 8 | 7 | 6 | 5 | 4 | 3 | 2 | 0;
    const maxWidth: widthRange = 12;
    const leftWidth: widthRange =
      this.props.right === undefined
        ? 11
        : this.props.wideLeft
          ? 9
          : this.props.wideRight ? 2 : this.props.equalWidth ? 6 : 5;
    const rightWidth: widthRange = (maxWidth - leftWidth) as widthRange;

    const bgColor = this.props.backgroundColor || theme.colors.background;
    const dividerColor =
      this.props.dividerColor || theme.colors.backgroundLight;

    const height = this.props.flexHeight
      ? {
          minHeight: "60px",
        }
      : { height: "60px" };

    return (
      <Grid
        container={true}
        direction="row"
        justify="space-between"
        alignItems="center"
        style={{
          backgroundColor: bgColor,
          borderBottom: `1px solid ${dividerColor}`,
          margin: 0,
          overflow: "visible",
          padding: 0,
          paddingLeft: "8px",
          paddingRight: "8px",
          width: "100%",
          zIndex: 1,
          ...height,
        }}
      >
        <Grid item={true} xs={leftWidth} style={{ paddingLeft: "12px" }}>
          <Grid
            container={true}
            direction="row"
            alignContent="center"
            justify="flex-start"
          >
            {this.props.left}
          </Grid>
        </Grid>
        <Grid xs={rightWidth as any} item={true}>
          <Grid
            container={true}
            direction="row"
            alignContent="center"
            justify={
              this.props.flexDirection === "normal" ? "flex-start" : "flex-end"
            }
            style={{
              paddingRight: "24px",
            }}
          >
            {this.props.right}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default Row;
