/*
 *  ____             _      __  __           _
 * |  _ \  __ _ _ __| | __ |  \/  | ___   __| | ___
 * | | | |/ _` | '__| |/ / | |\/| |/ _ \ / _` |/ _ \
 * | |_| | (_| | |  |   <  | |  | | (_) | (_| |  __/
 * |____/ \__,_|_|  |_|\_\ |_|  |_|\___/ \__,_|\___|
 *
 * Copyright (c) 2015-present, Andrew Simms
 * Author: Andrew Simms <simms.andrew@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
    ) => {
      if (
        message.Sender === sender &&
        message.Receiver === receiver &&
        message.Intent === intent
      ) {
        if (typeof msgSender.tab !== "undefined") {
          callback(message, msgSender.tab.id, msgSender.frameId);
        }
        callback(message);
      }
    });
  }
}
