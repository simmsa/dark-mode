import * as React from "react";

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";

interface FooterState {
  kbInUse: number;
}

class Footer extends React.Component<{}, FooterState> {
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
    const percent = Math.floor(currentKb / maxKb);
    const kbLabel = "KiB";

    switch (type) {
      case "percentage":
        return `${percent}%`;
      case "ratio":
        return `${currentKb}${kbLabel}/${maxKb}${kbLabel}`;
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
            {`Dark Mode v${chrome.runtime.getManifest().version}`}
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
