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

import SettingId from "./SettingId";

export default class DefaultState {
  // Url Strings
  public urlFull = "about:blank";
  public urlStem = "about:blank";

  // Current Url Settings
  public currentUrlDark = SettingId.Default.Dark;
  public currentUrlHue = SettingId.Default.Hue;
  public currentUrlContrast = SettingId.Default.Contrast;

  // Stem Url Settings
  public stemUrlDark = SettingId.Default.Dark;
  public stemUrlHue = SettingId.Default.Hue;
  public stemUrlContrast = SettingId.Default.Contrast;

  // Global Dark Mode Settings
  public globalDark = SettingId.Default.Dark;
  public globalAutoDark = SettingId.Default.AutoDark;
  public globalLogAutoDark = SettingId.Default.LogAutoDark;
  public globalShowNotifications = SettingId.Default.ShowNotifications;
  public globalHue = SettingId.Default.Hue;
  public globalContrast = SettingId.Default.Contrast;
  public globalKeyboardShortcut = "init";

  public pack(): any {
    const result = {};

    // Current Url
    result[SettingId.Group.CurrentUrl] = {};
    result[SettingId.Group.CurrentUrl][SettingId.Field.Url] = this.urlFull;
    result[SettingId.Group.CurrentUrl][
      SettingId.Field.Dark
    ] = this.currentUrlDark;
    result[SettingId.Group.CurrentUrl][
      SettingId.Field.Hue
    ] = this.currentUrlHue;
    result[SettingId.Group.CurrentUrl][
      SettingId.Field.Contrast
    ] = this.currentUrlContrast;

    // Stem Url
    result[SettingId.Group.StemUrl] = {};
    result[SettingId.Group.StemUrl][SettingId.Field.UrlStem] = this.urlStem;
    result[SettingId.Group.StemUrl][SettingId.Field.Dark] = this.stemUrlDark;
    result[SettingId.Group.StemUrl][SettingId.Field.Hue] = this.stemUrlHue;
    result[SettingId.Group.StemUrl][
      SettingId.Field.Contrast
    ] = this.stemUrlContrast;

    // Global
    result[SettingId.Group.Global] = {};
    result[SettingId.Group.Global][SettingId.Field.Dark] = this.globalDark;
    result[SettingId.Group.Global][
      SettingId.Field.AutoDark
    ] = this.globalAutoDark;
    result[SettingId.Group.Global][
      SettingId.Field.LogAutoDark
    ] = this.globalLogAutoDark;
    result[SettingId.Group.Global][
      SettingId.Field.ShowNotifications
    ] = this.globalShowNotifications;
    result[SettingId.Group.Global][SettingId.Field.Hue] = this.globalHue;
    result[SettingId.Group.Global][
      SettingId.Field.Contrast
    ] = this.globalContrast;
    result[SettingId.Group.Global][
      SettingId.Field.Shortcut
    ] = this.globalKeyboardShortcut;

    return result;
  }
}
