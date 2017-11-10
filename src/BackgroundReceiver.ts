import AutoDark from "./AutoDark";
import BackgroundSender from "./BackgroundSender";
import ContentAction from "./ContentAction";
import GlobalSettings from "./GlobalSettings";
import Message from "./Message";
import SettingId from "./SettingId";
import State from "./State";
import Url from "./Url";
import UrlSettings from "./UrlSettings";
import UrlTree from "./UrlTree";

// tslint:disable:no-console
const debug = false;
class BackgroundReceiver extends Message {
  private static currentUrl: Url;
  private static globalSettings: GlobalSettings;
  private static state: State;
  private static urlTree: UrlTree;
  private static urlSettings: UrlSettings;
  private static autoDark: AutoDark;

  public static init(
    inputUrlTree: UrlTree,
    inputCurrentUrl: Url,
    inputUrlSettings: UrlSettings,
    inputGlobalSettings: GlobalSettings,
    inputState: State,
  ) {
    BackgroundReceiver.urlTree = inputUrlTree;
    BackgroundReceiver.currentUrl = inputCurrentUrl;
    BackgroundReceiver.urlSettings = inputUrlSettings;
    BackgroundReceiver.globalSettings = inputGlobalSettings;
    BackgroundReceiver.state = inputState,
    BackgroundReceiver.autoDark = new AutoDark(inputGlobalSettings);
    BackgroundReceiver.receiveContentUrl();
    BackgroundReceiver.receiveAutoDark();
    BackgroundReceiver.receiveRequestState();
    BackgroundReceiver.receivePopupToggle();
    BackgroundReceiver.receivePopupClear();
    BackgroundReceiver.receiveChangeField();
  }

  //  Receive Content Url ------------------------------------------------ {{{

  public static receiveContentUrl() {
    Message.receive(
      Message.Sender.ContentPage,
      Message.Receiver.Background,
      Message.Intent.InitContent,
      BackgroundReceiver.handleReceiveContentUrl,
    );
  }

  public static handleReceiveContentUrl(message: any, tabId: number | undefined, frameId: number | undefined) {
    if (tabId !== undefined && frameId !== undefined) {
      BackgroundReceiver.urlTree.updateTab(tabId, () => {
        ContentAction.checkDarkMode(new Url(message.Data.Url), tabId, frameId);
      });
    }
  }

  //  End Receive Content Url -------------------------------------------- }}}
  //  Receive Auto Dark Init --------------------------------------------- {{{

  public static receiveAutoDark() {
    Message.receive(
      Message.Sender.ContentPage,
      Message.Receiver.Background,
      Message.Intent.InitAutoDark,
      BackgroundReceiver.handleReceiveAutoDark,
    );
  }

  public static handleReceiveAutoDark(message: any) {
    // Check if:
    // The url exists
    // Running from parent frame
    // The url is also the current url, making sure not to take a
    // screenshot of a background page
    if (debug) {
      console.log(
        'typeof(message.Data.Url) != "undefined":\t\t\t\t',
        typeof message.Data.Url !== "undefined",
      );
      console.log(
        "message.Data.Url === message.Data.FrameUrl:\t\t\t\t",
        message.Data.Url === message.Data.FrameUrl,
      );
      console.log(
        "message.Data.Url === currentUrl.getFull():\t\t\t\t",
        message.Data.Url === BackgroundReceiver.currentUrl.getFull(),
      );
      console.log("");
    }

    if (
      typeof message.Data.Url !== "undefined" &&
      message.Data.Url === message.Data.FrameUrl &&
      message.Data.Url === BackgroundReceiver.currentUrl.getFull()
    ) {
      BackgroundReceiver.autoDark.check(BackgroundReceiver.currentUrl, BackgroundReceiver.urlSettings);
    }
  }

  //  End Receive Auto Dark Init ----------------------------------------- }}}
  //  Receive Request State ---------------------------------------------- {{{

  public static receiveRequestState() {
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.RequestState,
      BackgroundReceiver.handleRequestState,
    );
  }

  // public static handleRequestState(message: any) {
  public static handleRequestState() {
    BackgroundReceiver.state.update(
      BackgroundReceiver.currentUrl, BackgroundReceiver.urlSettings, BackgroundReceiver.globalSettings, () => {
      BackgroundSender.sendState(BackgroundReceiver.state);
    });
  }

  //  End Receive Request State ------------------------------------------ }}}
  //  Receive Popup Toggle ---------------------------------------------- {{{

  public static receivePopupToggle() {
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ToggleField,
      BackgroundReceiver.handlePopupToggle,
    );
  }

  public static handlePopupToggle(message) {
    switch (message.Data.Group) {
      // Current Url Toggle
      case SettingId.Group.CurrentUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Dark:
            ContentAction.toggleDarkMode(BackgroundReceiver.currentUrl);
            break;
          case SettingId.Field.Hue:
            ContentAction.toggleHue(BackgroundReceiver.currentUrl);
            break;
        }
        break;
      // Stem Url Toggle
      case SettingId.Group.StemUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Dark:
            ContentAction.toggleDarkModeStem(BackgroundReceiver.currentUrl);
            break;
          case SettingId.Field.Hue:
            ContentAction.toggleHueStem(BackgroundReceiver.currentUrl);
            break;
        }
        break;
      // Global Toggle
      case SettingId.Group.Global:
        switch (message.Data.Field) {
          case SettingId.Field.AutoDark:
            BackgroundReceiver.globalSettings.toggleAutoDark();
            break;
          case SettingId.Field.LogAutoDark:
            BackgroundReceiver.globalSettings.toggleLogAutoDark();
            break;
          case SettingId.Field.Dark:
            BackgroundReceiver.globalSettings.toggleDark();
            break;
          case SettingId.Field.ShowNotifications:
            BackgroundReceiver.globalSettings.toggleShowNotifications();
            break;
          case SettingId.Field.Hue:
            BackgroundReceiver.globalSettings.toggleHue();
            break;
        }
        break;
    }
    BackgroundReceiver.updatePopupAndContent();
  }

  public static updatePopupAndContent() {
    BackgroundReceiver.state.update(
      BackgroundReceiver.currentUrl, BackgroundReceiver.urlSettings, BackgroundReceiver.globalSettings, () => {
      BackgroundSender.sendState(BackgroundReceiver.state);
      ContentAction.checkDarkModeForActiveTab(BackgroundReceiver.currentUrl);
    });
  }

  //  End Receive Popup Toggle ------------------------------------------ }}}
  //  Receive Popup Clear ----------------------------------------------- {{{

  public static receivePopupClear() {
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ResetGroup,
      BackgroundReceiver.handleReceivePopupClear,
    );
  }

  public static handleReceivePopupClear(message) {
    if (debug) {
      console.log("Received popupClear message in destination!");
    }
    if (debug) {
      console.log("message:");
    }
    if (debug) {
      console.log(message);
    }
    switch (message.Data) {
      case SettingId.Group.CurrentUrl:
        BackgroundReceiver.urlSettings.clearUrl(BackgroundReceiver.currentUrl);
        BackgroundReceiver.updatePopupAndContent();
        break;
      case SettingId.Group.StemUrl:
        BackgroundReceiver.urlSettings.clearUrlStem(BackgroundReceiver.currentUrl);
        BackgroundReceiver.updatePopupAndContent();
        break;
      case SettingId.Group.Global:
        // TODO:
        // This should clear urlSettings.
        break;
    }
  }

  //  End Receive Popup Clear ------------------------------------------- }}}
  //  Receive Change Field ---------------------------------------------- {{{

  public static receiveChangeField() {
    if (debug) {
      console.log("receiveChangeField");
    }
    Message.receive(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ChangeField,
      BackgroundReceiver.handleReceiveChangeField,
    );
  }

  public static handleReceiveChangeField(message) {
    switch (message.Data.Group) {
      case SettingId.Group.CurrentUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Contrast:
            // Set Contrast value
            BackgroundReceiver.urlSettings.setContrast(BackgroundReceiver.currentUrl, message.Data.Value);
            break;
        }
        break;
      case SettingId.Group.StemUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Contrast:
            // Set Contrast value for stem
            BackgroundReceiver.urlSettings.setContrastStem(BackgroundReceiver.currentUrl, message.Data.Value);
            break;
        }
        break;
    }

    ContentAction.checkDarkModeForActiveTab(BackgroundReceiver.currentUrl);
  }

  //  End Receive Change Field ------------------------------------------ }}}
}

export default BackgroundReceiver;
