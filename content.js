// If executed in iframe, set attribute
if(window.location != window.parent.location){
    // Differentiate an iframe from the parent
    document.documentElement.setAttribute("data-dark-mode-iframe", "true");
} else {
    // This works immediately, no need to wait for the page to load
    document.documentElement.setAttribute("data-dark-mode", "on");
    document.documentElement.setAttribute("data-dark-mode-parent", "true");

    // Check if page is dark before images are loaded
    document.addEventListener("DOMContentLoaded", function(event){
        chrome.runtime.sendMessage("check-is-page-dark");
    });
}
