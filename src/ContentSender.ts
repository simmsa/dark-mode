//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="Message.ts" />

//  End Typings ------------------------------------------------------------ }}}

class ContentSender extends Message {
    static sendUrl(url: string, frameUrl: string){
        Message.send(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitContent,
            {
                Url: url,
                FrameUrl: frameUrl
            }
        );
    }

    static sendCheckAutoDark(url: string, frameUrl: string){
        Message.send(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitAutoDark,
            {
                Url: url,
                FrameUrl: frameUrl
            }
        );
    }
}
