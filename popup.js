function toggleDarkModeOnClick(buttonId, nextAction, nextActionArgs){
        document.getElementById(buttonId).onclick = function(){

            // Send Message to content.js to toggle dark mode
            chrome.runtime.sendMessage({
                type: "toggle-dark-mode"
            });

            // Run the callbacks
            if(typeof nextAction === "function"){
                nextAction(nextActionArgs);
            }
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
    var result = toggleDarkModeOff(whitelist, url);
    setWindowDarkModeState(result);
}

function checkWhitelistFromPopup(whitelist, url){
    var result = checkDarkModeOff(whitelist, url);
    setWindowDarkModeState(result);
}

// function checkWhitelistStemFromPopup(whitelist, url){
//     var result = false;
//     if(whitelist[getUrlStem(url)]){
//         result = true;
//     }
//     setUrlStemToggleState(result, getUrlStem(url));
// }

function setWindowDarkModeState(darkModeOff){
    var state = darkModeOff ? "off" : "on";
    console.log("Turning dark-mode " + state);
    document.documentElement.setAttribute("dark-mode", state);
}

function setUrlStemToggleState(stemInWhitelist, urlStem){
    if(stemInWhitelist){
        document.getElementById("url-stem").checked = true;
        document.getElementById("url-stem-div").innerHTML = "Remove " + urlStem + " from dark-mode.";
    } else {
        document.getElementById("url-stem").checked = false;
        document.getElementById("url-stem-div").innerHTML = "Add " + urlStem + " to dark-mode.";
    }
}

function setDarkMode(){
    getUrlAndWhitelist(checkWhitelistFromPopup);
}

// function setUrlStemToggle(){
//     getUrlAndWhitelist(checkWhitelistStem);
// }

// Set visual status of dark-mode in window
setDarkMode();
// Set the text of the url stem toggle
// setUrlStemToggle();

toggleDarkModeOnClick("toggle-button", getUrlAndWhitelist, toggleWhitelistFromPopup);
// toggleDarkModeOnClick("url-stem", getUrlAndWhitelist, toggleWhitelistStem);
// toggleDarkModeOnClick("url-stem-div", getUrlAndWhitelist, toggleWhitelistStem);
