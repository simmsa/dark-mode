class MessageSender {
    sender: string;

    constructor(sender){
        this.sender = sender;
    }

    sendMessage(group: string, field: string, value?: any){
        var message = {
            Sender: this.sender,
            Group: group,
            Field: field,
        }

        if(value){
            message["Value"] = value;
        }

        // chrome.runtime.sendMessage(message);
        console.log("Sending message from: " + this.sender);
        console.log(message);
    }
}
