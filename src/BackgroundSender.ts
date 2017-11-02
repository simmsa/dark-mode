import Message from "./Message";
import State from "./State";

// tslint:disable:no-console
const debug = false;

class BackgroundSender extends Message {
  public static sendState(state: State) {
    const dataPackage = state.pack();
    if (debug) {
      console.log("Sending state to popup");
    }
    if (debug) {
      console.log(dataPackage);
    }
    Message.send(
      Message.Sender.Background,
      Message.Receiver.Popup,
      Message.Intent.SendState,
      dataPackage,
    );
  }
}

export default BackgroundSender;
