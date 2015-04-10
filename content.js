var whitelist = [
    "reddit"
];

var mode = "on";

function interpretWhitelist(list){
    var url = document.documentURI;
    for(var i = 0; i < list.length; i++){
        if(url.search(list[i]) >= 0){
            mode = "off";
            break;
        }
    }
}

function toggle_dark_mode(mode){
    document.documentElement.setAttribute('dark-mode', mode);
}

function logDarkMode(){
    console.log("Turning " + mode + " dark mode");
}

// Toggle dark mode on init
interpretWhitelist(whitelist);
toggle_dark_mode(mode);
logDarkMode();

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    switch(message.type){
        case "toggle-dark-mode":
            if(mode == "on"){
                mode = "off";
            } else {
                mode = "on";
            }
            toggle_dark_mode(mode);
            break;
    }
});
