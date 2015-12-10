//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="Message.ts" />

//  End Typings ------------------------------------------------------------ }}}

class ContentSender extends Message {
    static sendUrl(url: string){
        console.log("Sending url: " + url + " to background");
        Message.send(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitContent,
            url
        );
    }

    static sendCheckAutoDark(url: string){
        Message.send(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitAutoDark,
            url
        );
    }
}
