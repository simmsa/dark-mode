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

import CssBuilder from "./CssBuilder";
import Icon from "./Icon";
import Url from "./Url";
import UrlSettings from "./UrlSettings";
import UrlTree from "./UrlTree";

// tslint:disable:no-console
class ContentAction {
  public static urlTree: UrlTree;
  public static urlSettings: UrlSettings;

  public static init(inputUrlTree: UrlTree, inputUrlSettings: UrlSettings) {
    ContentAction.urlTree = inputUrlTree;
    ContentAction.urlSettings = inputUrlSettings;
  }

  public static checkDarkMode(url: Url, tabId: number, frameId: number): void {
    const parentUrls = ContentAction.urlTree.getParentUrls(tabId, frameId);
    ContentAction.getStateForUrl(url, tabId, frameId, parentUrls);
  }

  public static checkDarkModeForActiveTab(url: Url): void {
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleDarkMode(url: Url): void {
    ContentAction.urlSettings.toggleDarkMode(url);
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleDarkModeStem(url: Url): void {
    ContentAction.urlSettings.toggleDarkModeStem(url);
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleHue(url: Url): void {
    ContentAction.urlSettings.toggleHueRotate(url);
    ContentAction.getStateForActiveTab(url);
  }

  public static toggleHueStem(url: Url): void {
    ContentAction.urlSettings.toggleHueRotateStem(url);
    ContentAction.getStateForActiveTab(url);
  }

  // This should only be called from anywhere but the content page, If this
  // is called from the content page some insane amount of function calls
  // would happen
  public static getStateForActiveTab(url: Url) {
    chrome.tabs.query({ active: true, currentWindow: true }, tab => {
      console.log("tab: ", tab);
      // Frame id of 0 is the base frame
      const tabId = tab[0].id;

      if (tabId !== undefined) {
        ContentAction.urlTree.updateTab(tabId, () => {
          const frameData: Array<{
            frameId: number;
            parentUrls: any;
          }> = ContentAction.urlTree.getAllFrameData(tabId);
          if (frameData !== undefined) {
            frameData.map(frame => {
              ContentAction.getStateForUrl(
                url,
                tabId,
                frame.frameId,
                frame.parentUrls,
                // frameData[frame].frameId,
                // frameData[frame].parentUrls,
              );
            });
          }
        });
      }
    });
  }

  public static getStateForUrl(
    url: Url,
    tabId: number,
    frameId: number,
    parentUrls: string[],
  ) {
    let isIFrame = false;
    console.log(parentUrls);
    let urlState;
    if (parentUrls.length <= 1) {
      urlState = ContentAction.urlSettings.getUrlState(url);
    } else {
      // Determine what css settings should be sent to the current frame
      // based on parent frame settings
      urlState = ContentAction.urlSettings.getFrameState(parentUrls.reverse());
      isIFrame = true;
    }

    if (urlState !== undefined) {
      ContentAction.handleDataForTab(urlState, tabId, frameId, isIFrame);
    }
  }

  public static handleDataForTab(
    state: {
      Dark: boolean;
      Hue: boolean;
      Contrast: number;
      BaseFrameIsDark?: boolean;
    },
    tabId: number,
    frameId: number,
    isIFrame: boolean,
  ) {
    if (!isIFrame) {
      if (state.Dark) {
        Icon.turnOn();
      } else {
        Icon.turnOff();
      }
    }

    let cssString;
    if (isIFrame) {
      cssString = CssBuilder.buildForIFrame(
        state.Dark,
        state.Hue,
        CssBuilder.iFrameContrast,
        state.BaseFrameIsDark,
      );
      // The state that we get for iframes has to do with how many
      // levels they are embedded within the parent page, but the
      // javascript just needs to tell the frame that it is dark. This
      // passes dark to the js so html[data-dark-mode-active="true"]
      state.Dark = state.BaseFrameIsDark ? true : false;
      // if (state.BaseFrameIsDark) {
      //   state.Dark = true;
      // } else {
      //   state.Dark = false;
      // }
    } else {
      cssString = CssBuilder.buildForBaseFrame(
        state.Dark,
        state.Hue,
        state.Contrast,
      );
    }

    const jsString = ContentAction.buildJsString(state.Dark);
    console.log("Iframe: " + isIFrame + ", Css: " + cssString);

    ContentAction.updateContentPage(jsString, cssString, tabId, frameId);
  }

  private static buildJsString(Dark: boolean) {
    if (Dark === false) {
      return `window.darkModeContentManager.deactivateDarkMode()`;
    }
    return `window.darkModeContentManager.activateDarkMode()`;
  }

  private static passError(error: string, passableErrors: string[]) {
    for (const x in passableErrors) {
      if (error.indexOf(passableErrors[x]) !== -1) {
        return true;
      }
    }
    return false;
  }

  private static parseErrors() {
    const errorsToCatch = ["No frame with id", "Cannot access contents of url"];

    if (chrome.runtime.lastError) {
      const error = chrome.runtime.lastError.message;
      if (error !== undefined) {
        if (!ContentAction.passError(error, errorsToCatch)) {
          console.log(error);
        }
      }
    }
  }

  private static updateContentPage(
    jsString: string,
    cssString: string,
    tabId: number,
    frameId: number,
  ) {
    if (jsString.length > 0) {
      chrome.tabs.executeScript(
        tabId,
        {
          allFrames: true,
          code: jsString,
          frameId,
          matchAboutBlank: true,
          runAt: "document_start",
        },
        ContentAction.parseErrors,
      );
    }

    if (cssString.length > 0) {
      chrome.tabs.insertCSS(
        tabId,
        {
          allFrames: true,
          code: cssString,
          frameId,
          matchAboutBlank: true,
          runAt: "document_start",
        },
        ContentAction.parseErrors,
      );
    }
  }
}

export default ContentAction;
