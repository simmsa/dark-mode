//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="ContentSender.ts" />

//  End Typings ------------------------------------------------------------ }}}

class DarkModeContentManager {
    parentUrl: string;

    constructor(){
        this.updateAttributes();
        this.updateUrl();
        if(window.location != window.parent.location){
            this.setDarkAttribute("iframe", "true");
        } else {
            this.setDarkAttribute("iframe", "false");
            // Only send auto dark message from the parent page
            this.initAutoDarkEvent();
        }
        this.requestState();
    }

    updateUrl(){
        this.parentUrl = (window.location != window.parent.location) ? document.referrer : document.URL;
    }

    requestState(): void{
        if(this.parentUrl != "about:blank"){
            ContentSender.sendUrl(this.parentUrl, document.URL);
        }
    }

    setDarkAttribute(newAttribute: string, value: any): void{
        if(newAttribute === ""){
            var prefix = "data-dark-mode";
        } else {
            var prefix = "data-dark-mode-";
        }

        document.documentElement.setAttribute(prefix + newAttribute, value);

        $("iframe").ready(function(){
            $("iframe").each(function(index, elem){
                try{
                    $(this).contents().find("html").attr(prefix + newAttribute, value);
                    $(this).contents().find("html").attr(prefix + "iframe", "true");
                } catch(e) {
                    if(e instanceof DOMException){
                        // Ignore the cross domain error!
                    }
                }
            });
        });
    }

    initAutoDarkEvent(): void{
        document.addEventListener("DOMContentLoaded", (event) => {
            ContentSender.sendCheckAutoDark(this.parentUrl, document.URL);
        });
    }

    updateAttributes(darkModeActive?: boolean){
        if(typeof(darkModeActive) !== "undefined"){
            if(darkModeActive){
                this.setDarkAttribute("active", "true");
            } else {
                this.setDarkAttribute("active", "false");
            }
            return;
        }
        this.setDarkAttribute("active", "true");
    }
}

var darkModeContentManager = new DarkModeContentManager();
