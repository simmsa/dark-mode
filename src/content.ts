//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="ContentSender.ts" />

//  End Typings ------------------------------------------------------------ }}}

// If executed in iframe, set attribute
if(window.location != window.parent.location){
    // Differentiate an iframe from the parent
    document.documentElement.setAttribute("data-dark-mode-iframe", "true");
} else {
    // This works immediately, no need to wait for the page to load
    document.documentElement.setAttribute("data-dark-mode", "on");
    document.documentElement.setAttribute("data-dark-mode-parent", "true");
    ContentSender.sendUrl(document.URL);

    // If the page is dark before the images load, then it is a dark page
    // and dark-mode should be set to off
    document.addEventListener("DOMContentLoaded", function(event){
        ContentSender.sendCheckAutoDark(document.URL);
    });
}