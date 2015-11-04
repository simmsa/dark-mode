function setWindowDarkModeState(darkMode){
    var state = darkMode ? "on" : "off";
    console.log("Turning dark-mode " + state);
    document.documentElement.setAttribute("data-dark-mode", state);
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
    // Send message to background
    chrome.runtime.sendMessage("request-dark-mode-status");

    // Handle the recieved message
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(typeof(message) === "object"){
            if(message.name === "dark-mode-status"){
                setWindowDarkModeState(message["dark-mode"]);
                setUrlStemToggleState(message["dark-mode-stem"], message["url"]);
            }
        }
    });
}

// Set visual status of dark-mode in window
setDarkMode();

// Setup handlers for button clicks
function toggleDarkModeOnClick(buttonId, message){
    document.getElementById(buttonId).onclick = function(){
        chrome.runtime.sendMessage(message);
        chrome.runtime.sendMessage("request-dark-mode-status");
    }
}

toggleDarkModeOnClick("toggle-button", "toggle-dark-mode-from-popup");
toggleDarkModeOnClick("url-stem", "toggle-dark-mode-stem");
