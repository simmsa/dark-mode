// Whitelist Functions ----------------------------------------------------- {{{
/**
 * toggleOrCheckWhitelist manages the whitelist data structure and returns
 * the boolean result of a search for a url
 *
 * The whitelist is formatted with the first level keys as "url stems"
 * and the second level as sub urls, both with options for dark-mode
 * and advanced dark mode.
 *
 * { "whitelist": "urlStem":
 *   { "dark-mode": true,
 *     "advanced-mode": false,
 *     "fullUrl": {
 *       "dark-mode": true,
 *       "advanced-mode": false
 *     },
 *     "fullUrl": {
 *       "dark-mode": true,
 *       "advanced-mode": false
 *     }
 *   }
 * }
 *
 * checkWhitelist first checks if the url stem exists, the mode of the stem, then if necessary the full url and the mode
 *
 * @param {Object} whitelist The whitelist pulled from chrome storage
 * @param {String} url The current raw url
 * @return [{Whitelist}, {Boolean}] Result of whitelist search for url
 */
function checkWhitelist(whitelist, url, field) {
    var result;
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    var cleanedUrl = cleanUrl(url);
    if (objExists(whitelist[urlStem])) {
        if (objExists(whitelist[urlStem][cleanedUrl])) {
            if (objExists(whitelist[urlStem][cleanedUrl][field])) {
                result = whitelist[urlStem][cleanedUrl][field];
            }
        }
    }
    return result;
}
function checkWhitelistStem(whitelist, url, field) {
    var result;
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    if (objExists(whitelist[urlStem])) {
        if (objExists(whitelist[urlStem][field])) {
            result = whitelist[urlStem][field];
        }
    }
    return result;
}
function checkDarkMode(whitelist, url) {
    // Various scenarios for checking dark mode.
    // | Dark Mode | Url   | Url Stem | Result |
    // | ---       | ---   | ---      | ---    |
    // | On        | Undef | Undef    | True   |
    // | On        | Undef | True     | True   |
    // | On        | True  | True     | True   |
    // | On        | True  | Undef    | True   |
    // | On        | False | True     | False  |
    // | Off       | False | Undef    | False  |
    // | Off       | Undef | False    | False  |
    // | Off       | True  | False    | False  |
    // | Off       | False | False    | False  |
    var urlResult = checkWhitelist(whitelist, url, "dark-mode");
    var urlStemResult = checkWhitelistStem(whitelist, url, "dark-mode");
    console.log("Url is: " + urlResult + ", Url Stem is: " + urlStemResult);
    // Results that turn dark mode ON
    if (urlResult === undefined && urlStemResult === undefined) {
        return true;
    }
    if (urlResult === undefined && urlStemResult === true) {
        return true;
    }
    if (urlResult === true && urlStemResult === true) {
        return true;
    }
    if (urlResult === true && urlStemResult === undefined) {
        return true;
    }
    if (urlResult === true && urlStemResult === false) {
        return true;
    }
    // Results that turn dark mode OFF
    if (urlResult === false && urlStemResult === true) {
        return false;
    }
    if (urlResult === false && urlStemResult === undefined) {
        return false;
    }
    if (urlResult === undefined && urlStemResult === false) {
        return false;
    }
    if (urlResult === false && urlStemResult === false) {
        return false;
    }
    console.log("Error: checkWhitelist returned without a result");
}
function checkStemDarkMode(whitelist, url) {
    var stemResult = checkWhitelistStem(whitelist, url, "dark-mode");
    if (stemResult === false) {
        return false;
    }
    else {
        return true;
    }
}
function toggleWhitelist(whitelist, url, field) {
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    var cleanedUrl = cleanUrl(url);
    if (objExists(whitelist[urlStem])) {
        if (objExists(whitelist[urlStem][cleanedUrl])) {
            if (objExists(whitelist[urlStem][cleanedUrl][field])) {
                whitelist[urlStem][cleanedUrl][field] = !whitelist[urlStem][cleanedUrl][field];
            }
            else {
                // Turns dark mode off
                whitelist[urlStem][cleanedUrl][field] = false;
            }
        }
        else {
            whitelist[urlStem][cleanedUrl] = {};
            whitelist[urlStem][cleanedUrl][field] = false;
        }
    }
    else {
        whitelist[urlStem] = {};
        whitelist[urlStem][cleanedUrl] = {};
        whitelist[urlStem][cleanedUrl][field] = false;
    }
    saveWhitelist(whitelist);
    return whitelist;
}
function toggleWhitelistStem(whitelist, url, field) {
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    if (objExists(whitelist[urlStem])) {
        if (objExists(whitelist[urlStem][field])) {
            whitelist[urlStem][field] = !whitelist[urlStem][field];
        }
        else {
            whitelist[urlStem][field] = false;
        }
    }
    else {
        whitelist[urlStem] = {};
        // Deactivate the stem
        whitelist[urlStem][field] = false;
    }
    saveWhitelist(whitelist);
    return whitelist;
}
function toggleDarkMode(whitelist, url) {
    console.log("toggleDarkMode");
    return toggleWhitelist(whitelist, url, "dark-mode");
}
function toggleStemDarkMode(whitelist, url) {
    return toggleWhitelistStem(whitelist, url, "dark-mode");
}
// Helper Functions
function saveWhitelist(whitelist) {
    chrome.storage.local.remove("whitelist");
    chrome.storage.local.set({ "whitelist": whitelist });
}
function cleanWhitelist(whitelist) {
    if (whitelist === undefined) {
        whitelist = {};
    }
    if (objExists(whitelist.whitelist)) {
        whitelist = whitelist.whitelist;
    }
    return whitelist;
}
function checkOptions(options, passedValue) {
    if (options.indexOf(passedValue) == -1) {
        throw new Error(passedValue + " is an invalid option!");
    }
}
function objExists(object) {
    if (typeof object !== "undefined") {
        return true;
    }
    return false;
}
// End Whitelist Functions ------------------------------------------------- }}}
// Url Parsing ------------------------------------------------------------- {{{
/**
 * getUrlStem returns the url stem of a url.
 *
 * A url stem is the root of a url:
 *
 * http://www.reddit.com/r/cats/kitties -> http://www.reddit.com/
 *
 * The trailing slash is necessary because document.documentURI returns
 * urls formatted like this.
 *
 * @param {String} url A url from document.documentURI or chrome.tabs api
 * @return {String} urlStem
 */
function getUrlStem(url) {
    var urlStemRegex = /^.*:\/\/.*?(\/)/;
    try {
        return addTrailingSlash(urlStemRegex.exec(url)[0]);
    }
    catch (e) {
        console.log("Url " + url + " could not be parsed");
        return url;
    }
}
/**
 * cleanUrl removes any query(?) or fragment(#) strings from a url and returns the cleaned url.
 *
 * Matches up to the query string if it exists, otherwise matches up to the last backslash.
 *
 * @param {String} url from document.document.URI or chrome.tabs api
 * @return {String} cleaned url
 */
function cleanUrl(url) {
    var cleanUrlWithQueryStringRegex = /^.*:\/\/.*\/(.*(?=\?|#))?/;
    url = addTrailingSlash(url);
    try {
        var result = cleanUrlWithQueryStringRegex.exec(url)[0];
        return addTrailingSlash(result);
    }
    catch (e) {
        console.log("Url " + url + " could not be cleaned");
        return url;
    }
}
function addTrailingSlash(url) {
    var hasQueryString = url.indexOf("?") > -1;
    var hasFragmentString = url.indexOf("#") > -1;
    var hasTrailingSlash = url.charAt(url.length - 1) == "/";
    if (!hasQueryString && !hasFragmentString && !hasTrailingSlash) {
        return url += "/";
    }
    else {
        return url;
    }
}
function getMinimalUrl(url) {
    var minUrlRegex = /\/\/.*\//;
    try {
        return minUrlRegex.exec(getUrlStem(url))[0].replace(/\//g, "").replace("www.", "");
    }
    catch (e) {
        console.log("Url " + url + " could not be minimalized.");
        return url;
    }
}
var urlBlacklist = [
    "chrome://",
    "chrome-extension://",
    "about:blank"
];
function urlInBlacklist(url) {
    for (var i = 0; i < urlBlacklist.length; i++) {
        if (url.indexOf(urlBlacklist[i]) > -1) {
            return true;
        }
    }
    return false;
}
// End Url Parsing --------------------------------------------------------- }}}
// Url and Whitelist Action Callbacks -------------------------------------- {{{
function getWhitelist(callback, url) {
    chrome.storage.local.get("whitelist", function (result) {
        var whitelist = result;
        callback(whitelist, url);
    });
}
function getCurrentUrl(callback, callback2) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var url = tabs[0].url;
        if (typeof callback === "function") {
            callback(callback2, url);
        }
    });
}
function getUrlAndWhitelist(callback) {
    getCurrentUrl(getWhitelist, callback);
}
// End Url and Whitelist Action Callbacks ---------------------------------- }}}
// Setup ------------------------------------------------------------------- {{{
var debug = true;
setGlobalWhitelist();
setTimeout(function () {
    updateContextMenuAndBrowserAction();
    console.log("Hello from Typescript!");
}, 5);
// End Setup --------------------------------------------------------------- }}}
// Whitelist --------------------------------------------------------------- {{{
var globalWhitelist = {};
function setGlobalWhitelist() {
    chrome.storage.local.get("whitelist", function (whitelist) {
        globalWhitelist = whitelist;
        if (debug)
            console.log(globalWhitelist);
    });
}
// End Whitelist ----------------------------------------------------------- }}}
// Messages ---------------------------------------------------------------- {{{
function sendDarkModeStatusMessage() {
    chrome.runtime.sendMessage({
        "name": "dark-mode-status",
        "dark-mode": checkDarkMode(globalWhitelist, currentUrl),
        "dark-mode-stem": checkStemDarkMode(globalWhitelist, currentUrl),
        "url": currentUrl,
        "url-stem": getMinimalUrl(currentUrl)
    });
}
// Listen for an event / one-time request from the popup
function darkModeStatusListener(listenerMessage, actionFunction) {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message === listenerMessage) {
            if (debug)
                console.log("Received Message: " + message);
            if (typeof (actionFunction) === "function") {
                actionFunction();
            }
            sendDarkModeStatusMessage();
        }
    });
}
darkModeStatusListener("request-dark-mode-status", null);
darkModeStatusListener("toggle-dark-mode-from-popup", function () {
    executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
});
darkModeStatusListener("toggle-dark-mode-stem", function () {
    executeDarkModeScript(globalWhitelist, currentUrl, "toggleStem");
});
function darkModeActivatorListener() {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message === "activate-dark-mode") {
            executeDarkModeScript(globalWhitelist, currentUrl, "init");
        }
    });
}
darkModeActivatorListener();
// Send a message to the content script
var activateDarkMode = function () {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, { type: "toggle-dark-mode" });
    });
};
// Send a message to the content script
var sendMessageToCurrentTabContext = function (message) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, { type: message });
    });
};
// End Messages ------------------------------------------------------------ }}}
// ExecuteScripts ---------------------------------------------------------- {{{
function executeScriptInCurrentWindow(filename) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.executeScript(tab.id, {
            "file": "js/" + filename,
            "allFrames": true,
            "matchAboutBlank": true,
            "runAt": "document_start"
        }, function () {
            if (debug)
                console.log("Executing " + filename + " in " + tab.title);
        });
        if (filename.indexOf("Off") > -1) {
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-off-19.png",
                    "38": "img/dark-mode-off-38.png"
                },
                "tabId": tab.id
            });
        }
        else {
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-on-19.png",
                    "38": "img/dark-mode-on-38.png"
                },
                "tabId": tab.id
            });
        }
    });
}
function executeTurnOnDarkModeScript() {
    executeScriptInCurrentWindow("turnOnDarkMode.js");
}
function executeTurnOffDarkModeScript() {
    executeScriptInCurrentWindow("turnOffDarkMode.js");
}
function executeDarkModeScript(whitelist, url, choice) {
    if (choice === "toggle") {
        // This could make more sense!
        globalWhitelist = toggleDarkMode(whitelist, url);
        whitelist = globalWhitelist;
    }
    if (choice === "toggleStem") {
        // This could make more sense!
        globalWhitelist = toggleStemDarkMode(whitelist, url);
        whitelist = globalWhitelist;
    }
    if (checkDarkMode(whitelist, url)) {
        executeTurnOnDarkModeScript();
    }
    else {
        executeTurnOffDarkModeScript();
    }
}
// End ExecuteScripts ------------------------------------------------------ }}}
// Browser Action ---------------------------------------------------------- {{{
function deactivateBrowserAction() {
    if (debug)
        console.log("Deactivating browser action!");
    chrome.tabs.getSelected(null, function (tab) {
        chrome.browserAction.disable(tab.id);
        chrome.browserAction.setIcon({
            "path": {
                "19": "img/dark-mode-inactive-19.png",
                "38": "img/dark-mode-inactive-38.png"
            },
            "tabId": tab.id
        });
    });
}
function activateBrowserAction() {
    if (debug)
        console.log("Activating browser action!");
    chrome.tabs.getSelected(null, function (tab) {
        chrome.browserAction.enable(tab.id);
        chrome.browserAction.setIcon({
            "path": {
                "19": "img/dark-mode-on-19.png",
                "38": "img/dark-mode-on-38.png"
            },
            "tabId": tab.id
        });
    });
}
// End Browser Action ------------------------------------------------------ }}}
// Listen for Keystrokes --------------------------------------------------- {{{
chrome.commands.onCommand.addListener(function (command) {
    switch (command) {
        case "toggle-dark-mode":
            if (debug)
                console.log("Keyboard Shortcut caught");
            executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            break;
    }
});
// End Listen for Keystrokes ----------------------------------------------- }}}
// Detect If Page Is Dark -------------------------------------------------- {{{
// Pages where auto dark mode fails
var autoDarkBlacklist = [
    // I think this is because of js loading timing problems
    "pdf"
];
// Runs on the currently active tab in the current window
function isPageDark(lightCallback) {
    if (debug)
        console.log("Starting isPageDark");
    var brightnessThreshold = 50;
    // Test if url is in auto dark blacklist
    var runScreenshot = true;
    for (var i = 0; i <= autoDarkBlacklist.length; i++) {
        console.log("Testing: " + autoDarkBlacklist[i] + " in " + currentUrl);
        if (currentUrl.indexOf(autoDarkBlacklist[i]) > -1) {
            runScreenshot = false;
            console.log(autoDarkBlacklist[i] + " in " + currentUrl);
            console.log("Not taking screenshot!");
            break;
        }
    }
    if (runScreenshot) {
        chrome.tabs.captureVisibleTab(function (screenshot) {
            resemble(screenshot).onComplete(function (data) {
                if (data.brightness < brightnessThreshold) {
                    if (debug)
                        console.log("Page is dark! Brightness: " + data.brightness);
                }
                else {
                    if (debug)
                        console.log("Page is light! Brightness: " + data.brightness);
                    if (typeof (lightCallback) === "function") {
                        // Check if "dark-mode" for url is undefined
                        if (debug)
                            console.log("Before check whitelist");
                        var shouldRunCallback = checkWhitelist(globalWhitelist, currentUrl, "dark-mode");
                        if (debug)
                            console.log("shouldRunCallback = " + shouldRunCallback);
                        if (typeof (shouldRunCallback) === "undefined") {
                            console.log("Running light callback");
                            lightCallback();
                        }
                    }
                }
            });
        });
    }
}
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message === "check-is-page-dark") {
        if (debug)
            console.log("check-is-page-dark");
        isPageDark(function () {
            // executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            executeTurnOffDarkModeScript();
        });
    }
});
// End Detect If Page Is Dark ---------------------------------------------- }}}
// Context (Right Click) Menus --------------------------------------------- {{{
// Setup Basic Toggle context menu
function createToggleDarkModeContextMenu() {
    chrome.contextMenus.create({
        "id": "toggleDarkMode",
        "title": "Toggle Dark Mode",
        "onclick": function () {
            executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
        },
        "contexts": ["all"]
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
// Get the url for this tab?
var currentUrl = "about:blank";
function createToggleStemContextMenu() {
    currentUrl = getMinimalUrl(currentUrl);
    chrome.contextMenus.create({
        "id": "toggleStemFromContextMenu",
        "title": "Toggle Dark Mode for all " + currentUrl + " urls",
        "onclick": function () {
            executeDarkModeScript(globalWhitelist, currentUrl, "toggleStem");
        },
        "contexts": ["all"]
    });
}
createToggleStemContextMenu();
var updateContextMenuToggleUrlStemTimestamp = Date.now();
var updateIntervalMs = 10;
var showContextMenus = true;
var contextMenusRemoved = false;
function updateContextMenuAndBrowserAction() {
    // My solution to rate limit changing this too often
    // If one of the events triggers this function don't do it again for
    // `updateIntervalMs` milliseconds.
    if (Date.now() > updateContextMenuToggleUrlStemTimestamp + updateIntervalMs) {
        if (debug)
            console.log("In event loop @ " + Date.now());
        chrome.tabs.query({ "active": true, "currentWindow": true }, function (tabs) {
            try {
                currentUrl = tabs[0].url;
            }
            catch (e) {
                if (debug)
                    console.log("Could not get url for updating context menu: " + e);
            }
            if (urlInBlacklist(currentUrl)) {
                // Remove both context menus and browser action
                showContextMenus = false;
                if (!contextMenusRemoved) {
                    deactivateBrowserAction();
                    chrome.contextMenus.remove("toggleDarkMode");
                    chrome.contextMenus.remove("toggleStemFromContextMenu");
                    contextMenusRemoved = true;
                }
            }
            else {
                if (showContextMenus) {
                    // Update the relevant context menus
                    chrome.contextMenus.update("toggleStemFromContextMenu", {
                        "title": "Toggle Dark Mode for all " + getMinimalUrl(currentUrl) + " urls"
                    });
                }
                else {
                    // Create all context menus and browser action
                    showContextMenus = true;
                    createToggleDarkModeContextMenu();
                    createToggleStemContextMenu();
                    activateBrowserAction();
                    contextMenusRemoved = false;
                }
            }
        });
        updateContextMenuToggleUrlStemTimestamp = Date.now();
    }
}
// End Context (Right Click) Menus ----------------------------------------- }}}
// Context Menu Events ----------------------------------------------------- {{{
chrome.tabs.onHighlighted.addListener(function () {
    if (debug)
        console.log("onHighlighted @ " + Date.now());
    updateContextMenuAndBrowserAction();
});
chrome.tabs.onUpdated.addListener(function () {
    if (debug)
        console.log("onUpdated @ " + Date.now());
    updateContextMenuAndBrowserAction();
});
chrome.tabs.onActivated.addListener(function () {
    if (debug)
        console.log("onActivated @ " + Date.now());
    updateContextMenuAndBrowserAction();
});
chrome.windows.onCreated.addListener(function () {
    if (debug)
        console.log("onCreated @ " + Date.now());
    updateContextMenuAndBrowserAction();
});
chrome.windows.onFocusChanged.addListener(function () {
    if (debug)
        console.log("onFocusChanged @ " + Date.now());
    updateContextMenuAndBrowserAction();
});
// End Context Menu Events ------------------------------------------------- }}}
