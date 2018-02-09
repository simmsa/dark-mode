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

import ContentSender from "./ContentSender";

class DarkModeContentManager {
  private parentUrl: string;
  private isDark: boolean;

  constructor() {
    this.requestState();
    this.updateAttributes();
    this.setParentUrl();
    this.setDarkAttribute("url", window.location);
    if (window.location !== window.parent.location) {
      this.setDarkAttribute("iframe", "true");
    } else {
      this.setDarkAttribute("iframe", "false");
      // Only send auto dark message from the parent page
      this.initAutoDarkEvent();
    }
    this.setIFramesDark();
    this.addIsDarkClassToElementsWithBackgroundImage();
  }

  private addIsDarkClassToElementsWithBackgroundImage() {
    const findAndMarkBGImages = () => {
      const divs = document.querySelectorAll("div");
      Object.keys(divs).map(divKey => {
        const div: HTMLDivElement = divs[divKey];
        const divStyle = window.getComputedStyle(div);
        const bgImage = divStyle.backgroundImage;
        if (bgImage && bgImage.match(/url.*jpg.*/i)) {
          div.classList.add("no-dark");
        }
      });
    };

    // Try to mark some background elements early to avoid inverted
    // bagckground images while the page is still loading css/js
    document.addEventListener("DOMContentLoaded", () => {
      findAndMarkBGImages();
    });

    // Mark the rest of the background images after css/js has loaded and
    // finished executing
    window.addEventListener("load", () => {
      findAndMarkBGImages();
    });
  }

  private setParentUrl() {
    // This is an empty string if this frame has no parent
    this.parentUrl = document.referrer;
  }

  private requestState(): void {
    ContentSender.sendUrl(document.URL, this.parentUrl);
  }

  private setDarkAttribute(newAttribute: string, value: any): void {
    let prefix = "data-dark-mode";
    if (newAttribute !== "") {
      prefix += "-";
    }

    document.documentElement.setAttribute(prefix + newAttribute, value);
  }

  private setIFramesDark() {
    // DOMFrameContentLoaded is the right event? but causes the background to
    // flicker when iframes are loaded/unloaded
    // document.addEventListener("DOMFrameContentLoaded", () => {
    document.addEventListener("DOMContentLoaded", () => {
      const iframes = document.querySelectorAll("iframe");
      Object.keys(iframes).map(iframeKey => {
        const iframe: HTMLIFrameElement = iframes[iframeKey];

        const darkModeActiveAttr: Attr = document.createAttribute(
          "data-dark-mode-active",
        );
        darkModeActiveAttr.value = "true";

        const darkModeIFrameAttr: Attr = document.createAttribute(
          "data-dark-mode-iframe",
        );
        darkModeIFrameAttr.value = "true";

        iframe.attributes.setNamedItem(darkModeActiveAttr);
        iframe.attributes.setNamedItem(darkModeIFrameAttr);
      });
    });
  }

  private initAutoDarkEvent(): void {
    // document.addEventListener("DOMContentLoaded", () => {
    //   ContentSender.sendCheckAutoDark(this.parentUrl, document.URL);
    // });
  }

  private updateAttributes(darkModeActive?: boolean) {
    if (typeof darkModeActive !== "undefined") {
      this.isDark = darkModeActive;
      if (darkModeActive) {
        this.setDarkAttribute("active", "true");
      } else {
        this.setDarkAttribute("active", "false");
      }
      return;
    } else if (this.isDark !== undefined) {
      this.setDarkAttribute("active", this.isDark);
      return;
    }
    this.setDarkAttribute("active", "true");
  }
}

// We add this to `window` so it can be accessed as a global variable from the
// background script to change the dark settings from the
// popup/keyboard/content menu
// @ts-ignore
window.darkModeContentManager = new DarkModeContentManager();
