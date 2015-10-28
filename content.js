// This works immediately, no need to wait for the page to load
document.documentElement.setAttribute("dark-mode", "on");

// If executed in iframe, set attribute
if(window.location != window.parent.location){
    // Differentiate an iframe from the parent
    document.documentElement.setAttribute("dark-mode-iframe", "true");
    // Chrome 45+ no html background mod
    document.documentElement.setAttribute("style", "background-color: #ffffff !important; height: 100%;");
} else {
    document.documentElement.setAttribute("dark-mode-parent", "true");
    // Chrome 45+ no html background mod
    document.documentElement.setAttribute("style", "background-color: #0f0f0f !important; height: 100%;");
}
