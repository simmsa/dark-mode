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

import SettingId from "../SettingId";

import ResetButton from "./ResetButton";
import Slider from "./Slider";
import Switch from "./Switch";

interface UrlSettingsProps {
  urlDark: boolean;
  urlHue: boolean;
  urlContrast: number;
  title: string;
  identifier: string;
  tooltipValue: string;
}

// tslint:disable:max-line-length
class UrlSettings extends React.Component<UrlSettingsProps, {}> {
  public render() {
    return (
      <div>
        <Switch
          title="Dark Mode"
          tooltip="Invert the colors of the current web page."
          group={this.props.identifier}
          field={SettingId.Field.Dark}
          isChecked={this.props.urlDark}
          iconType="darkMode"
        />
        <Switch
          title="Fix Colors"
          tooltip="Invert the hue of all colors, attempting to make the page look 'normal'. Some rotated colors may seem off."
          group={this.props.identifier}
          field={SettingId.Field.Hue}
          isChecked={this.props.urlHue}
          isDisabled={!this.props.urlDark}
          iconType="hue"
        />
        <Slider
          field={SettingId.Field.Contrast}
          tooltip="Adjust the difference between dark and light colors"
          iconType="contrast"
          group={this.props.identifier}
          label="Contrast"
          min={SettingId.Default.ContrastMin}
          max={SettingId.Default.ContrastMax}
          value={this.props.urlContrast}
          isDisabled={!this.props.urlDark}
        />
        <ResetButton group={this.props.identifier} />
      </div>
    );
  }
}

export default UrlSettings;
