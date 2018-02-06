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

interface FooterProps {
  versionString: string;
}

interface FooterState {
  kbInUse: number;
}

class Footer extends React.Component<FooterProps, FooterState> {
  constructor(props) {
    super(props);

    this.state = {
      kbInUse: 0,
    };

    this.checkBytesInUse = this.checkBytesInUse.bind(this);
    this.formatStorageRemaining = this.formatStorageRemaining.bind(this);
  }

  private convertBytesToKb(bytes: number) {
    const bytesPerKb = 1024;
    return Math.floor(bytes / bytesPerKb);
  }

  private checkBytesInUse() {
    chrome.storage.local.getBytesInUse("urlInfo", (bytesInUse: number) => {
      this.setState(prevState => {
        return {
          ...prevState,
          kbInUse: this.convertBytesToKb(bytesInUse),
        };
      });
    });
  }

  private formatStorageRemaining(type: "percentage" | "ratio"): string {
    if (this.state.kbInUse === 0) {
      return "?";
    }

    const currentKb = this.state.kbInUse;
    const maxKb = this.convertBytesToKb(chrome.storage.local.QUOTA_BYTES);
    const ratioToPercent = 100;
    const percentDigits = 2;
    const percent = (currentKb / maxKb * ratioToPercent).toPrecision(
      percentDigits,
    );
    const kbLabel = "KiB";

    switch (type) {
      case "percentage":
        return `${percent}%`;
      case "ratio":
        return `${currentKb}${kbLabel} / ${maxKb}${kbLabel}`;
    }
  }

  public componentWillMount() {
    this.checkBytesInUse();
  }

  public render() {
    const fontColor = "#CCCCCC";
    return (
      <div>
        <Grid
          style={{ padding: "8px", paddingTop: "16px" }}
          direction="row"
          justify="center"
          alignItems="center"
          container={true}
        >
          <Typography style={{ fontColor, fontSize: 20 }}>
            {`Dark Mode ${this.props.versionString}`}
          </Typography>
        </Grid>
        <Grid
          style={{ padding: "8px" }}
          direction="row"
          justify="center"
          alignItems="center"
          container={true}
        >
          <Typography
            style={{ fontColor, fontSize: 12 }}
            title={this.formatStorageRemaining("ratio")}
          >
            {`Using ${this.formatStorageRemaining(
              "percentage",
            )} of local storage capacity!`}
          </Typography>
        </Grid>
        <Grid
          style={{ padding: "8px" }}
          direction="row"
          justify="center"
          alignItems="center"
          container={true}
        >
          <Typography style={{ fontColor, fontSize: 12 }}>
            &copy; {`2015 - ${new Date().getFullYear()} Andrew Simms`}
          </Typography>
        </Grid>
      </div>
    );
  }
}

export default Footer;
