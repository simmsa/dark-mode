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

import Switch from "./Switch";

interface GlobalSettingsProps {
  globalDark: boolean;
  globalAutoDark: boolean;
  globalShowNotifications: boolean;
  globalLogAutoDark: boolean;
  globalHue: boolean;
  globalContrast: number;
  keyboardShortcut: string;
}

// tslint:disable:max-line-length
class GlobalSettings extends React.Component<GlobalSettingsProps, {}> {
  public render() {
    return (
      <div>
        <Switch
          title="Dark Mode"
          group={SettingId.Group.Global}
          field={SettingId.Field.Dark}
          isChecked={this.props.globalDark}
          iconType="darkMode"
          tooltip="Toggle dark mode globally"
        />
        <Switch
          title="Fix Colors"
          group={SettingId.Group.Global}
          field={SettingId.Field.Hue}
          isChecked={this.props.globalHue}
          isDisabled={!this.props.globalDark}
          iconType="hue"
          tooltip="Invert the hue of all colors, attempting to make the page look 'normal'. Some rotated colors may seem off."
        />
      </div>
    );
  }
}

// <Switch
//   title="Auto Dark"
//   group={SettingId.Group.Global}
//   field={SettingId.Field.AutoDark}
//   isChecked={this.props.globalAutoDark}
//   iconType="autoDark"
//   tooltip="Automatically check each site and turn off dark mode on sites with dark themes"
// />
// <Switch
//   title="Log Auto Dark"
//   group={SettingId.Group.Global}
//   field={SettingId.Field.LogAutoDark}
//   isChecked={this.props.globalLogAutoDark}
//   iconType="log"
//   tooltip="Log auto dark actions"
// />
// <Switch
//   title="Notifications"
//   group={SettingId.Group.Global}
//   field={SettingId.Field.ShowNotifications}
//   isChecked={this.props.globalShowNotifications}
//   iconType="notifications"
//   tooltip="Show notifications for auto dark actions"
// />

export default GlobalSettings;
