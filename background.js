// Whitelist --------------------------------------------------------------- {{{

var globalWhitelist = {};
function setGlobalWhitelist(){
    chrome.storage.local.get("whitelist", function(whitelist){
        globalWhitelist = whitelist;
        console.log(globalWhitelist);
    });
}

// End Whitelist ----------------------------------------------------------- }}}
// Setup ------------------------------------------------------------------- {{{

setGlobalWhitelist();
setTimeout(function(){
    updateContextMenu();
}, 5);

// End Setup --------------------------------------------------------------- }}}
// Messages ---------------------------------------------------------------- {{{

// Listen for an event / one-time request from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type){
        case "toggle-dark-mode":
            activateDarkMode();
            break;
    }
    return true;
});

// Listen for an event / long-lived connections coming
// from devtools
chrome.extension.onConnect.addListener(function(port){
    port.onMessage.addListener(function(message){
        switch(port.name){
            case "toggle-dark-mode-port":
                activateDarkMode();
                break;
        }
    });
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

function executeScriptInCurrentWindow(filename){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.executeScript(tab.id, {
            "file": filename,
            "allFrames": true,
            "matchAboutBlank": true,
            "runAt": "document_start",
        }, function(){
            console.log("Executing " + filename + " in " + tab.title);
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

function sendToggleDarkModeStemMessage(){
    sendMessageToCurrentTabContext("toggle-dark-mode-stem-from-background");
}

// End Messages ------------------------------------------------------------ }}}
// Browser Action ---------------------------------------------------------- {{{

function deactivateBrowserAction(){
    console.log("Deactivating browser action!");
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
    console.log("Activating browser action!");
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
            console.log("Keyboard Shortcut caught");
            executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            break;
    }
});

// End Listen for Keystrokes ----------------------------------------------- }}}
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
        chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
            try {
                currentUrl = tabs[0].url;
            } catch (e) {
                console.log("Could not get url for updating context menu: " + e);
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

// Context Menu Events ----------------------------------------------------- {{{

chrome.tabs.onHighlighted.addListener(function(){
    updateContextMenu();
});

chrome.tabs.onUpdated.addListener(function(){
    updateContextMenu();
});
chrome.tabs.onActivated.addListener(function(){
    updateContextMenu();
});

chrome.windows.onCreated.addListener(function(){
    updateContextMenu();
});

chrome.windows.onFocusChanged.addListener(function(){
    updateContextMenu();
});

// End Context Menu Events ------------------------------------------------- }}}
// End Context (Right Click) Menus ----------------------------------------- }}}
