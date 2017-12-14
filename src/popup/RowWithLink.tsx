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
