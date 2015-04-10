var mode = "on";
function toggle_dark_mode(mode){
    document.documentElement.setAttribute('dark-mode', mode);
}
// Turn on dark mode by default
console.log("Turning on dark mode");
toggle_dark_mode(mode);

chrome.extension.onMessage.addListener(function(message, sender, sendResponse){
    switch(message.type){
        case "toggle-dark-mode":
            if(mode == "on"){
                mode = "off";
            } else {
                mode = "on";
            }
            console.log("Turning " + mode + " dark mode");
            toggle_dark_mode(mode);
            break;
    }
});
