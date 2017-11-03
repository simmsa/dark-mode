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
      // for (const tab in tabs) {
      //   var thisTabId = tabs[tab].id;

      //   this.tree[thisTabId] = {};

      //   this.convertFrameIdsToParentUrls(thisTabId);
      // }
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
    const result = [];

    if (this.tree[tabId] === undefined) {
      return [];
    }

    const tabData = this.tree[tabId];
    console.log("tabData: ", tabData);

    // tslint:disable:forin
    for (const frameId in tabData) {
      const frameIdNumber = ParseIntBase10(frameId);
      result.push({
        frameId: frameIdNumber,
        parentUrls: this.getParentUrls(tabId, frameIdNumber),
      });
    }

    return result;
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
