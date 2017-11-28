import ContentSender from "./ContentSender";

class DarkModeContentManager {
  private parentUrl: string;
  private isDark: boolean;

  constructor() {
    this.requestState();
    this.updateAttributes();
    this.setParentUrl();
    this.setDarkAttribute("url", window.location);
    if (window.location !== window.parent.location) {
      this.setDarkAttribute("iframe", "true");
    } else {
      this.setDarkAttribute("iframe", "false");
      // Only send auto dark message from the parent page
      this.initAutoDarkEvent();
    }
    this.setIFramesDark();
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
    let prefix = "data-dark-mode";
    if (newAttribute !== "") {
      prefix += "-";
    }

    document.documentElement.setAttribute(prefix + newAttribute, value);
  }

  private setIFramesDark() {
    // DOMFrameContentLoaded is the right event? but causes the background to
    // flicker when iframes are loaded/unloaded
    // document.addEventListener("DOMFrameContentLoaded", () => {
    document.addEventListener("DOMContentLoaded", () => {
      const iframes = document.querySelectorAll("iframe");
      Object.keys(iframes).map((iframeKey) => {
        const iframe: HTMLIFrameElement = iframes[iframeKey];

        const darkModeActiveAttr: Attr = document.createAttribute("data-dark-mode-active");
        darkModeActiveAttr.value = "true";

        const darkModeIFrameAttr: Attr = document.createAttribute("data-dark-mode-iframe");
        darkModeIFrameAttr.value = "true";

        iframe.attributes.setNamedItem(darkModeActiveAttr);
        iframe.attributes.setNamedItem(darkModeIFrameAttr);
      });
    });
  }

  private initAutoDarkEvent(): void {
    // document.addEventListener("DOMContentLoaded", () => {
    //   ContentSender.sendCheckAutoDark(this.parentUrl, document.URL);
    // });
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
