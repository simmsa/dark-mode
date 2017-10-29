// Define a message standard
export default class Message {

  // Reasons for sending a message
  // tslint:disable:object-literal-sort-keys
  public static Intent = {
    InitPopup: "InitPopup",
    InitContent: "InitContent",
    InitAutoDark: "InitAutoDark",

    ToggleField: "ToggleField",
    ChangeField: "ChangeField",
    ResetGroup: "ResetGroup",

    RequestState: "RequestState",
    SendState: "SendState",
  };

  public static Sender = {
    ContentPage: "ContentPageSender",
    Background: "BackgroundSender",
    Popup: "PopupSender",
  };

  public static Receiver = {
    ContentPage: "ContentPageReceiver",
    Background: "BackgroundReceiver",
    Popup: "PopupReceiver",
  };

  public static format(sender: string, receiver: string, intent: string, data: any) {
    return {
      Sender: sender,
      Receiver: receiver,
      Intent: intent,
      Data: data,
    };
  }

  public static send(sender: string, receiver: string, intent: string, data: any) {
    chrome.runtime.sendMessage(Message.format(sender, receiver, intent, data));
  }

  public static receive(
    sender: string,
    receiver: string,
    intent: string,
    callback: (message: any, tabId?: number, frameId?: number) => void,
  ) {
    chrome.runtime.onMessage.addListener((
      message,
      msgSender,
      response,
    ) => {
      if (
        message.Sender === sender &&
        message.Receiver === receiver &&
        message.Intent === intent
      ) {
        if (typeof msgSender.tab !== "undefined") {
          callback(message, msgSender.tab.id, msgSender.frameId);
          return;
        }
        callback(message);
      }
    });
  }
}
