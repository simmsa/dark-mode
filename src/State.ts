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

import DefaultState from "./DefaultState";
import GlobalSettings from "./GlobalSettings";
import Url from "./Url";
import UrlSettings from "./UrlSettings";

class State extends DefaultState {
  public update(
    url: Url,
    settings: UrlSettings,
    globalSettings: GlobalSettings,
    callback: () => void,
  ): void {
    this.urlFull = url.getNormal();
    this.urlStem = url.getDomain();

    this.currentUrlDark = settings.checkDarkMode(url);
    this.currentUrlHue = settings.checkHueRotate(url);
    this.currentUrlContrast = settings.getContrast(url);

    // Stem Url Settings
    this.stemUrlDark = settings.checkDarkModeStem(url);
    this.stemUrlHue = settings.checkHueRotateStem(url);
    this.stemUrlContrast = settings.getContrastStem(url);

    // Global Dark Mode Settings
    this.globalDark = globalSettings.checkDark();
    this.globalAutoDark = globalSettings.checkAutoDark();
    this.globalLogAutoDark = globalSettings.checkLogAutoDark();
    this.globalShowNotifications = globalSettings.checkShowNotifications();
    this.globalHue = globalSettings.checkHue();
    this.globalContrast = globalSettings.getContrast();
    this.updateKeyboardShortcut(callback);
  }

  public updateKeyboardShortcut(callback: () => void) {
    chrome.commands.getAll(commands => {
      // tslint:disable:no-string-literal
      this.globalKeyboardShortcut = commands[1]["shortcut"] || "undefined";
      callback();
    });
  }
}

export default State;
