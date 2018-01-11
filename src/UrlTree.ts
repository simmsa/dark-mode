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

import * as utils from "./utils";

// tslint:disable:no-console
class UrlTree {
  private tree: any;

  constructor() {
    this.tree = {};
    this.populate();
  }

  public populate(): void {
    chrome.tabs.query({}, tabs => {
      tabs.map((tab) => {

        const tabId = tab.id;
        if (tabId !== undefined) {
          this.tree[tabId] = {};

          this.convertFrameIdsToParentUrls(tabId);
        }

      });
    });
  }

  public addActiveTab(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const thisTabId = tabs[0].id;

      // Reset the tab with new frameIds.
      if (thisTabId !== undefined) {
        this.tree[thisTabId] = {};

        this.convertFrameIdsToParentUrls(thisTabId);
      }
    });
  }

  public updateTab(tabId: number, callback: any) {
    if (this.tree[tabId] === undefined) {
      this.tree[tabId] = {};
    }

    this.convertFrameIdsToParentUrls(tabId, callback);
  }

  public convertFrameIdsToParentUrls(thisTabId: number, callback?: any) {
    chrome.webNavigation.getAllFrames({ tabId: thisTabId }, frames => {
      if (frames) {
        frames.map((frame) => {
          const frameId = frame.frameId;
          this.tree[thisTabId][frameId] = {
            parentId: frame.parentFrameId,
            url: frame.url,
          };
        });
      }

      if (callback !== undefined) {
        callback();
      }
    });
  }

  // The structure here is really important for finding the nest level of an
  // iframe.
  // tabId: {
  //     frameId: {
  //         url,
  //         parentId,
  //     },
  //     frameId: {
  //         url,
  //         parentId,
  //     }, ...
  // }
  public add(url: string, parentUrl: string, tabId: number, frameId: number): void {
    if (this.tree[tabId] === undefined) {
      this.tree[tabId] = {};
    }

    console.log("Add:");
    console.log("url: " + url);
    console.log("parentUrl: " + parentUrl);

    if (frameId === 0) {
      this.tree[tabId][frameId] = {
        parentId: -1,
        url,
      };
    }

    // How do you find the parentId from the parentUrl
    const tabData = {};
    this.tree[tabId].map((frame) => {
      tabData[frame.url] = frame;
    });
    // for (var frame in this.tree[tabId]) {
    //   var frameUrl = this.tree[tabId][frame].url;
    //   tabData[frameUrl] = frame;
    // }

    this.tree[tabId][frameId] = {
      parentId: utils.ParseIntBase10(tabData[parentUrl]),
      url,
    };
  }

  public getParentUrls(tabId: number, frameId: number): string[] {
    let currentFrameId = frameId;
    let currentFrameLevel = 0;
    const maxLevel = 20;
    const parentUrls = [this.tree[tabId][frameId].url];
    while (
      !this.isBaseFrame(tabId, currentFrameId) &&
      currentFrameLevel < maxLevel
    ) {
      // Set the currentFrameId to the parentId of this frame,
      // getting one frame closer to the parent url
      // currentFrameId = this.tree[tabId][frameId].parentId
      currentFrameId = this.tree[tabId][currentFrameId].parentId;
      try {
        parentUrls.push(this.tree[tabId][currentFrameId].url);
      } catch (e) {
        if (e instanceof TypeError) {
          // pass
        }
      }
      currentFrameLevel++;
    }
    return parentUrls;
  }

  public getAllFrameData(tabId: number): any {
    const tabData = this.tree[tabId];
    console.log("tabData: ", tabData);

    if (tabData === undefined) {
      return [];
    }

    return Object.keys(tabData).map((key) => {
      const frameId = utils.ParseIntBase10(key);
      return {
        frameId,
        parentUrls: this.getParentUrls(tabId, frameId),
      };
    });
  }

  public isBaseFrame(tabId: number, frameId: number): boolean {
    const frameData = this.tree[tabId][frameId];

    // A base frame matches these characteristics:
    // frameId is 0
    // frame has no parent (undefined), more likely this is an abnormal
    // frame, but it IS a base frame
    // parentId is -1 (there is no parent)
    if (frameId === 0) {
      return true;
    }
    // This has to be checked before checking the parentId to avoid
    // accessing an element from undefined
    if (frameData === undefined) {
     return true;
    }
    if (frameData.parentId === -1) {
      return true;
    }

    return false;
  }

  public getParentUrl(tabId: number, frameId: number): string {
    const parentId = this.tree[tabId][frameId].parentId;
    return this.tree[tabId][parentId].url;
  }

  public print(): void {
    console.log(this.tree);
  }
}

export default UrlTree;
