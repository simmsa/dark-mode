// Keep
function setWindowDarkModeState(darkMode){
    var state = darkMode ? "on" : "off";
    console.log("Turning dark-mode " + state);
    document.documentElement.setAttribute("dark-mode", state);
}

// Keep
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


// Keep
// Set visual status of dark-mode in window
setDarkMode();

// Keep
// Setup handlers for button clicks
toggleDarkModeOnClick("toggle-button", getUrlAndWhitelist, toggleWhitelistFromPopup);
// Keep
toggleDarkModeOnClick("url-stem", getUrlAndWhitelist, toggleWhitelistStemFromPopup);
