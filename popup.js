// alert("onload popup.js");
window.onload = function(){
    // alert("onload popup.js");
    document.getElementById("toggle-button").onclick = function(){
        // alert("toggle button clicked.");
        chrome.extension.sendMessage({
            type: "toggle-dark-mode"
        });
    }
}
