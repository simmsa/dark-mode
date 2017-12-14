import * as React from "react";

import ButtonBase from "material-ui/ButtonBase";
import Icon from "material-ui/Icon";

import MaterialUiCollapse from "material-ui/transitions/Collapse";

import { muiTheme } from "./index";

import theme from "../theme";

import Label from "./Label";
import { IconType } from "./PopupIcon";
import Row from "./Row";

interface CollapseProps {
  children: any;
  iconType: IconType;
  isOpen?: boolean;
  text: string;
}

interface CollapseState {
  isOpen: boolean;
  rotateDeg: number;
}

class Collapse extends React.Component<CollapseProps, CollapseState> {
  private rotateIncrement = 180;
  constructor(props) {
    super(props);
    this.state = {
      isOpen: props.isOpen || false,
      rotateDeg: props.isOpen === true ? this.rotateIncrement : 0,
    };

    this.toggleCollapse = this.toggleCollapse.bind(this);
  }

  private toggleCollapse() {
    this.setState(prevState => {
      return {
        isOpen: !prevState.isOpen,
        rotateDeg: prevState.rotateDeg + this.rotateIncrement,
      };
    });
  }

  public render() {
    return (
      <div>
        <ButtonBase
          onClick={this.toggleCollapse}
          style={{
            margin: 0,
            padding: 0,
            width: "100%",
          }}
        >
          <Row
            backgroundColor={theme.colors.backgroundLight}
            dividerColor={theme.colors.backgroundLight}
            wideLeft={true}
            left={
              <Label iconType={this.props.iconType}>{this.props.text}</Label>}
            right={
              <Icon
                style={{
                  transform: `rotate(${this.state.rotateDeg}deg)`,
                  transition: muiTheme.transitions.create("transform", {
                    duration: muiTheme.transitions.duration.standard,
                  }),
                }}
              >
                expand_more
              </Icon>
            }
          />
        </ButtonBase>
        <MaterialUiCollapse in={this.state.isOpen}>
          {this.props.children}
        </MaterialUiCollapse>
      </div>
    );
  }
}

export default Collapse;
