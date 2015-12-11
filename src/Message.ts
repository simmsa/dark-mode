//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />

//  End Typings ------------------------------------------------------------ }}}

class Message {
    // Define a message standard

    // Reasons for sending a message
    static Intent = {
        InitPopup: "InitPopup",
        InitContent: "InitContent",
        InitAutoDark: "InitAutoDark",

        ToggleField: "ToggleField",
        ChangeField: "ChangeField",
        ResetGroup: "ResetGroup",

        RequestState: "RequestState",
        SendState: "SendState",
    };

    static Sender = {
        ContentPage: "ContentPageSender",
        Background: "BackgroundSender",
        Popup: "PopupSender"
    };

    static Receiver = {
        ContentPage: "ContentPageReceiver",
        Background: "BackgroundReceiver",
        Popup: "PopupReceiver"
    };

    static format(sender: string, receiver: string, intent: string, data: any){
        return {
            Sender: sender,
            Receiver: receiver,
            Intent: intent,
            Data: data
        };
    }

    static send(sender: string, receiver: string, intent: string, data: any){
        chrome.runtime.sendMessage(Message.format(
            sender,
            receiver,
            intent,
            data
        ));
    }

    static receive(sender: string, receiver: string, intent: string, callback: (message: any, tabId?: number) => void){
        chrome.runtime.onMessage.addListener(function(message, msgSender, response){
            if(message.Sender === sender &&
               message.Receiver === receiver &&
               message.Intent === intent){
                console.log("Verified message with intent: " + message.Intent);
                if(typeof(msgSender.tab) !== "undefined"){
                    console.log("Running intent " + message.Intent + " with tab.id of: " + msgSender.tab.id);
                    callback(message, msgSender.tab.id);
                }
                callback(message);
            }
        });
    }
}
