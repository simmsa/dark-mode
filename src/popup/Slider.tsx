import * as React from "react";

import Grid from "material-ui/Grid";
import IconButton from "material-ui/IconButton";
import Typography from "material-ui/Typography";

// tslint:disable:no-var-requires
const Color = require("color");

import Message from "../Message";

import theme from "../theme";

import PopupIcon, {IconType} from "./PopupIcon";
import RowWithTooltip from "./RowWithTooltip";

interface SliderProps {
  label: string;
  iconType: IconType;
  tooltip: string;
  field: string;
  group: string;
  value: number;
  min: number;
  max: number;
  isDisabled?: boolean;
}

interface SliderState {
  sliderValue: number;
}

class Slider extends React.Component<SliderProps, SliderState> {
  private incrementStep = 5;

  constructor(props) {
    super(props);

    this.sendValueUpdate = this.sendValueUpdate.bind(this);
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.setSliderValue = this.setSliderValue.bind(this);

    this.state = {
      sliderValue: 85,
    };
  }

  private sendValueUpdate(nextValue: number) {
    Message.send(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ChangeField,
      {
        Field: this.props.field,
        Group: this.props.group,
        Value: nextValue,
      },
    );
  }

  private increment() {
    if (this.props.value < this.props.max) {
      const nextVal = this.props.value + this.incrementStep;
      this.setSliderValue(nextVal);
      this.sendValueUpdate(nextVal);
    }
  }

  private decrement() {
    if (this.props.value > this.props.min) {
      const nextVal = this.props.value - this.incrementStep;
      this.setSliderValue(nextVal);
      this.sendValueUpdate(nextVal);
    }
  }

  private setSliderValue(val: number) {
    if (!this.props.isDisabled) {
      this.setState((prevState: SliderState) => {
        return {
          ...prevState,
          sliderValue: val,
        };
      });
    }
  }

  public componentWillReceiveProps(nextProps: SliderProps) {
    if (nextProps.value !== this.state.sliderValue) {
      this.setSliderValue(nextProps.value);
    }
  }

  public render() {
    return (
      <RowWithTooltip
        label={this.props.label}
        iconType={this.props.iconType}
        labelIconColor={Color(theme.colors.primary)
          .whiten(this.state.sliderValue)
          .hex()
          .toString()}
        tooltip={this.props.tooltip}
        isDisabled={this.props.isDisabled}
        rightComponent={
          <Grid
            direction="row"
            container={true}
            alignItems="center"
            justify="flex-end"
          >
            <IconButton onClick={this.decrement}>
              <PopupIcon iconType="subtract" />
            </IconButton>
            <Typography type="subheading">{`${this.props.value}%`}</Typography>
            <IconButton onClick={this.increment}>
              <PopupIcon iconType="add" />
            </IconButton>
          </Grid>
        }
      />
    );
  }
}

export default Slider;
