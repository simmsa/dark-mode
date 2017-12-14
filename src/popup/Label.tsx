import * as React from "react";

import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";

import PopupIcon, { IconType } from "./PopupIcon";

interface LabelProps {
  children: string;
  iconType: IconType;
  hasTooltip?: boolean;
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
          {`${this.props.children}:`}
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
