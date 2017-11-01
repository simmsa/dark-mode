import * as resemble from "resemblejs";

import AutoDark from "./AutoDark";
import BackgroundReceiver from "./BackgroundReceiver";
import ContentAction from "./ContentAction";
import GlobalSettings from "./GlobalSettings";
import State from "./State";
import Url from "./Url";
import UrlSettings from "./UrlSettings";
import UrlTree from "./UrlTree";

// tslint:disable:max-classes-per-file
// tslint:disable:object-literal-sort-keys
// tslint:disable:no-console
// Browser Action ---------------------------------------------------------- {{{

function deactivateBrowserAction() {
  if (debug) {
    console.log("Deactivating browser action!");
  }
  chrome.tabs.getSelected(null, (tab) => {
    chrome.browserAction.disable(tab.id);
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-inactive-19.png",
        38: "img/dark-mode-inactive-38.png",
      },
      tabId: tab.id,
    });
  });
}

function activateBrowserAction() {
  if (debug) {
    console.log("Activating browser action!");
  }
  chrome.tabs.getSelected(null, (tab) => {
    chrome.browserAction.enable(tab.id);
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-on-19.png",
        38: "img/dark-mode-on-38.png",
      },
      tabId: tab.id,
    });
  });
}

// End Browser Action ------------------------------------------------------ }}}
// Listen for Keystrokes --------------------------------------------------- {{{

chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case "toggle-dark-mode":
      if (debug) {
        console.log("Keyboard Shortcut caught");
      }
      ContentAction.toggleDarkMode(currentUrl);
      break;
  }
});

// End Listen for Keystrokes ----------------------------------------------- }}}
// AutoDark Class ---------------------------------------------------- {{{

class AutoDark {
  private static brightnessThreshold = 50;
  private static runInterval = 1000; // ms
  private static stemRunInterval = 10000; // ms

  // I can't find the cause, but something causes many of these functions
  // to run multiple times. To fix this, function execution times are
  // tracked below and functions are ran through the `throttle` function
  // to determine if they should execute again based on their previous
  // execution time.
  private static lastIsCorrectNotification = Date.now();
  private static lastStemNotification = Date.now();
  private static lastRun = Date.now();
  private static ResembleLastRun = Date.now();
  private static lastCheck = Date.now();

  // Number of sites UrlSettings checks before it marks a stem as dark
  public static MinDarkSites = 5;

  public check(url: Url, urlSettings: UrlSettings, lightCallback: () => void): void {
    if (
      url.getShouldAutoDark() &&
      urlSettings.checkDarkModeIsUndefined(url) &&
      urlSettings.checkDarkModeStemIsUndefined(url) &&
      globalSettings.checkAutoDark() &&
      !AutoDark.throttle(AutoDark.lastCheck, AutoDark.runInterval) &&
      !urlSettings.getCheckedAutoDark(url)
    ) {
      AutoDark.measureBrightnessOfCurrentTab(
        url,
        urlSettings,
        AutoDark.parseBrightness,
      );
      AutoDark.lastCheck = Date.now();
    }
  }

  public static measureBrightnessOfCurrentTab(
    url: Url,
    urlSettings: UrlSettings,
    brightnessCallback: (Url, number) => void,
  ) {
    // captureVisibleTab cannot capture screenshots of background tabs
    // so the url we are checking must match the current url
    if (
      currentUrl.getFull() === url.getFull() &&
      !AutoDark.throttle(AutoDark.ResembleLastRun, AutoDark.runInterval)
    ) {
      chrome.tabs.captureVisibleTab(screenshot => {
        resemble(screenshot).onComplete(data => {
          urlSettings.setCheckedAutoDark(url);
          AutoDark.ResembleLastRun = Date.now();
          brightnessCallback(url, data.brightness);
        });
      });
    }
  }

  public static throttle(lastRun: number, interval: number) {
    if (Date.now() < interval + lastRun) {
      return true;
    }
    return false;
  }

  public static parseBrightness(url: Url, brightness: number) {
    // If the page is light, toggle the page to darkness
    if (
      brightness > AutoDark.brightnessThreshold &&
      !AutoDark.throttle(AutoDark.lastRun, AutoDark.runInterval)
    ) {
      ContentAction.toggleDarkMode(url);
      AutoDark.startNotifications(url);
    }
    AutoDark.lastRun = Date.now();
  }

  public static startNotifications(url: Url) {
    if (globalSettings.checkShowNotifications()) {
      AutoDark.pageLooksCorrectNotification(url);
    }
  }

  public static pageLooksCorrectNotification(url: Url) {
    if (
      !AutoDark.throttle(
        AutoDark.lastIsCorrectNotification,
        AutoDark.runInterval,
      )
    ) {
      AutoDark.lastIsCorrectNotification = Date.now();
      chrome.notifications.create(
        "",
        {
          type: "basic",
          iconUrl: "img/dark-mode-on-128.png",
          title: "Dark Mode",
          message: "Does this page look right?",
          buttons: [{ title: "Yes" }, { title: "No" }],
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((
            notifId,
            buttonIndex,
            ) => {
            // Yes Click
            if (buttonIndex === 0) {
              chrome.notifications.clear(notifId);
              AutoDark.toggleStemNotification();
            }

            // No Click
            if (buttonIndex === 1) {
              console.log("No Click!");
              ContentAction.toggleDarkMode(url);
              chrome.notifications.clear(notifId);
            }
          });
        },
      );
    }
  }

  public static toggleStemNotification() {
    if (
      !AutoDark.throttle(
        AutoDark.lastStemNotification,
        AutoDark.stemRunInterval,
      )
    ) {
      AutoDark.lastStemNotification = Date.now();
      chrome.notifications.create(
        "",
        {
          type: "basic",
          iconUrl: "img/dark-mode-on-128.png",
          title: "Dark Mode",
          message:
            "Turn off dark mode for all " + currentUrl.getDomain() + " urls?",
          buttons: [{ title: "Yes" }, { title: "No" }],
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((
            notifId,
            buttonIndex,
            ) => {
            // Yes Click
            if (buttonIndex === 0) {
              ContentAction.toggleDarkModeStem(currentUrl);
              chrome.notifications.clear(notifId);
            } else {
              chrome.notifications.clear(notifId);
            }
          });
        },
      );
    }
  }
}

// End AutoDark Class ------------------------------------------------ }}}
// Icon --------------------------------------------------------------- {{{

class Icon {
  public static turnOn() {
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-on-19.png",
        38: "img/dark-mode-on-38.png",
      },
    });
  }

  public static turnOff() {
    chrome.browserAction.setIcon({
      path: {
        19: "img/dark-mode-off-19.png",
        38: "img/dark-mode-off-38.png",
      },
    });
  }
}

//  End Icon ----------------------------------------------------------- }}}
// Context (Right Click) Menus --------------------------------------------- {{{

// Setup Basic Toggle context menu
function createToggleDarkModeContextMenu() {
  chrome.contextMenus.create({
    id: "toggleDarkMode",
    title: "Toggle Dark Mode",
    onclick: () => {
      ContentAction.toggleDarkMode(currentUrl);
    },
    contexts: ["all"],
  });
}
createToggleDarkModeContextMenu();

// For the Toggle stem menu item to have the current url within the menu
// text the context menu must first be created (`chrome.contextMenus.create`)
// and then updated on when the tab or window changes.
//
// Choosing what events update this menu is tricky. There is no definitive
// one tab event or window event that satifies a window or tab "change".
// Therefore multiple events are listening to call the
// `updateContextMenuAndBrowserAction` function. That function is rate limited
// by waiting at least 10ms to call `context.contextMenus.update`.
//
// There is probably a better way to do this, but this works for now.

function createToggleStemContextMenu() {
  chrome.contextMenus.create({
    id: "toggleStemFromContextMenu",
    title: "Toggle Dark Mode for all " + currentUrl.getDomain() + " urls",
    onclick: () => {
      ContentAction.toggleDarkModeStem(currentUrl);
    },
    contexts: ["all"],
  });
}

let updateContextMenuToggleUrlStemTimestamp = Date.now();
const updateIntervalMs = 10;

let showContextMenus = true;
let contextMenusRemoved = false;

function updateContextMenuAndBrowserAction() {
  // My solution to rate limit changing this too often
  // If one of the events triggers this function don't do it again for
  // `updateIntervalMs` milliseconds.
  if (Date.now() > updateContextMenuToggleUrlStemTimestamp + updateIntervalMs) {
    currentUrl.update(() => {
      if (currentUrl.getShouldUpdateMenu()) {
        if (showContextMenus) {
          // Update the relevant context menus
          chrome.contextMenus.update("toggleStemFromContextMenu", {
            title:
              "Toggle Dark Mode for all " + currentUrl.getDomain() + " urls",
          });
        } else {
          // Create all context menus and browser action
          showContextMenus = true;
          createToggleDarkModeContextMenu();
          createToggleStemContextMenu();
          activateBrowserAction();
          contextMenusRemoved = false;
        }
      } else {
        // Remove both context menus and browser action
        showContextMenus = false;
        if (!contextMenusRemoved) {
          deactivateBrowserAction();
          chrome.contextMenus.remove("toggleDarkMode");
          chrome.contextMenus.remove("toggleStemFromContextMenu");
          contextMenusRemoved = true;
        }
      }
    });
    updateContextMenuToggleUrlStemTimestamp = Date.now();
  }
}

// End Context (Right Click) Menus ----------------------------------------- }}}
// Context Menu Events ----------------------------------------------------- {{{

chrome.tabs.onHighlighted.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.tabs.onUpdated.addListener(() => {
  updateContextMenuAndBrowserAction();
});
chrome.tabs.onActivated.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.windows.onCreated.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.windows.onFocusChanged.addListener(() => {
  updateContextMenuAndBrowserAction();
});

chrome.contextMenus.onClicked.addListener(() => {
  updateContextMenuAndBrowserAction();
});

// End Context Menu Events ------------------------------------------------- }}}
//  Utils ---------------------------------------------------------------{{{

const ParseIntBase10 = (input: string): number => {
  const base = 10;
  return parseInt(input, base);
};

//  End Utils -----------------------------------------------------------}}}
// Main ------------------------------------------------------------------- {{{

const debug = false;
const startupTimeout = 5;

setTimeout(() => {
  updateContextMenuAndBrowserAction();
  if (debug) {
    console.log("Hello from Typescript!");
  }
}, startupTimeout);

const globalSettings = new GlobalSettings();
const urlSettings = new UrlSettings();
const autoDark = new AutoDark(globalSettings);

const currentUrl = new Url();

const urlTree = new UrlTree();

BackgroundReceiver.init(urlTree);
ContentAction.init(urlTree, urlSettings);

const state = new State();

currentUrl.update(() => {
  createToggleStemContextMenu();
  state.update(currentUrl, urlSettings, globalSettings, function() {});
});

// End Main --------------------------------------------------------------- }}}
