function setSettingsTitles(url: string, urlStem: string): void{
    $("#current-url-settings").append("<a id=\"current-url-tooltip\" src=\"#\">Current Url</a> settings:");

    $("#stem-url-settings").append(capitalize(urlStem) + " settings:");
}

function capitalize(s: string): string{
    return s[0].toUpperCase() + s.slice(1);
}

}

function setDarkMode(){
    // Send message to background
    chrome.runtime.sendMessage("request-dark-mode-status");

    // Setup switches
    $("[name='current-dark-mode']").bootstrapSwitch();
    $("[name='current-hue-rotate']").bootstrapSwitch();
    $("[name='stem-dark-mode']").bootstrapSwitch();
    $("[name='stem-hue-rotate']").bootstrapSwitch();
    $("[name='global-dark-mode']").bootstrapSwitch();
    $("[name='global-auto-dark-detection']").bootstrapSwitch();
    $("[name='global-hue-rotate']").bootstrapSwitch();
    // Handle the recieved message
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(typeof(message) === "object"){
            if(message.name === "dark-mode-status"){
                // Run functions that need message results
                setSettingsTitles(message["url"], message["url-stem"]);
                setupTooltips(message["url"], message["url-stem"]);
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
    };
}

// Tooltips
function setupTooltips(url, urlStem){
    $("document").ready(function(){
        $("#stem-tooltip").tooltip({
            title: "Toggle dark mode for every url starting with " + urlStem + "."
        });
        $("#current-url-tooltip").tooltip({
            title: url
        });
    });
}
