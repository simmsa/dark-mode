import * as React from "react";

import { withStyles, WithStyles } from "material-ui/styles";

import ButtonBase from "material-ui/ButtonBase";
import Grid from "material-ui/Grid";
import MaterialUiSwitch from "material-ui/Switch";

import Message from "../Message";

import theme from "../theme";

import { IconType } from "./PopupIcon";
import RowWithTooltip from "./RowWithTooltip";

// tslint:disable:no-string-literal
const styles = {
  bar: {
    backgroundColor: "#ffffff",
  },
  checked: {
    "& + $bar": {
      backgroundColor: theme.colors.primaryBackground,
    },
    "color": theme.colors.primary,
  },
  root: {
    right: "4px",
  },
};

interface SwitchProps {
  title: string;
  group: string;
  field: string;
  tooltip: string;
  isChecked: boolean;
  iconType: IconType;
  isDisabled?: boolean;
}

const Switch = withStyles(styles)(
  class extends React.Component<
    SwitchProps & WithStyles<"bar" | "checked" | "root">,
    {}
  > {
    constructor(props) {
      super(props);

      this.state = {
        toolTipIconDeg: 0,
        toolTipOpen: false,
      };

      this.sendToggleFieldMessage = this.sendToggleFieldMessage.bind(this);
    }

    private sendToggleFieldMessage() {
      if (!this.props.isDisabled) {
        Message.send(
          Message.Sender.Popup,
          Message.Receiver.Background,
          Message.Intent.ToggleField,
          {
            Field: this.props.field,
            Group: this.props.group,
          },
        );
      }
    }

    public render() {
      return (
        <RowWithTooltip
          label={this.props.title}
          iconType={this.props.iconType}
          labelIconColor={
            this.props.isChecked ? theme.colors.primary : theme.colors.disabled
          }
          tooltip={this.props.tooltip}
          isDisabled={this.props.isDisabled}
          rightComponent={
            <ButtonBase
              onClick={this.sendToggleFieldMessage}
              style={{ padding: 0, margin: 0, borderWidth: 0, width: "100%" }}
              disableRipple={true}
            >
              <Grid
                container={true}
                direction="row"
                alignContent="center"
                justify={"flex-end"}
              >
                <MaterialUiSwitch
                  disabled={this.props.isDisabled}
                  classes={{
                    bar: this.props.classes.bar,
                    checked: this.props.classes.checked,
                    root: this.props.classes.root,
                  }}
                  checked={this.props.isDisabled ? false : this.props.isChecked}
                />
              </Grid>
            </ButtonBase>
          }
        />
      );
    }
  },
);

export default Switch;
