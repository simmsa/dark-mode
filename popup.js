function toggleDarkModeOnClick(buttonId, nextAction, nextActionArgs){
        document.getElementById(buttonId).onclick = function(){

            // Run the callbacks
            if(typeof nextAction === "function"){
                nextAction(nextActionArgs);
            }
            // Send Message to content.js to toggle dark mode after the callback is executed
            chrome.runtime.sendMessage({
                type: "toggle-dark-mode"
            });
        };
}

function getWhitelist(callback, url){
    chrome.storage.local.get("whitelist", function(result){
        var whitelist = result;
        callback(whitelist, url);
    });
}

function getCurrentUrl(callback, callback2){
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url;
        if(typeof callback === "function"){
            callback(callback2, url);
        }
    });
}

function getUrlAndWhitelist(callback){
    getCurrentUrl(getWhitelist, callback);
}

function toggleWhitelistFromPopup(whitelist, url){
    var toggledWhitelist = toggleDarkMode(whitelist, url);
    setWindowDarkModeState(checkDarkMode(toggledWhitelist, url));
    setUrlStemToggleState(checkStemDarkMode(toggledWhitelist, url), url);
}

function checkWhitelistFromPopup(whitelist, url){
    var result = checkDarkMode(whitelist, url);
    setWindowDarkModeState(result);
    setUrlStemToggleState(checkStemDarkMode(whitelist, url), url);
}

function toggleWhitelistStemFromPopup(whitelist, url){
    var toggledWhitelist = toggleStemDarkMode(whitelist, url);
    setWindowDarkModeState(checkDarkMode(toggledWhitelist, url));
    setUrlStemToggleState(checkStemDarkMode(toggledWhitelist, url), url);

}

function setWindowDarkModeState(darkMode){
    var state = darkMode ? "on" : "off";
    console.log("Turning dark-mode " + state);
    document.documentElement.setAttribute("dark-mode", state);
}

function setUrlStemToggleState(darkModeStem, url){
    var urlStem = getMinimalUrl(url);
    document.getElementById("url-stem-div").innerHTML = 'Deactivate Dark Mode for all "' + urlStem + '" urls.';
    // If Dark Mode is deactivated for the stem
    if(darkModeStem === false){
        document.getElementById("url-stem").checked = true;
    } else {
        document.getElementById("url-stem").checked = false;
    }
}

function setDarkMode(){
    getUrlAndWhitelist(checkWhitelistFromPopup);
}


// Set visual status of dark-mode in window
setDarkMode();

// Setup handlers for button clicks
toggleDarkModeOnClick("toggle-button", getUrlAndWhitelist, toggleWhitelistFromPopup);
toggleDarkModeOnClick("url-stem", getUrlAndWhitelist, toggleWhitelistStemFromPopup);
