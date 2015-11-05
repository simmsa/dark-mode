// Setup ------------------------------------------------------------------- {{{

var debug = true;

setGlobalWhitelist();
setTimeout(function(){
    updateContextMenu();
}, 5);

// End Setup --------------------------------------------------------------- }}}
// Whitelist --------------------------------------------------------------- {{{

var globalWhitelist = {};
function setGlobalWhitelist(){
    chrome.storage.local.get("whitelist", function(whitelist){
        globalWhitelist = whitelist;
        if(debug) console.log(globalWhitelist);
    });
}

// End Whitelist ----------------------------------------------------------- }}}
// Messages ---------------------------------------------------------------- {{{

function sendDarkModeStatusMessage(){
    chrome.runtime.sendMessage({
        "name": "dark-mode-status",
        "dark-mode": checkDarkMode(globalWhitelist, currentUrl),
        "dark-mode-stem": checkStemDarkMode(globalWhitelist, currentUrl),
        "url": currentUrl
    });
}

// Listen for an event / one-time request from the popup
function darkModeStatusListener(listenerMessage, actionFunction){
    chrome.extension.onMessage.addListener(function(message, sender, sendResponse) {
        if(message === listenerMessage){
            if(debug) console.log("Received Message: " + message);
            if(typeof(actionFunction) === "function"){
                actionFunction();
            }
            sendDarkModeStatusMessage();
        }
    });
}

darkModeStatusListener("request-dark-mode-status");
darkModeStatusListener("toggle-dark-mode-from-popup", function() {
    executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
});
darkModeStatusListener("toggle-dark-mode-stem", function(){
    executeDarkModeScript(globalWhitelist, currentUrl, "toggleStem");
});

// Send a message to the content script
var activateDarkMode = function(){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendMessage(tab.id, {type: "toggle-dark-mode"});
    });
}

// Send a message to the content script
var sendMessageToCurrentTabContext = function(message){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendMessage(tab.id, {type: message});
    });
}
// End Messages ------------------------------------------------------------ }}}
// ExecuteScripts ---------------------------------------------------------- {{{

function executeScriptInCurrentWindow(filename){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.executeScript(tab.id, {
            "file": filename,
            "allFrames": true,
            "matchAboutBlank": true,
            "runAt": "document_start",
        }, function(){
            if(debug) console.log("Executing " + filename + " in " + tab.title);
        });
        if(filename.indexOf("Off") > -1){
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-off-19.png",
                    "38": "img/dark-mode-off-38.png"
                },
                "tabId": tab.id
            });
        } else {
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

function executeTurnOnDarkModeScript(){
    executeScriptInCurrentWindow("turnOnDarkMode.js");
}

function executeTurnOffDarkModeScript(){
    executeScriptInCurrentWindow("turnOffDarkMode.js");
}

function executeDarkModeScript(whitelist, url, choice){
    if(choice === "toggle"){
        // This could make more sense!
        globalWhitelist = toggleDarkMode(whitelist, url)
        whitelist = globalWhitelist;
    }
    if(choice === "toggleStem"){
        // This could make more sense!
        globalWhitelist = toggleStemDarkMode(whitelist, url)
        whitelist = globalWhitelist;
    }
    if(checkDarkMode(whitelist, url)){
        executeTurnOnDarkModeScript();
    } else {
        executeTurnOffDarkModeScript();
    }
}

// End ExecuteScripts ------------------------------------------------------ }}}

// Pretty sure this is dead code
// function sendToggleDarkModeStemMessage(){
//     sendMessageToCurrentTabContext("toggle-dark-mode-stem-from-background");
// }

// Browser Action ---------------------------------------------------------- {{{

function deactivateBrowserAction(){
    if(debug) console.log("Deactivating browser action!");
    chrome.tabs.getSelected(null, function(tab){
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

function activateBrowserAction(){
    if(debug) console.log("Activating browser action!");
    chrome.tabs.getSelected(null, function(tab){
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

chrome.commands.onCommand.addListener(function(command){
    switch(command){
        case "toggle-dark-mode":
            if(debug) console.log("Keyboard Shortcut caught");
            executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            break;
    }
});

// End Listen for Keystrokes ----------------------------------------------- }}}
// Detect If Page Is Dark -------------------------------------------------- {{{

// Runs on the currently active tab in the current window
function isPageDark(lightCallback){
    if(debug) console.log("Starting isPageDark");
    var brightnessThreshold = 50;
    chrome.tabs.captureVisibleTab(function(screenshot){
        resemble(screenshot).onComplete(function(data){
            if(data.brightness < brightnessThreshold){
                if(debug) console.log("Page is dark! Brightness: " + data.brightness);
                // return true;
            } else {
                if(debug) console.log("Page is light! Brightness: " + data.brightness);
                // return false;
                if(typeof(lightCallback) === "function"){
                    lightCallback();
                }
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message === "check-is-page-dark"){
        if(debug) console.log("check-is-page-dark");
        // isPageDark(executeTurnOffDarkModeScript);
        isPageDark(function(){
            // executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            executeTurnOffDarkModeScript();
        });
        // var darkPage = isPageDark();
        // if(debug) console.log("darkPage: " + darkPage);
        // if(darkPage === false){
        //     if(debug) console.log("Should be turning off dark mode");
        //     executeTurnOffDarkModeScript();
        // }
    }
});

// End Detect If Page Is Dark ---------------------------------------------- }}}
// Context (Right Click) Menus --------------------------------------------- {{{

// Setup Basic Toggle context menu
function createToggleDarkModeContextMenu(){
    chrome.contextMenus.create({
        "id": "toggleDarkMode",
        "title": "Toggle Dark Mode",
        "onclick": function(){
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
// `updateContextMenu` function. That function is rate limited
// by waiting at least 10ms to call `context.contextMenus.update`.
//
// There is probably a better way to do this, but this works for now.

// Get the url for this tab?
var currentUrl = "about:blank";

function createToggleStemContextMenu(){
    currentUrl = getMinimalUrl(currentUrl);
    chrome.contextMenus.create({
        "id": "toggleStemFromContextMenu",
        "title": "Toggle Dark Mode for all " + currentUrl  + " urls",
        "onclick": function(){
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

function updateContextMenu(){
    // My solution to rate limit changing this too often
    // If one of the events triggers this function don't do it again for
    // `updateIntervals` milliseconds.
    if(Date.now() > updateContextMenuToggleUrlStemTimestamp + updateIntervalMs){
        if(debug) console.log("In event loop @ " + Date.now());
        chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
            try {
                currentUrl = tabs[0].url;
            } catch (e) {
                if(debug) console.log("Could not get url for updating context menu: " + e);
            }
            if(urlInBlacklist(currentUrl)){
                // Remove both context menus and browser action
                showContextMenus = false;
                if(!contextMenusRemoved){
                    deactivateBrowserAction();
                    chrome.contextMenus.remove("toggleDarkMode");
                    chrome.contextMenus.remove("toggleStemFromContextMenu");
                    contextMenusRemoved = true;
                }
            } else {
                executeDarkModeScript(globalWhitelist, currentUrl, "init");
                if(showContextMenus){
                    // Update the relevant context menus
                    chrome.contextMenus.update("toggleStemFromContextMenu", {
                        "title": "Toggle Dark Mode for all " + getMinimalUrl(currentUrl)  + " urls",
                    });
                } else {
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

chrome.tabs.onHighlighted.addListener(function(){
    if(debug) console.log("onHighlighted @ " + Date.now());
    updateContextMenu();
});

chrome.tabs.onUpdated.addListener(function(){
    if(debug) console.log("onUpdated @ " + Date.now());
    updateContextMenu();
});
chrome.tabs.onActivated.addListener(function(){
    if(debug) console.log("onActivated @ " + Date.now());
    updateContextMenu();
});

chrome.windows.onCreated.addListener(function(){
    if(debug) console.log("onCreated @ " + Date.now());
    updateContextMenu();
});

chrome.windows.onFocusChanged.addListener(function(){
    if(debug) console.log("onFocusChanged @ " + Date.now());
    updateContextMenu();
});

// End Context Menu Events ------------------------------------------------- }}}
