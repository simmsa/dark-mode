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
