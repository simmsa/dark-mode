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
