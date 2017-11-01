import Message from "./Message";
import SettingId from "./SettingId";

// tslint:disable:no-console
const debug = false;
class BackgroundReceiver extends Message {
  private static urlTree: UrlTree;

  public static init(inputUrlTree: UrlTree) {
    BackgroundReceiver.urlTree = inputUrlTree;
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

  public static handleReceiveContentUrl(message: any, tabId: number, frameId: number) {
    if (tabId !== undefined && frameId !== undefined) {
      urlTree.updateTab(tabId, () => {
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

  public static handleReceiveAutoDark(message: any, tabId: number) {
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
        message.Data.Url === currentUrl.getFull(),
      );
      console.log("");
    }

    if (
      typeof message.Data.Url !== "undefined" &&
      message.Data.Url === message.Data.FrameUrl &&
      message.Data.Url === currentUrl.getFull()
    ) {
      autoDark.check(currentUrl, urlSettings, () => {
        ContentAction.toggleDarkMode(currentUrl);
      });
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
    state.update(currentUrl, urlSettings, globalSettings, () => {
      BackgroundSender.sendState();
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
            ContentAction.toggleDarkMode(currentUrl);
            break;
          case SettingId.Field.Hue:
            ContentAction.toggleHue(currentUrl);
            break;
        }
        break;
      // Stem Url Toggle
      case SettingId.Group.StemUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Dark:
            ContentAction.toggleDarkModeStem(currentUrl);
            break;
          case SettingId.Field.Hue:
            ContentAction.toggleHueStem(currentUrl);
            break;
        }
        break;
      // Global Toggle
      case SettingId.Group.Global:
        switch (message.Data.Field) {
          case SettingId.Field.AutoDark:
            globalSettings.toggleAutoDark();
            break;
          case SettingId.Field.LogAutoDark:
            globalSettings.toggleLogAutoDark();
            break;
          case SettingId.Field.Dark:
            globalSettings.toggleDark();
            BackgroundReceiver.updatePopupAndContent();
            break;
          case SettingId.Field.ShowNotifications:
            globalSettings.toggleShowNotifications();
            BackgroundReceiver.updatePopupAndContent();
            break;
          case SettingId.Field.Hue:
            globalSettings.toggleHue();
            BackgroundReceiver.updatePopupAndContent();
            break;
        }
        break;
    }
  }

  public static updatePopupAndContent() {
    state.update(currentUrl, urlSettings, globalSettings, () => {
      BackgroundSender.sendState();
      ContentAction.checkDarkModeForActiveTab(currentUrl);
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
        urlSettings.clearUrl(currentUrl);
        BackgroundReceiver.updatePopupAndContent();
        break;
      case SettingId.Group.StemUrl:
        urlSettings.clearUrlStem(currentUrl);
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
            urlSettings.setContrast(currentUrl, message.Data.Value);
            break;
        }
        break;
      case SettingId.Group.StemUrl:
        switch (message.Data.Field) {
          case SettingId.Field.Contrast:
            // Set Contrast value for stem
            urlSettings.setContrastStem(currentUrl, message.Data.Value);
            break;
        }
        break;
    }

    ContentAction.checkDarkModeForActiveTab(currentUrl);
  }

  //  End Receive Change Field ------------------------------------------ }}}
}

export default BackgroundReceiver;
