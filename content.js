var mode = "on";

function toggleDarkModeAttribute(mode){
    document.documentElement.setAttribute('dark-mode', mode);
}

function logDarkMode(){
    console.log("Turning " + mode + " dark mode");
}

// To avoid white flash, turn on dark mode on initialization
toggleDarkModeAttribute(mode);

// Get whitelist from chrome storage, inside callback set up dark mode.
function readDarkMode(){
    chrome.storage.local.get("whitelist", function(result){
        var whitelist = result;
        var darkMode = checkDarkMode(whitelist, document.documentURI);
        mode = darkMode ? "on" : "off";
        toggleDarkModeAttribute(mode);
        logDarkMode();
    });
}
readDarkMode();

function forceToggleDarkMode(){
    if(mode === "on"){
        mode = "off";
    } else {
        mode = "on";
    }
    toggleDarkModeAttribute(mode);
}

function activateAdvancedMode(){
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
}

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    switch(message.type){
        case "toggle-dark-mode":
            readDarkMode();
            break;
        case "toggle-dark-mode-from-background":
            getWhitelist(toggleDarkMode, document.documentURI);
            // There is a delay when writing to the whitelist and reading
            // from it, so here we force the inversion with forceToggleDarkMode
            // and check with a short delay using readDarkMode.
            setTimeout(readDarkMode, 10);
            break;
        case "toggle-dark-mode-stem-from-background":
            getWhitelist(toggleStemDarkMode, document.documentURI);
            setTimeout(readDarkMode, 10);
            break;
        default:
            console.log("Unknown message sent to dark-mode: " + message.type);
            break;
    }
});
