//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="ContentSender.ts" />

//  End Typings ------------------------------------------------------------ }}}

class DarkModeContentManager {
    parentUrl: string;
    isIFrame: boolean;
    isDark: boolean;

    constructor(){
        this.updateAttributes();
        this.setParentUrl();
        if(window.location !== window.parent.location){
            this.setDarkAttribute("iframe", "true");
            this.isIFrame = true;
            // this.setDarkAttribute("active", "false");
        } else {
            this.setDarkAttribute("iframe", "false");
            this.isIFrame = false;
            // Only send auto dark message from the parent page
            this.initAutoDarkEvent();
        }
        this.requestState();

    }


    setParentUrl(){
        // This is an empty string if this frame has no parent
        this.parentUrl = document.referrer;
    }

    requestState(): void{
            ContentSender.sendUrl(document.URL, this.parentUrl);
    }

    setDarkAttribute(newAttribute: string, value: any): void{
        var prefix = "data-dark-mode";
        if(newAttribute !== ""){
            prefix += "-";
        }

        document.documentElement.setAttribute(prefix + newAttribute, value);

        jQuery("iframe").ready(function(){
            jQuery("iframe").each(function(index, elem){
                try{
                    jQuery(this).contents().find("html").attr(prefix + newAttribute, value);
                    jQuery(this).contents().find("html").attr(prefix + "iframe", "true");
                } catch(e) {
                    if(e instanceof DOMException){
                        // Ignore the cross domain error!
                    }
                }
            });
        });
    }

    setIframeAttributes(active: string){
        var allFrames = document.querySelectorAll("iframe");
        var darkCss = CssBuilder.buildForBaseFrame(true, true, 85);

        for(var i = 0; i < allFrames.length; i++){
            try{
                // Add the attributes
                allFrames[i]["contentWindow"].document.documentElement.setAttribute("data-dark-mode-active", active);
                allFrames[i]["contentWindow"].document.documentElement.setAttribute("data-dark-mode-iframe", "true");

                // Add the styles to the end of the head
                var styleTag = document.createElement("style");
                styleTag.type = "text/css";
                styleTag.appendChild(document.createTextNode(darkCss));

                allFrames[i]["contentWindow"].document.head.appendChild(styleTag);

            } catch(e){
                if(e instanceof DOMException){
                    // Ignore the cross domain exception
                } else {
                    console.log("Dark Mode: Error when trying to add attribute to html element that is not a DOMException!: " + e);
                }
            }
        }
    }

    initAutoDarkEvent(): void{
        document.addEventListener("DOMContentLoaded", (event) => {
            ContentSender.sendCheckAutoDark(this.parentUrl, document.URL);
        });
    }

    updateAttributes(darkModeActive?: boolean){
        if(typeof(darkModeActive) !== "undefined"){
            this.isDark = darkModeActive;
            if(darkModeActive){
                this.setDarkAttribute("active", "true");
            } else {
                this.setDarkAttribute("active", "false");
            }
            return;
        } else if (this.isDark !== undefined){
            this.setDarkAttribute("active", this.isDark);
            return;
        }
        this.setDarkAttribute("active", "true");
    }
}

var darkModeContentManager = new DarkModeContentManager();
