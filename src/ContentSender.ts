import Message from "./Message";

export default class ContentSender extends Message {
  public static sendUrl(url: string, parentUrl: string) {
    Message.send(
      Message.Sender.ContentPage,
      Message.Receiver.Background,
      Message.Intent.InitContent,
      {
        ParentUrl: parentUrl,
        Url: url,
      },
    );
  }

  public static sendCheckAutoDark(url: string, frameUrl: string) {
    Message.send(
      Message.Sender.ContentPage,
      Message.Receiver.Background,
      Message.Intent.InitAutoDark,
      {
        FrameUrl: frameUrl,
        Url: url,
      },
    );
  }
}
