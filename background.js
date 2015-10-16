// Listen for an event / one-time request from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type){
        case "toggle-dark-mode":
            // alert("recieved request in background.");
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
        // alert("sending request from background.");
        chrome.tabs.sendMessage(tab.id, {type: "toggle-dark-mode"});
    });
}

// Send a message to the content script
var activateDarkModeFromKeyStroke = function(){
    chrome.tabs.getSelected(null, function(tab){
        // alert("sending request from background.");
        chrome.tabs.sendMessage(tab.id, {type: "toggle-dark-mode-on-keystroke"});
    });
}

// Listen for keystrokes
chrome.commands.onCommand.addListener(function(command){
    switch(command){
        case "toggle-dark-mode":
            activateDarkModeFromKeyStroke();
            break;
    }
});
