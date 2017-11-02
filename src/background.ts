import BackgroundReceiver from "./BackgroundReceiver";
import ContentAction from "./ContentAction";
import GlobalSettings from "./GlobalSettings";
import State from "./State";
import Url from "./Url";
import UrlSettings from "./UrlSettings";
import UrlTree from "./UrlTree";

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

const currentUrl = new Url();

const urlTree = new UrlTree();
const state = new State();
ContentAction.init(urlTree, urlSettings);

BackgroundReceiver.init(
  urlTree,
  currentUrl,
  urlSettings,
  globalSettings,
  state,
);

currentUrl.update(() => {
  createToggleStemContextMenu();
  state.update(currentUrl, urlSettings, globalSettings, () => {return; });
});

// End Main --------------------------------------------------------------- }}}
