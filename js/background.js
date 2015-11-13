// PersistentStorage Class ------------------------------------------------ {{{
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PersistentStorage = (function () {
    function PersistentStorage(name) {
        this.setData(name);
    }
    PersistentStorage.prototype.setData = function (savedObjectName) {
        var _this = this;
        this.name = savedObjectName;
        // Special syntax for using `this` inside a callback
        chrome.storage.local.get(savedObjectName, function (result) {
            _this.dataObject = result[_this.name];
            // Guard against undefined `dataObject`
            if (typeof (_this.dataObject) === "undefined") {
                _this.dataObject = {};
            }
        });
    };
    PersistentStorage.prototype.getAll = function () {
        return this.dataObject;
    };
    PersistentStorage.prototype.get = function (key) {
        try {
            return this.dataObject[key];
        }
        catch (e) {
            console.log(key + " does not exist in PersistentStorage object named: " + this.name);
        }
    };
    PersistentStorage.prototype.add = function (key, data) {
        this.dataObject[key] = data;
    };
    PersistentStorage.prototype.exists = function (key, object) {
        if (object.hasOwnProperty(key)) {
            return true;
        }
        return false;
    };
    PersistentStorage.prototype.remove = function (key) {
        if (this.exists(key, this.dataObject)) {
            delete this.dataObject[key];
        }
    };
    PersistentStorage.prototype.save = function () {
        chrome.storage.local.remove(this.name);
        // Typescript, or maybe js, doesn't like `this.name` as an object key
        var thisName = this.name;
        console.log("Saving: " + this.name);
        var saveObject = {};
        saveObject[this.name] = this.dataObject;
        console.log(saveObject);
        chrome.storage.local.set(saveObject);
    };
    PersistentStorage.prototype.clear = function () {
        chrome.storage.local.remove(this.name);
        this.setData(this.name);
    };
    return PersistentStorage;
})();
// End PersistentStorage Class -------------------------------------------- }}}
// UrlSettings Class ------------------------------------------------------ {{{
// I would like to put this inside the `UrlSettings` class but typescript does
// not allow this.
var QueryResult;
(function (QueryResult) {
    QueryResult[QueryResult["True"] = 0] = "True";
    QueryResult[QueryResult["False"] = 1] = "False";
    QueryResult[QueryResult["Undefined"] = 2] = "Undefined";
})(QueryResult || (QueryResult = {}));
;
var UrlSettings = (function (_super) {
    __extends(UrlSettings, _super);
    function UrlSettings() {
        _super.call(this, "urlInfo");
        // List the fields that exist and can be accessed
        this.fields = {
            "darkMode": {
                "name": "darkMode",
                "type": "boolean"
            },
            "hueRotate": {
                "name": "hueRotate",
                "type": "boolean"
            }
        };
    }
    UrlSettings.prototype.getSettings = function () {
        return this.dataObject;
    };
    UrlSettings.prototype.returnQueryResultIfBool = function (input) {
        if (input === true) {
            return QueryResult.True;
        }
        else if (input === false) {
            return QueryResult.False;
        }
        else {
            return input;
        }
    };
    UrlSettings.prototype.checkUrlStem = function (url) {
        var urlStem = getUrlStem(url);
        if (this.exists(urlStem, this.dataObject)) {
            return QueryResult.True;
        }
        return QueryResult.Undefined;
    };
    UrlSettings.prototype.checkUrlForField = function (url, field) {
        var urlStem = getUrlStem(url);
        var cleanedUrl = cleanUrl(url);
        if (this.exists(urlStem, this.dataObject)) {
            if (this.exists(cleanedUrl, this.dataObject[urlStem])) {
                if (this.exists(field, this.dataObject[urlStem][cleanedUrl])) {
                    return this.returnQueryResultIfBool(this.dataObject[urlStem][cleanedUrl][field]);
                }
            }
        }
        return QueryResult.Undefined;
    };
    UrlSettings.prototype.checkUrlStemForField = function (url, field) {
        var urlStem = getUrlStem(url);
        if (this.exists(urlStem, this.dataObject)) {
            if (this.exists(field, this.dataObject[urlStem])) {
                return this.returnQueryResultIfBool(this.dataObject[urlStem][field]);
            }
        }
        return QueryResult.Undefined;
    };
    UrlSettings.prototype.checkUrlStemForUrl = function (url) {
        var urlStem = getUrlStem(url);
        var cleanedUrl = cleanUrl(url);
        if (this.exists(urlStem, this.dataObject)) {
            if (this.exists(cleanedUrl, this.dataObject[urlStem])) {
                return QueryResult.True;
            }
        }
        return QueryResult.Undefined;
    };
    UrlSettings.prototype.checkUrlForFieldBool = function (url, field, resultIfUndefined) {
        // Various scenarios for checking bool fields.
        //  Url Query Result | Url Stem Query Result | Result            |
        //  ---              | ---                   | ---               |
        //  Undef            | Undef                 | resultIfUndefined |
        //  Undef            | True                  | True              |
        //  True             | True                  | True              |
        //  True             | Undef                 | True              |
        //  False            | True                  | False             |
        //  False            | Undef                 | False             |
        //  Undef            | False                 | False             |
        //  True             | False                 | False             |
        //  False            | False                 | False             |
        var urlResult = this.checkUrlForField(url, field);
        var urlStemResult = this.checkUrlStemForField(url, field);
        console.log("Url is: " + urlResult + ", Url Stem is: " + urlStemResult);
        // The default case: both fields are undefined, return the default value
        if (urlResult === QueryResult.Undefined && urlStemResult === QueryResult.Undefined) {
            return resultIfUndefined;
        }
        // True Results
        if (urlResult === QueryResult.Undefined && urlStemResult === QueryResult.True) {
            return true;
        }
        if (urlResult === QueryResult.True && urlStemResult === QueryResult.True) {
            return true;
        }
        if (urlResult === QueryResult.True && urlStemResult === QueryResult.Undefined) {
            return true;
        }
        if (urlResult === QueryResult.True && urlStemResult === QueryResult.False) {
            return true;
        }
        // False Results
        if (urlResult === QueryResult.False && urlStemResult === QueryResult.True) {
            return false;
        }
        if (urlResult === QueryResult.False && urlStemResult === QueryResult.Undefined) {
            return false;
        }
        if (urlResult === QueryResult.Undefined && urlStemResult === QueryResult.False) {
            return false;
        }
        if (urlResult === QueryResult.False && urlStemResult === QueryResult.False) {
            return false;
        }
        console.log("Error: checkWhitelist returned without a result");
        return;
    };
    UrlSettings.prototype.checkUrlStemForFieldBool = function (url, field, defaultValue) {
        var result = this.checkUrlStemForField(url, field);
        switch (result) {
            case QueryResult.Undefined:
                return defaultValue;
                break;
            case QueryResult.True:
                return true;
                break;
            case QueryResult.False:
                return false;
                break;
        }
    };
    UrlSettings.prototype.checkDarkMode = function (url) {
        // If the stem and the url are undefined turn dark mode ON!
        return this.checkUrlForFieldBool(url, this.fields.darkMode.name, true);
    };
    UrlSettings.prototype.checkDarkModeStem = function (url) {
        return this.checkUrlStemForFieldBool(url, this.fields.darkMode.name, true);
    };
    // Special case for auto dark detection
    UrlSettings.prototype.checkDarkModeIsUndefined = function (url) {
        var result = this.checkUrlForField(url, this.fields.darkMode.name);
        if (result === QueryResult.Undefined) {
            return true;
        }
        return false;
    };
    UrlSettings.prototype.checkHueRotate = function (url) {
        // If the stem and the url are undefined turn hue rotate ON!
        return this.checkUrlForFieldBool(url, this.fields.hueRotate.name, true);
    };
    UrlSettings.prototype.checkHueRotateStem = function (url) {
        return this.checkUrlStemForFieldBool(url, this.fields.hueRotate.name, true);
    };
    // Helper function for toggle
    UrlSettings.prototype.isQueryUndefined = function (input) {
        if (input === QueryResult.Undefined) {
            return true;
        }
        return false;
    };
    // Helper function for toggle
    UrlSettings.prototype.allArgsFalse = function () {
        var input = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            input[_i - 0] = arguments[_i];
        }
        for (var i = 0; i <= arguments.length; i++) {
            if (arguments[i] === true) {
                return false;
            }
        }
        return true;
    };
    UrlSettings.prototype.checkFieldIsBoolean = function (field) {
        if (this.fields[field].type != "boolean") {
            throw new Error("Cannot toggle UrlSettings field: " + field + " because it is not of type boolean!");
        }
    };
    UrlSettings.prototype.toggleUrl = function (url, field, defaultValue) {
        this.checkFieldIsBoolean(field);
        // Testing which fields are undefined
        // Check if stem exists
        // Check if stem -> url exists
        // Check if stem -> url -> field exists
        var stem = this.isQueryUndefined(this.checkUrlStem(url));
        var stem_Url = this.isQueryUndefined(this.checkUrlStemForUrl(url));
        var stem_Url_Field = this.isQueryUndefined(this.checkUrlForField(url, field));
        var urlStem = getUrlStem(url);
        var cleanedUrl = cleanUrl(url);
        var isNotUndefined = this.allArgsFalse(true, true);
        console.log("stem: " + stem);
        console.log("stem_Url: " + stem_Url);
        console.log("stem_Url_Field: " + stem_Url_Field);
        // The value exists, successfully run toggle
        if (this.allArgsFalse(stem, stem_Url, stem_Url_Field)) {
            // this.dataObject[urlStem][cleanedUrl][field] = !this.dataObject[urlStem][cleanedUrl][field];
            if (this.dataObject[urlStem][cleanedUrl][field] === true) {
                this.dataObject[urlStem][cleanedUrl][field] = false;
            }
            else {
                this.dataObject[urlStem][cleanedUrl][field] = true;
            }
        }
        else if (this.allArgsFalse(stem, stem_Url)) {
            // Create the field and insert the default value
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }
        else if (this.allArgsFalse(stem)) {
            // Create the url within the stem and add the field
            this.dataObject[urlStem][cleanedUrl] = {};
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }
        else {
            // this.dataObject[urlStem] = {cleanedUrl: {field: defaultValue}};
            this.dataObject[urlStem] = {};
            this.dataObject[urlStem][cleanedUrl] = {};
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }
        this.save();
    };
    UrlSettings.prototype.toggleUrlStem = function (url, field, defaultValue) {
        this.checkFieldIsBoolean(field);
        // Check if stem exists
        // Check if stem -> field exists
        var stem = this.isQueryUndefined(this.checkUrlStem(url));
        var stem_Field = this.isQueryUndefined(this.checkUrlStemForField(url, field));
        var urlStem = getUrlStem(url);
        // The stem -> field exists, run toggle
        if (this.allArgsFalse(stem, stem_Field)) {
            this.dataObject[urlStem][field] = !this.dataObject[urlStem][field];
        }
        else if (this.allArgsFalse(stem)) {
            this.dataObject[urlStem][field] = defaultValue;
        }
        else {
            this.dataObject[urlStem] = {};
            this.dataObject[urlStem][field] = defaultValue;
        }
        this.save();
    };
    UrlSettings.prototype.toggleDarkMode = function (url) {
        // Dark mode is always on (true), so when it is toggled for the first
        // time set the value to off (false)
        this.toggleUrl(url, this.fields.darkMode.name, false);
    };
    UrlSettings.prototype.toggleDarkModeStem = function (url) {
        this.toggleUrlStem(url, this.fields.darkMode.name, false);
    };
    UrlSettings.prototype.toggleHueRotate = function (url) {
        this.toggleUrl(url, this.fields.hueRotate.name, false);
    };
    UrlSettings.prototype.toggleHueRotateStem = function (url) {
        this.toggleUrlStem(url, this.fields.hueRotate.name, false);
    };
    // stem
    UrlSettings.prototype.removeStem = function (url) {
        delete this.dataObject[getUrlStem(url)];
        this.save();
    };
    // stem -> field
    UrlSettings.prototype.removeStemField = function (url, field) {
        delete this.dataObject[getUrlStem(url)][this.fields[field].name];
        this.save();
    };
    // stem -> url
    UrlSettings.prototype.removeUrl = function (url) {
        delete this.dataObject[getUrlStem(url)][cleanUrl(url)];
        this.save();
    };
    // stem -> url -> field
    UrlSettings.prototype.removeField = function (url, field) {
        delete this.dataObject[getUrlStem(url)][cleanUrl(url)][this.fields[field].name];
        this.save();
    };
    UrlSettings.prototype.clearUrl = function (url) {
        this.removeUrl(url);
    };
    UrlSettings.prototype.clearUrlStem = function (url) {
        this.removeStem(url);
    };
    UrlSettings.prototype.clearDarkMode = function (url) {
        this.removeField(url, this.fields.darkMode.name);
    };
    UrlSettings.prototype.clearDarkModeStem = function (url) {
        this.removeStemField(url, this.fields.darkMode.name);
    };
    UrlSettings.prototype.clearHueRotate = function (url) {
        this.removeField(url, this.fields.hueRotate.name);
    };
    UrlSettings.prototype.clearHueRotateStem = function (url) {
        this.removeStemField(url, this.fields.hueRotate.name);
    };
    return UrlSettings;
})(PersistentStorage);
// End UrlSettings Class -------------------------------------------------- }}}
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
var abnormalStems = [
    "file://",
    "about:blank",
];
function getAbnormalStem(url) {
    // Uri.js is pretty useful, but fails on local file, "file://" urls.
    // This is the unideal solution to fix these, and probably other, urls.
    for (var i = 0; i <= abnormalStems.length; i++) {
        if (url.indexOf(abnormalStems[i]) == 0) {
            console.log("Found abnormalStem: " + abnormalStems[i] + " in " + url);
            return abnormalStems[i];
        }
    }
    return "";
}
function getUrlStem(url) {
    if (debug)
        console.log("Getting url stem from " + url);
    var abnormalStem = getAbnormalStem(url);
    if (abnormalStem.length > 0) {
        return abnormalStem;
    }
    var fullUrl = URI(url);
    var urlStem = new URI({
        protocol: fullUrl.protocol(),
        hostname: fullUrl.hostname()
    }).toString();
    if (debug)
        console.log("The stem of " + url + " is '" + urlStem + "'?");
    return urlStem;
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
    var fullUrl = URI(url);
    var cleanedUrl = new URI({
        protocol: fullUrl.protocol(),
        hostname: fullUrl.hostname(),
        path: fullUrl.path()
    }).toString();
    console.log("The cleaned url of " + url + " is '" + cleanedUrl + "'?");
    return cleanedUrl;
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
    console.log("Minimizing url: " + url);
    var abnormalStem = getAbnormalStem(url);
    if (abnormalStem.length > 0) {
        console.log("The minimal url of " + url + " is '" + abnormalStem + "'?");
        return abnormalStem;
    }
    try {
        var fullUrl = URI(url);
        var minimalUrl = fullUrl.hostname().toString();
        console.log("The minimal url of " + url + " is '" + minimalUrl + "'?");
        return minimalUrl;
    }
    catch (e) {
        console.log("Cannot minimize url: " + url);
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
// Url Callbacks -------------------------------------- {{{
function getCurrentUrl(callback, callback2) {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var url = tabs[0].url;
        if (typeof callback === "function") {
            callback(callback2, url);
        }
    });
}
// End Url Callbacks ---------------------------------- }}}
// Messages ---------------------------------------------------------------- {{{
function sendDarkModeStatusMessage() {
    chrome.runtime.sendMessage({
        "name": "dark-mode-status",
        "dark-mode": urlSettings.checkDarkMode(currentUrl),
        "dark-mode-stem": urlSettings.checkDarkModeStem(currentUrl),
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
    executeDarkModeScript(currentUrl, "toggle");
});
darkModeStatusListener("toggle-dark-mode-stem", function () {
    executeDarkModeScript(currentUrl, "toggleStem");
});
function darkModeActivatorListener() {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message === "activate-dark-mode") {
            executeDarkModeScript(currentUrl, "init");
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
function executeDarkModeScript(url, choice) {
    if (choice === "toggle") {
        urlSettings.toggleDarkMode(url);
    }
    if (choice === "toggleStem") {
        urlSettings.toggleDarkModeStem(url);
    }
    if (urlSettings.checkDarkMode(url)) {
        // If darkMode is true, turn on dark mode
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
            executeDarkModeScript(currentUrl, "toggle");
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
    // Don't try to take screen shots while chrome is loading.
    // It blocks the background from doing other processing.
    if (runScreenshot && setup === false) {
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
                        var shouldRunCallback = urlSettings.checkDarkModeIsUndefined(currentUrl);
                        if (debug)
                            console.log("shouldRunCallback = " + shouldRunCallback);
                        if (shouldRunCallback) {
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
            // In the future I plan to have a pop asking if this is correct
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
            executeDarkModeScript(currentUrl, "toggle");
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
            executeDarkModeScript(currentUrl, "toggleStem");
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
// Main ------------------------------------------------------------------- {{{
var debug = true;
var setup = true;
setTimeout(function () {
    updateContextMenuAndBrowserAction();
    console.log("Hello from Typescript!");
}, 5);
var urlSettings = new UrlSettings();
// Wait 10 seconds to declare setup is over
setTimeout(function () {
    setup = false;
}, 10000);
// End Main --------------------------------------------------------------- }}}
