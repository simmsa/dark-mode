import DefaultState from "./DefaultState";
import GlobalSettings from "./GlobalSettings";
import Url from "./Url";
import UrlSettings from "./UrlSettings";

class State extends DefaultState {
  public update(
    url: Url,
    settings: UrlSettings,
    globalSettings: GlobalSettings,
    callback: () => void,
  ): void {
    this.urlFull = url.getNormal();
    this.urlStem = url.getDomain();

    this.currentUrlDark = settings.checkDarkMode(url);
    this.currentUrlHue = settings.checkHueRotate(url);
    this.currentUrlContrast = settings.getContrast(url);

    // Stem Url Settings
    this.stemUrlDark = settings.checkDarkModeStem(url);
    this.stemUrlHue = settings.checkHueRotateStem(url);
    this.stemUrlContrast = settings.getContrastStem(url);

    // Global Dark Mode Settings
    this.globalDark = globalSettings.checkDark();
    this.globalAutoDark = globalSettings.checkAutoDark();
    this.globalLogAutoDark = globalSettings.checkLogAutoDark();
    this.globalShowNotifications = globalSettings.checkShowNotifications();
    this.globalHue = globalSettings.checkHue();
    const globalContrast = 99;
    this.globalContrast = globalContrast;
    this.updateKeyboardShortcut(callback);
  }

  public updateKeyboardShortcut(callback: () => void) {
    chrome.commands.getAll(commands => {
      // tslint:disable:no-string-literal
      this.globalKeyboardShortcut = commands[1]["shortcut"] || "undefined";
      callback();
    });
  }
}

export default State;
