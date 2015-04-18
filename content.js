var mode = "on";

function toggleDarkMode(mode){
    document.documentElement.setAttribute('dark-mode', mode);
}

function logDarkMode(){
    console.log("Turning " + mode + " dark mode");
}

// To avoid white flash, turn on dark mode on initialization
toggleDarkMode(mode);

// Get whitelist from chrome storage, inside callback set up dark mode.
chrome.storage.local.get("whitelist", function(result){
    var whitelist = result;
    var darkModeOff = checkDarkModeOff(whitelist, document.documentURI);
    mode = darkModeOff ? "off" : "on";
    toggleDarkMode(mode);
    logDarkMode();
});

// Use jQuery to add "no-dark-mode" class to css with background images.
$("document").ready(function(){
    jQuery.each(jQuery("*"), function(){
        if(!jQuery(this).is("html", "body", "script", "iframe", "blockquote")){
            if(jQuery(this).css("background-image").length > 4 && jQuery(this).children().length < 6){
                jQuery(this).addClass("no-dark-mode").removeClass("dark-mode");
                jQuery(this).children().toggleClass("dark-mode");
            }
        }
    });
});

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    switch(message.type){
        case "toggle-dark-mode":
            if(mode == "on"){
                mode = "off";
            } else {
                mode = "on";
            }
            toggleDarkMode(mode);
            break;
        default:
            console.log("Unknown message sent to dark-mode: " + message.type);
            break;
    }
});
