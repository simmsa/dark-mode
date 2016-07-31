//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="Message.ts" />

//  End Typings ------------------------------------------------------------ }}}

class ContentSender extends Message {
    static sendUrl(url: string, parentUrl: string){
        Message.send(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitContent,
            {
                Url: url,
                ParentUrl: parentUrl
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
