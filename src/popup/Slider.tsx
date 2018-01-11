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
