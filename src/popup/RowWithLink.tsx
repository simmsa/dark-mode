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

import Row from "./Row";

import PopupIcon, { IconType } from "./PopupIcon";

interface RowWithLinkProps {
  text: string;
  link: string;
  linkText: string;
  iconType: IconType;
}

// tslint:disable:no-magic-numbers
class RowWithLink extends React.Component<RowWithLinkProps, {}> {
  public render() {
    return (
      <a
        href={this.props.link}
        title={this.props.link}
        style={{ textDecoration: "none" }}
        target="_blank"
      >
        <Row
          wideRight={true}
          flexHeight={true}
          flexDirection="normal"
          left={<PopupIcon iconType={this.props.iconType} />}
          right={
            <Grid
              style={{
                height: "60px",
              }}
              container={true}
              direction="row"
              alignItems="center"
              justify="space-between"
            >
              <Grid item={true} xs={10}>
                <Typography>
                  {this.props.text}
                  {this.props.linkText}
                </Typography>
              </Grid>
              <Grid item={true} xs={2} alignItems="flex-end">
                <PopupIcon iconType="rightArrow" style={{ fontSize: 30 }} />
              </Grid>
            </Grid>
          }
        />
      </a>
    );
  }
}

export default RowWithLink;
