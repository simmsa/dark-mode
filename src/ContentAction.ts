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
    chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
      console.log("tab: ", tab);
      // Frame id of 0 is the base frame
      const tabId = tab[0].id;

      if (tabId !== undefined) {
          ContentAction.urlTree.updateTab(tabId, () => {
            const frameData = ContentAction.urlTree.getAllFrameData(tabId);
            console.log(frameData);
            if (frameData !== undefined) {
              frameData.map((frame) => {
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
      },
    );
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
        state.Contrast,
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
    return `
            window.darkModeContentManager.updateAttributes(${Dark});
        `;
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
          frameId,
          code: jsString,
          allFrames: true,
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
          frameId,
          code: cssString,
          allFrames: true,
          matchAboutBlank: true,
          runAt: "document_start",
        },
        ContentAction.parseErrors,
      );
    }
  }
}

export default ContentAction;
