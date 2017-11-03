import ContentSender from "./ContentSender";

class DarkModeContentManager {
  private parentUrl: string;
  private isDark: boolean;

  constructor() {
    this.requestState();
    this.updateAttributes();
    this.setParentUrl();
    if (window.location !== window.parent.location) {
      this.setDarkAttribute("iframe", "true");
    } else {
      this.setDarkAttribute("iframe", "false");
      // Only send auto dark message from the parent page
      this.initAutoDarkEvent();
    }
    this.addIsDarkClassToElementsWithBackgroundImage();
  }

  private addIsDarkClassToElementsWithBackgroundImage() {
    document.addEventListener("DOMContentLoaded", () => {
      const divs = document.querySelectorAll("div");
      Object.keys(divs).map((divKey) => {
        const div: HTMLDivElement = divs[divKey];
        const divStyle = window.getComputedStyle(div);
        const divStyleBgImage = divStyle.backgroundImage;
        if (divStyleBgImage && divStyleBgImage.match(/url.*jpg/)) {
          div.classList.add("no-dark");
        }
      });
    });
  }

  private setParentUrl() {
    // This is an empty string if this frame has no parent
    this.parentUrl = document.referrer;
  }

  private requestState(): void {
    ContentSender.sendUrl(document.URL, this.parentUrl);
  }

  private setDarkAttribute(newAttribute: string, value: any): void {
    var prefix = "data-dark-mode";
    if (newAttribute !== "") {
      prefix += "-";
    }

    document.documentElement.setAttribute(prefix + newAttribute, value);

    jQuery(window).bind("load", function() {
      if (this.isDark) {
        var shadowDomElements = document.querySelectorAll("twitterwidget");
        for (var x = 0; x < shadowDomElements.length; x++) {
          if (
            shadowDomElements[x].attributes.getNamedItem(
              "data-dark-mode-active",
            ) !== null
          )
            return;
          shadowDomElements[x].setAttribute("data-dark-mode-active", "true");
          shadowDomElements[x].setAttribute("data-dark-mode-iframe", "true");
          var css = document.createElement("style");
          css.innerHTML = "img { filter: invert(100%) hue-rotate(180deg) }";
          shadowDomElements[x].shadowRoot.appendChild(css);
        }
      }
    });

    jQuery("iframe").ready(function() {
      jQuery("iframe").each(function(index, elem) {
        try {
          jQuery(this)
            .contents()
            .find("html")
            .attr(prefix + newAttribute, value);
          jQuery(this)
            .contents()
            .find("html")
            .attr(prefix + "iframe", "true");
        } catch (e) {
          if (e instanceof DOMException) {
            // Ignore the cross domain error!
          }
        }
      });
    });
  }

  private setIFramesDark() {
    var allFrames = document.querySelectorAll("iframe");
    var darkCss = CssBuilder.buildForBaseFrame(true, true, 85);

    for (var i = 0; i < allFrames.length; i++) {
      try {
        // Add the attributes
        allFrames[i]["contentWindow"].document.documentElement.setAttribute(
          "data-dark-mode-active",
          active,
        );
        allFrames[i]["contentWindow"].document.documentElement.setAttribute(
          "data-dark-mode-iframe",
          "true",
        );

        // Add the styles to the end of the head
        var styleTag = document.createElement("style");
        styleTag.type = "text/css";
        styleTag.appendChild(document.createTextNode(darkCss));

        allFrames[i]["contentWindow"].document.head.appendChild(styleTag);
      } catch (e) {
        if (e instanceof DOMException) {
          // Ignore the cross domain exception
        } else {
          console.log(
            "Dark Mode: Error when trying to add attribute to html element that is not a DOMException!: " +
              e,
          );
        }
      }
    }
  }

  private initAutoDarkEvent(): void {
    document.addEventListener("DOMContentLoaded", event => {
      ContentSender.sendCheckAutoDark(this.parentUrl, document.URL);
    });
  }

  private updateAttributes(darkModeActive?: boolean) {
    if (typeof darkModeActive !== "undefined") {
      this.isDark = darkModeActive;
      if (darkModeActive) {
        this.setDarkAttribute("active", "true");
      } else {
        this.setDarkAttribute("active", "false");
      }
      return;
    } else if (this.isDark !== undefined) {
      this.setDarkAttribute("active", this.isDark);
      return;
    }
    this.setDarkAttribute("active", "true");
  }
}

// We add this to `window` so it can be accessed as a global variable from the
// background script to change the dark settings from the
// popup/keyboard/content menu
// @ts-ignore
window.darkModeContentManager = new DarkModeContentManager();
