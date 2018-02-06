import * as React from "react";

import Typography from "material-ui/Typography";

import theme from "../theme";

import Row from "./Row";

interface HeaderProps {
  versionString: string;
}

class Header extends React.Component<HeaderProps, {}> {
  public render() {
    return (
      <div>
        <img
          src="../img/dark-mode-logo-w-text.svg"
          alt="Dark Mode Logo"
          style={{
            margin: "0 auto",
            padding: "12px",
            paddingBottom: "0px",
            paddingTop: "24px",
            width: "90%",
          }}
        />
        <Row
          wideLeft={true}
          left={
            <Typography
              style={{
                color: "#ffffff",
                fontSize: "11px",
                letterSpacing: "0.7px",
                textTransform: "uppercase",
              }}
              type={"caption"}
            >
              Making the web easier to read
            </Typography>
          }
          right={
            <Typography
              style={{ color: theme.colors.primary }}
              type={"caption"}
            >
              {this.props.versionString}
            </Typography>
          }
          flexDirection="flex-end"
          shortRow={true}
        />
      </div>
    );
  }
}

export default Header;
