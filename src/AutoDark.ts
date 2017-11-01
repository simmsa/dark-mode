import ContentAction from "./ContentAction";
import GlobalSettings from "./GlobalSettings";
import Url from "./Url";
import UrlSettings from "./UrlSettings";

// tslint:disable:member-ordering
class AutoDark {
  private static brightnessThreshold = 50;
  private static runInterval = 1000; // ms
  private static stemRunInterval = 10000; // ms
  private static globalSettings: GlobalSettings;

  // I can't find the cause, but something causes many of these functions
  // to run multiple times. To fix this, function execution times are
  // tracked below and functions are ran through the `throttle` function
  // to determine if they should execute again based on their previous
  // execution time.
  private static lastIsCorrectNotification = Date.now();
  private static lastStemNotification = Date.now();
  private static lastRun = Date.now();
  private static ResembleLastRun = Date.now();
  private static lastCheck = Date.now();

  // Number of sites UrlSettings checks before it marks a stem as dark
  public static MinDarkSites = 5;

  constructor(inputGlobalSettings: GlobalSettings) {
    AutoDark.globalSettings = inputGlobalSettings;
  }

  public check(url: Url, urlSettings: UrlSettings, lightCallback: () => void): void {
    if (
      url.getShouldAutoDark() &&
      urlSettings.checkDarkModeIsUndefined(url) &&
      urlSettings.checkDarkModeStemIsUndefined(url) &&
      AutoDark.globalSettings.checkAutoDark() &&
      !AutoDark.throttle(AutoDark.lastCheck, AutoDark.runInterval) &&
      !urlSettings.getCheckedAutoDark(url)
    ) {
      AutoDark.measureBrightnessOfCurrentTab(
        url,
        urlSettings,
        AutoDark.parseBrightness,
      );
      AutoDark.lastCheck = Date.now();
    }
  }

  public static measureBrightnessOfCurrentTab(
    url: Url,
    urlSettings: UrlSettings,
    brightnessCallback: (Url, num: number) => void,
  ) {
    // captureVisibleTab cannot capture screenshots of background tabs
    // so the url we are checking must match the current url
    // if (
    //   currentUrl.getFull() === url.getFull() &&
    //   !AutoDark.throttle(AutoDark.ResembleLastRun, AutoDark.runInterval)
    // ) {
    //   chrome.tabs.captureVisibleTab(screenshot => {
    //     resemble(screenshot).onComplete(data => {
    //       urlSettings.setCheckedAutoDark(url);
    //       AutoDark.ResembleLastRun = Date.now();
    //       brightnessCallback(url, data.brightness);
    //     });
    //   });
    // }
  }

  public static throttle(lastRun: number, interval: number) {
    if (Date.now() < interval + lastRun) {
      return true;
    }
    return false;
  }

  public static parseBrightness(url: Url, brightness: number) {
    // If the page is light, toggle the page to darkness
    if (
      brightness > AutoDark.brightnessThreshold &&
      !AutoDark.throttle(AutoDark.lastRun, AutoDark.runInterval)
    ) {
      ContentAction.toggleDarkMode(url);
      AutoDark.startNotifications(url);
    }
    AutoDark.lastRun = Date.now();
  }

  public static startNotifications(url: Url) {
    if (AutoDark.globalSettings.checkShowNotifications()) {
      AutoDark.pageLooksCorrectNotification(url);
    }
  }

  public static pageLooksCorrectNotification(url: Url) {
    if (
      !AutoDark.throttle(
        AutoDark.lastIsCorrectNotification,
        AutoDark.runInterval,
      )
    ) {
      AutoDark.lastIsCorrectNotification = Date.now();
      chrome.notifications.create(
        "",
        {
          buttons: [{ title: "Yes" }, { title: "No" }],
          iconUrl: "img/dark-mode-on-128.png",
          message: "Does this page look right?",
          title: "Dark Mode",
          type: "basic",
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((
            notifId,
            buttonIndex,
            ) => {
            // Yes Click
            if (buttonIndex === 0) {
              chrome.notifications.clear(notifId);
              AutoDark.toggleStemNotification(url);
            }

            // No Click
            if (buttonIndex === 1) {
              ContentAction.toggleDarkMode(url);
              chrome.notifications.clear(notifId);
            }
          });
        },
      );
    }
  }

  public static toggleStemNotification(currentUrl: Url) {
    if (
      !AutoDark.throttle(
        AutoDark.lastStemNotification,
        AutoDark.stemRunInterval,
      )
    ) {
      AutoDark.lastStemNotification = Date.now();
      chrome.notifications.create(
        "",
        {
          buttons: [{ title: "Yes" }, { title: "No" }],
          iconUrl: "img/dark-mode-on-128.png",
          message: "Turn off dark mode for all " + currentUrl.getDomain() + " urls?",
          title: "Dark Mode",
          type: "basic",
        },
        (notificationId) => {
          chrome.notifications.onButtonClicked.addListener((
            notifId,
            buttonIndex,
            ) => {
            // Yes Click
            if (buttonIndex === 0) {
              ContentAction.toggleDarkModeStem(currentUrl);
              chrome.notifications.clear(notifId);
            } else {
              chrome.notifications.clear(notifId);
            }
          });
        },
      );
    }
  }
}

export default AutoDark;
