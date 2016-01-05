// Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />
/// <reference path="SettingId.ts" />
/// <reference path="Message.ts" />
/// <reference path="DefaultState.ts" />
/// <reference path="CssBuilder.ts" />

//  End Typings ------------------------------------------------------------ }}}
// PersistentStorage Class ------------------------------------------------ {{{

class PersistentStorage {
    protected dataObject: any;
    private name: string;

    private lastSave: number;

    constructor(name: string) {
        this.setData(name);
        this.lastSave = Date.now();
    }

    private setData(savedObjectName: string) {
        this.name = savedObjectName;
        // Special syntax for using `this` inside a callback
        chrome.storage.local.get(savedObjectName, (result) => {
            this.dataObject = result[this.name];

            // Guard against undefined `dataObject`
            if(typeof(this.dataObject) === "undefined"){
                this.dataObject = {};
            }
        });
    }

    protected getAll(): any {
        return this.dataObject;
    }

    protected get(key: string): any{
        try{
            return this.dataObject[key];
        } catch (e){
            if(debug) { console.log(key + " does not exist in PersistentStorage object named: " + this.name); }
        }
    }

    protected add(key: string, data: any){
        this.dataObject[key] = data;
    }

    protected exists(key: string, object: any): boolean{
        if(object.hasOwnProperty(key)){
            return true;
        }
        return false;
    }

    protected remove(key: string){
        if(this.exists(key, this.dataObject)){
            delete this.dataObject[key];
        }
    }

    protected save(){
        var saveIntervalMs = 100;
        if(Date.now() > this.lastSave + saveIntervalMs){
            chrome.storage.local.remove(this.name);
            if(debug) { console.log("Saving: " + this.name); }
            var saveObject = {}
            saveObject[this.name] = this.dataObject;
            if(debug) { console.log(saveObject); }
            chrome.storage.local.set(saveObject);
            this.lastSave = Date.now();
        }
    }

    protected clear(){
        chrome.storage.local.remove(this.name);
        this.setData(this.name);
    }
}

// End PersistentStorage Class -------------------------------------------- }}}
// UrlSettings Class ------------------------------------------------------ {{{

// I would like to put this inside the `UrlSettings` class but typescript does
// not allow this.
enum QueryResult {True, False, Undefined };

class UrlSettings extends PersistentStorage {
    fields: any;

    constructor(){
        super("urlInfo");
        // List the fields that exist and can be accessed
        this.fields = {
            "darkMode": {
                "name": "darkMode",
                "type": "boolean"
            },
            "hueRotate": {
                "name": "hueRotate",
                "type": "boolean"
            }
        }
    }

    private getSettings(): any{
        return this.dataObject;
    }

    private returnQueryResultIfBool(input: any): any {
        if(input === true){
            return QueryResult.True;
        } else if (input === false){
            return QueryResult.False;
        } else {
            return input;
        }
    }

    private checkUrlStem(url: Url): QueryResult{
        var urlStem = url.getStem();
        if(this.exists(urlStem, this.dataObject)){
            return QueryResult.True;
        }
        return QueryResult.Undefined;
    }

    private checkUrlForField(url: Url, field: string): QueryResult {
        var urlStem = url.getStem();
        var cleanedUrl = url.getNormal();
        if(this.exists(urlStem, this.dataObject)){
            if(this.exists(cleanedUrl, this.dataObject[urlStem])){
                if(this.exists(field, this.dataObject[urlStem][cleanedUrl])){
                     return this.returnQueryResultIfBool(this.dataObject[urlStem][cleanedUrl][field]);
                }
            }
        }
        return QueryResult.Undefined;
    }

    private checkUrlStemForField(url: Url, field: string): QueryResult{
        var urlStem = url.getStem();
        if(this.exists(urlStem, this.dataObject)){
            if(this.exists(field, this.dataObject[urlStem])){
                return this.returnQueryResultIfBool(this.dataObject[urlStem][field]);
            }
        }
        return QueryResult.Undefined;
    }

    private checkUrlStemForUrl(url: Url): QueryResult{
        var urlStem = url.getStem();
        var cleanedUrl = url.getNormal();
        if(this.exists(urlStem, this.dataObject)){
            if(this.exists(cleanedUrl, this.dataObject[urlStem])){
                return QueryResult.True;
            }
        }
        return QueryResult.Undefined;
    }

    private checkUrlForFieldBool(url: Url, field: string, resultIfUndefined: boolean): boolean {
        // Various scenarios for checking bool fields.
        //  Url Query Result | Url Stem Query Result | Result            |
        //  ---              | ---                   | ---               |
        //  Undef            | Undef                 | resultIfUndefined |
        //  Undef            | True                  | True              |
        //  True             | True                  | True              |
        //  True             | Undef                 | True              |
        //  False            | True                  | False             |
        //  False            | Undef                 | False             |
        //  Undef            | False                 | False             |
        //  True             | False                 | False             |
        //  False            | False                 | False             |

        var urlResult = this.checkUrlForField(url, field);
        var urlStemResult = this.checkUrlStemForField(url, field);

        if(debug) { console.log("Url is: " + QueryResult[urlResult] + ", Url Stem is: " + QueryResult[urlStemResult]); }

        // The default case: both fields are undefined, return the default value
        if(urlResult === QueryResult.Undefined && urlStemResult === QueryResult.Undefined){
            return resultIfUndefined;
        }

        // True Results
        if(urlResult === QueryResult.Undefined && urlStemResult === QueryResult.True){
            return true;
        }
        if(urlResult === QueryResult.True && urlStemResult === QueryResult.True){
            return true;
        }
        if(urlResult === QueryResult.True && urlStemResult === QueryResult.Undefined){
            return true;
        }
        if(urlResult === QueryResult.True && urlStemResult === QueryResult.False){
            return true;
        }

        // False Results
        if(urlResult === QueryResult.False && urlStemResult === QueryResult.True){
            return false;
        }
        if(urlResult === QueryResult.False && urlStemResult === QueryResult.Undefined){
            return false;
        }
        if(urlResult === QueryResult.Undefined && urlStemResult === QueryResult.False){
            return false;
        }
        if(urlResult === QueryResult.False && urlStemResult === QueryResult.False){
            return false;
        }
        if(debug) { console.log("Error: checkWhitelist returned without a result"); }
        return;
    }

    private checkUrlStemForFieldBool(url: Url, field: string, defaultValue: boolean): boolean {
        var result = this.checkUrlStemForField(url, field);

        switch(result){
            case QueryResult.Undefined:
                return defaultValue;
                break;
            case QueryResult.True:
                return true;
                break;
            case QueryResult.False:
                return false;
                break;
        }
    }

    checkDarkMode(url: Url): boolean{
        // If the stem and the url are undefined turn dark mode ON!
        return this.checkUrlForFieldBool(url, this.fields.darkMode.name, true);
    }

    checkDarkModeStem(url: Url): boolean{
        return this.checkUrlStemForFieldBool(url, this.fields.darkMode.name, true);
    }

    // Special case for auto dark detection
    checkDarkModeIsUndefined(url: Url): boolean{
        var result = this.checkUrlForField(url, this.fields.darkMode.name);
        if(result === QueryResult.Undefined){
            return true;
        }
        return false;
    }

    checkHueRotate(url: Url): boolean{
        // If the stem and the url are undefined turn hue rotate ON!
        return this.checkUrlForFieldBool(url, this.fields.hueRotate.name, true);
    }

    checkHueRotateStem(url: Url): boolean{
        return this.checkUrlStemForFieldBool(url, this.fields.hueRotate.name, true);
    }

    getContrast(url: Url): number {
        var result = this.checkUrlForField(url, SettingId.Field.Contrast);
        var stemResult = this.checkUrlStemForField(url, SettingId.Field.Contrast);
        if(result !== QueryResult.Undefined){
            return result;
        } else if (stemResult !== QueryResult.Undefined){
            return stemResult;
        }
        return SettingId.Default.Contrast;
    }

    getContrastStem(url: Url): number {
        var result = this.checkUrlStemForField(url, SettingId.Field.Contrast);
        if(result !== QueryResult.Undefined){
            return result;
        }
        return SettingId.Default.Contrast;
    }

    setContrast(url: Url, value: number){
        this.setUrlFieldToValue(url, SettingId.Field.Contrast, value, SettingId.Type.Contrast, SettingId.Default.Contrast);
    }

    setContrastStem(url: Url, value: number){
        this.setUrlStemFieldToValue(url, SettingId.Field.Contrast, value, SettingId.Type.Contrast, SettingId.Default.Contrast);
    }

    // Helper function for toggle
    private isQueryUndefined(input: QueryResult){
        if(input === QueryResult.Undefined){
            return true;
        }
        return false;
    }

    // Helper function for toggle
    private allArgsFalse(...input: boolean[]){
        for(var i = 0; i <= arguments.length; i++){
            if(arguments[i] === true){
                return false;
            }
        }
        return true;
    }

    private checkFieldIsBoolean(field: string){
        if(this.fields[field].type != "boolean"){
            throw new Error("Cannot toggle UrlSettings field: " + field + " because it is not of type boolean!");
        }
    }

    private setUrlFieldToValue(url: Url, field: string, value: any, valueType: string, defaultValue: any, choice?: string){

        // Verify the value we are setting matches the type that should be set
        if(typeof(value) != valueType){
            if(debug) { console.log("Aborting setFieldToValue. value's type does not match " + valueType); }
        }
        // Testing which fields are undefined
        // Check if stem exists
        // Check if stem -> url exists
        // Check if stem -> url -> field exists
        var stem = this.isQueryUndefined(this.checkUrlStem(url));
        var stem_Url = this.isQueryUndefined(this.checkUrlStemForUrl(url));
        var stem_Url_Field = this.isQueryUndefined(this.checkUrlForField(url, field));

        var urlStem = url.getStem();
        var cleanedUrl = url.getNormal();

        var isNotUndefined = this.allArgsFalse(true, true);

        if(debug) { console.log("stem: " + stem); }
        if(debug) { console.log("stem_Url: " + stem_Url); }
        if(debug) { console.log("stem_Url_Field: " + stem_Url_Field); }

        // The value exists, successfully run toggle
        if(this.allArgsFalse(stem, stem_Url, stem_Url_Field)){
            if(choice === "toggle"){
                this.dataObject[urlStem][cleanedUrl][field] = !this.dataObject[urlStem][cleanedUrl][field];
            } else {
                this.dataObject[urlStem][cleanedUrl][field] = value;
            }
        }

        // There is a stem and a url but no matching field
        else if(this.allArgsFalse(stem, stem_Url)){
            // Create the field and insert the default value
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }

        // There is only a stem
        else if(this.allArgsFalse(stem)){
            // Create the url within the stem and add the field
            this.dataObject[urlStem][cleanedUrl] = {};
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }

        // The is no record of the url
        else {
            this.dataObject[urlStem] = {};
            this.dataObject[urlStem][cleanedUrl] = {};
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }
        this.save();
    }

    private toggleUrl(url: Url, field: string, defaultValue: boolean){
        this.setUrlFieldToValue(url, field, defaultValue, "boolean", defaultValue, "toggle");
    }

    private setUrlStemFieldToValue(url: Url, field: string, value: any, valueType: string, defaultValue: any, choice?: string){

        // Verify the value we are setting matches the type that should be set
        if(typeof(value) != valueType){
            if(debug) { console.log("Aborting setFieldToValue. value's type does not match " + valueType); }
        }

        // Check if stem exists
        // Check if stem -> field exists
        var stem = this.isQueryUndefined(this.checkUrlStem(url));
        var stem_Field = this.isQueryUndefined(this.checkUrlStemForField(url, field));

        var urlStem = url.getStem();

        // The stem -> field exists, run toggle
        if(this.allArgsFalse(stem, stem_Field)){
            if(choice === "toggle"){
                this.dataObject[urlStem][field] = !this.dataObject[urlStem][field];
            } else {
                this.dataObject[urlStem][field] = value;
            }
        }

        // The stem exists but the field doesn't
        else if(this.allArgsFalse(stem)){
            this.dataObject[urlStem][field] = defaultValue;
        }

        // The is no record of the url Stem
        else {
            this.dataObject[urlStem] = {};
            this.dataObject[urlStem][field] = defaultValue;
        }
        this.save();
    }

    private toggleUrlStem(url: Url, field: string, defaultValue: boolean){
        this.setUrlStemFieldToValue(url, field, defaultValue, "boolean", defaultValue, "toggle");
    }

    toggleDarkMode(url: Url){
        // Dark mode is always on (true), so when it is toggled for the first
        // time set the value to off (false)
        this.toggleUrl(url, this.fields.darkMode.name, false);
    }

    toggleDarkModeStem(url: Url){
        this.toggleUrlStem(url, this.fields.darkMode.name, false);
    }

    toggleHueRotate(url: Url){
        this.toggleUrl(url, this.fields.hueRotate.name, false);
    }

    toggleHueRotateStem(url: Url){
        this.toggleUrlStem(url, this.fields.hueRotate.name, false);
    }

    // stem
    private removeStem(url: Url){
        delete this.dataObject[url.getStem()];
        this.save();
    }

    // stem -> field
    private removeStemField(url: Url, field: string){
        delete this.dataObject[url.getStem()][this.fields[field].name];
        this.save();
    }

    // stem -> url
    private removeUrl(url: Url){
        delete this.dataObject[url.getStem()][url.getNormal()];
        this.save();
    }

    // stem -> url -> field
    private removeField(url: Url, field: string){
        delete this.dataObject[url.getStem()][url.getNormal()][this.fields[field].name];
        this.save();
    }

    clearUrl(url: Url){
        this.removeUrl(url);
    }

    clearUrlStem(url: Url){
        this.removeStem(url);
    }

    clearDarkMode(url: Url){
        this.removeField(url, this.fields.darkMode.name);
    }

    clearDarkModeStem(url: Url){
        this.removeStemField(url, this.fields.darkMode.name);
    }

    clearHueRotate(url: Url){
        this.removeField(url, this.fields.hueRotate.name);
    }

    clearHueRotateStem(url: Url){
        this.removeStemField(url, this.fields.hueRotate.name);
    }

    getUrlState(url: Url): any{
        var result = {};

        result[SettingId.Field.Dark] = this.checkDarkMode(url);
        result[SettingId.Field.Hue] = this.checkHueRotate(url);
        result[SettingId.Field.Contrast] = this.getContrast(url);

        return result;
    }
}

// End UrlSettings Class -------------------------------------------------- }}}
// Url Class -------------------------------------------------------------- {{{

class Url {
    // Example input url: https://www.google.com/search?q=test
    stem: string; // https://www.google.com -> protocol + hostname
    domain: string; // google.com -> domain
    normal: string; // https://www.google.com/search -> protocol + hostname + path, no query or fragment strings
    full: string; // everything

    shouldUpdateMenu: boolean;
    shouldAutoDark: boolean;

    defaultUrl = "about:blank";

    updateBlacklist = [
        "chrome://",
        "chrome-extension://",
        "about:blank"
    ];

    parseBlacklist = [
        "chrome://",
        "chrome-extension://",
        "file://"
    ];

    autoDarkModeBlacklist = [
        ".pdf"
    ];

    constructor(newUrl?: string){
        if(newUrl){
            this.parse(newUrl);
        } else {
            this.parse(this.defaultUrl);
        }
    }

    update(callback?: () => void) {
        if(debug) { console.log("Updating URL class url!"); }
        try {
            chrome.tabs.query({currentWindow: true, active: true}, (tabs) => {
                try{
                    this.parse(tabs[0].url);
                } catch (e){
                    if(debug) { console.log("There is no valid url in tabs object: "); }
                    if(debug) { console.log(tabs[0]); }
                    if(debug) { console.log("The error is: " + e); }
                }
                callback();
            });
        } catch (e){
            if(debug) { console.log("Cannot update url: " + e); }
        }
    }

    parse(input: string) {
        // If the url has not changed, do nothing
        if(input === this.full){
            return;
        }

        // Test url against parseBlacklist
        var inParseBlacklist = this.inputInList(input, this.parseBlacklist);
        if(inParseBlacklist.result){
            this.stem = this.domain = this.normal = this.full = this.parseBlacklist[inParseBlacklist.position];
        } else {
            try{
                var url = new URI(input).normalize();
                this.stem = new URI({
                    protocol: url.protocol(),
                    hostname: url.hostname()
                }).toString();

                // If the subdomain is not www start the domain with that
                var subdomain = url.subdomain();
                if(subdomain !== "www" && subdomain.length > 0){
                    this.domain = subdomain + "." + url.domain();
                } else {
                    this.domain = url.domain();
                }

                this.normal = new URI({
                    protocol: url.protocol(),
                    hostname: url.hostname(),
                    path: url.path(),
                }).toString();

                this.full = url.toString();

            } catch (e){
                if(debug) { console.log("Error parsing potential url: " + input + " Error is: " + e); }
                this.stem = this.domain = this.normal = this.full = this.defaultUrl;
            }
        }
        this.setShouldUpdateMenu(input);
        this.setShouldAutoDark(input);
    }

    inputInList(input: string, list: string[]): any{
        for(var i = 0; i <= list.length; i++){
            if(input.indexOf(list[i]) > -1){
                return {result: true, position: i};
            }
        }
        return {result: false, position: -1};
    }

    setShouldAutoDark(input: string){
        this.shouldAutoDark = !this.inputInList(input, this.autoDarkModeBlacklist).result;
    }

    setShouldUpdateMenu(input: string){
        this.shouldUpdateMenu = !this.inputInList(input, this.updateBlacklist).result;
    }

    getStem(): string{
        return this.stem;
    }

    getDomain(): string{
        if(debug) { console.log("Getting domain: " + this.domain); }
        return this.domain;
    }

    getNormal(): string{
        return this.normal;
    }

    getShouldAutoDark(): boolean{
        return this.shouldAutoDark;
    }

    getShouldUpdateMenu(){
        return this.shouldUpdateMenu;
    }
}

// End Url Class ---------------------------------------------------------- }}}
// BackgroundReceiver ------------------------------------------------- {{{

class BackgroundReceiver extends Message {
    static init(){
        BackgroundReceiver.receiveContentUrl();
        BackgroundReceiver.receiveAutoDark();
        BackgroundReceiver.receiveRequestState();
        BackgroundReceiver.receivePopupToggle();
        BackgroundReceiver.receivePopupClear();
        BackgroundReceiver.receiveChangeField();
    }

//  Receive Content Url ------------------------------------------------ {{{

    static receiveContentUrl(){
        Message.receive(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitContent,
            BackgroundReceiver.handleReceiveContentUrl
        );
    }

    static handleReceiveContentUrl(message: any, tabId: number){
        if(message.Data.Url){
            var frameUrl = message.Data.FrameUrl;
            var newUrl = new Url(message.Data.Url);
            ContentAction.checkDarkMode(newUrl, tabId);
        }
    }

//  End Receive Content Url -------------------------------------------- }}}
//  Receive Auto Dark Init --------------------------------------------- {{{

    static receiveAutoDark(){
        Message.receive(
            Message.Sender.ContentPage,
            Message.Receiver.Background,
            Message.Intent.InitAutoDark,
            BackgroundReceiver.handleReceiveAutoDark
        );
    }

    static handleReceiveAutoDark(message: any, tabId: number){
        isPageDark(function(){
            // In the future I plan to have a pop asking if this is correct
            ContentAction.checkDarkMode(currentUrl);
        });
    }

//  End Receive Auto Dark Init ----------------------------------------- }}}
//  Receive Request State ---------------------------------------------- {{{

    static receiveRequestState(){
        Message.receive(
            Message.Sender.Popup,
            Message.Receiver.Background,
            Message.Intent.RequestState,
            BackgroundReceiver.handleRequestState
        );
    }

    static handleRequestState(message: any){
        state.update(currentUrl, urlSettings, function(){
            BackgroundSender.sendState();
        });
    }

//  End Receive Request State ------------------------------------------ }}}
//  Receive Popup Toggle ---------------------------------------------- {{{


    static receivePopupToggle(){
        Message.receive(
            Message.Sender.Popup,
            Message.Receiver.Background,
            Message.Intent.ToggleField,
            BackgroundReceiver.handlePopupToggle
        );
    }

    static handlePopupToggle(message){
        switch(message.Data.Group){
            // Current Url Toggle
            case SettingId.Group.CurrentUrl:
                switch(message.Data.Field){
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
                switch(message.Data.Field){
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
                break;
        }
        state.update(currentUrl, urlSettings, function(){
            BackgroundSender.sendState();
        });
    }

//  End Receive Popup Toggle ------------------------------------------ }}}
//  Receive Popup Clear ----------------------------------------------- {{{


    static receivePopupClear(){
        Message.receive(
            Message.Sender.Popup,
            Message.Receiver.Background,
            Message.Intent.ResetGroup,
            BackgroundReceiver.handleReceivePopupClear
        );
    }

    static handleReceivePopupClear(message){
        if(debug) { console.log("Received popupClear message in destination!"); }
        if(debug) { console.log("message:"); }
        if(debug) { console.log(message); }
        switch(message.Data){
            case SettingId.Group.CurrentUrl:
                urlSettings.clearUrl(currentUrl);
                break;
            case SettingId.Group.StemUrl:
                urlSettings.clearUrlStem(currentUrl);
                break;
            case SettingId.Group.Global:
                // TODO
                break;
        }
        state.update(currentUrl, urlSettings, function(){
            BackgroundSender.sendState();
            ContentAction.checkDarkMode(currentUrl);
        });
    }

//  End Receive Popup Clear ------------------------------------------- }}}
//  Receive Change Field ---------------------------------------------- {{{


    static receiveChangeField(){
        if(debug) { console.log("receiveChangeField"); }
        Message.receive(
            Message.Sender.Popup,
            Message.Receiver.Background,
            Message.Intent.ChangeField,
            BackgroundReceiver.handleReceiveChangeField
        );
    }

    static handleReceiveChangeField(message){
        switch(message.Data.Group){
            case SettingId.Group.CurrentUrl:
                switch(message.Data.Field){
                    case SettingId.Field.Contrast:
                        // Set Contrast value
                        urlSettings.setContrast(currentUrl, message.Data.Value);
                        break;
                }
                break;
            case SettingId.Group.StemUrl:
                switch(message.Data.Field){
                    case SettingId.Field.Contrast:
                        // Set Contrast value for stem
                        urlSettings.setContrastStem(currentUrl, message.Data.Value);
                        break;
                }
                break;
        }
        state.update(currentUrl, urlSettings, function(){
            BackgroundSender.sendState();
            ContentAction.checkDarkMode(currentUrl);
        });
    }

//  End Receive Change Field ------------------------------------------ }}}
}

// End BackgroundReceiver --------------------------------------------- }}}
// BackgroundSender --------------------------------------------------- {{{

class BackgroundSender extends Message{
    static sendState(){
        var dataPackage = state.pack();
        if(debug) { console.log("Sending state to popup"); }
        if(debug) { console.log(dataPackage); }
        Message.send(
            Message.Sender.Background,
            Message.Receiver.Popup,
            Message.Intent.SendState,
            dataPackage
        );
    }
}

// End BackgroundSender ----------------------------------------------- }}}
// State -------------------------------------------------------------- {{{

class State extends DefaultState{

    update(url: Url, settings: UrlSettings, callback: () => void): void{
        this.urlFull = url.getNormal();
        this.urlStem = url.getDomain();

        this.currentUrlDark = settings.checkDarkMode(url);
        this.currentUrlHue = settings.checkHueRotate(url);
        this.currentUrlContrast = settings.getContrast(url);

        // Stem Url Settings
        this.stemUrlDark = settings.checkDarkModeStem(url);
        this.stemUrlHue = settings.checkHueRotateStem(url);
        this.stemUrlContrast = settings.getContrastStem(url);

        // Global Dark Mode Settings
        this.globalDark = true;
        this.globalAutoDark = false;
        this.globalHue = true;
        this.globalContrast = 99;
        this.updateKeyboardShortcut(callback);
    }


    updateKeyboardShortcut(callback: () => void){
        chrome.commands.getAll((commands) => {
            this.globalKeyboardShortcut = commands[1]["shortcut"];
            callback();
        });
    }
}

// End State ---------------------------------------------------------- }}}
// ContentAction ---------------------------------------------------------- {{{

class ContentAction {

    private static updateContentPage(jsString: string, cssString: string, tabId?: number){
        chrome.tabs.getSelected(null, function(tab){
            var executeId = tabId ? tabId : tab.id;

            if(jsString.length > 0){
                console.log("Running executeScript for code: " + jsString);
                chrome.tabs.executeScript(executeId, {
                    code: jsString,
                    "allFrames": true,
                    "matchAboutBlank": false,
                    "runAt": "document_start",
                });
            }

            if(cssString.length > 0){
                chrome.tabs.insertCSS(executeId, {
                    code: cssString,
                    allFrames: true,
                    runAt: "document_start"
                });
            }
        });
    }

    static checkDarkMode(url: Url, tabId?: number){
        if(tabId){
            ContentAction.passStateToExecute(url, tabId);
        } else {
            ContentAction.passStateToExecute(url);
        }
    }

    static toggleDarkMode(url: Url, tabId?: number){
        urlSettings.toggleDarkMode(url);
        ContentAction.passStateToExecute(url);
    }

    static toggleDarkModeStem(url: Url, tabId?: number){
        urlSettings.toggleDarkModeStem(url);
        ContentAction.passStateToExecute(url);
    }

    static toggleHue(url: Url, tabId?: number){
        urlSettings.toggleHueRotate(url);
        ContentAction.passStateToExecute(url);
    }

    static toggleHueStem(url: Url, tabId?: number){
        urlSettings.toggleHueRotateStem(url);
        ContentAction.passStateToExecute(url);
    }

    private static buildJsString(Dark: boolean){
        return `
            darkModeContentManager.updateAttributes(${Dark});
        `;
    }

    static passStateToExecute(url: Url, tabId?: number){
        var state = urlSettings.getUrlState(url);

        if(state.Dark){
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-on-19.png",
                    "38": "img/dark-mode-on-38.png"
                }
            });
        } else {
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-off-19.png",
                    "38": "img/dark-mode-off-38.png"
                }
            });
        }

        var cssString = CssBuilder.build(state.Dark, state.Hue, state.Contrast);

        var jsString = ContentAction.buildJsString(state.Dark)

        ContentAction.updateContentPage(jsString, cssString, tabId);
    }
}

// End ContentAction ------------------------------------------------------ }}}
// Browser Action ---------------------------------------------------------- {{{

function deactivateBrowserAction(){
    if(debug) console.log("Deactivating browser action!");
    chrome.tabs.getSelected(null, function(tab){
        chrome.browserAction.disable(tab.id);
        chrome.browserAction.setIcon({
            "path": {
                "19": "img/dark-mode-inactive-19.png",
                "38": "img/dark-mode-inactive-38.png"
            },
            "tabId": tab.id
        });
    });
}

function activateBrowserAction(){
    if(debug) console.log("Activating browser action!");
    chrome.tabs.getSelected(null, function(tab){
        chrome.browserAction.enable(tab.id);
        chrome.browserAction.setIcon({
            "path": {
                "19": "img/dark-mode-on-19.png",
                "38": "img/dark-mode-on-38.png"
            },
            "tabId": tab.id
        });
    });
}

// End Browser Action ------------------------------------------------------ }}}
// Listen for Keystrokes --------------------------------------------------- {{{

chrome.commands.onCommand.addListener(function(command){
    switch(command){
        case "toggle-dark-mode":
            if(debug) console.log("Keyboard Shortcut caught");
            ContentAction.toggleDarkMode(currentUrl);
            break;
    }
});

// End Listen for Keystrokes ----------------------------------------------- }}}
// Detect If Page Is Dark -------------------------------------------------- {{{

// Runs on the currently active tab in the current window

var lastIsPageDarkExecution = Date.now();

function isPageDark(lightCallback){
    if(debug) console.log("Starting isPageDark");
    var brightnessThreshold = 50;
    var runScreenshot = currentUrl.getShouldAutoDark();
    // Number of ms to wait between running isPageDark
    var isPageDarkMsInterval = 10;
    if((Date.now() - lastIsPageDarkExecution) < isPageDarkMsInterval){
        if(runScreenshot){
            if(debug) { console.log("Not running screenshot, last isPageDark execution was less than " + isPageDarkMsInterval + "ms ago"); }
            runScreenshot = false;
        }
    } else {
        if(debug) { console.log("Updating lastIsPageDarkExecution, runScreenshot is: " + runScreenshot); }
        lastIsPageDarkExecution = Date.now();
    }

    // Don't try to take screen shots while chrome is loading.
    // It blocks the background from doing other processing.
    // if(runScreenshot && setup === false){
    if(runScreenshot){
        if(debug) { console.log("Capturing tab screenshot!"); }
        chrome.tabs.captureVisibleTab(function(screenshot){
            resemble(screenshot).onComplete(function(data){
                if(data.brightness < brightnessThreshold){
                    if(debug) console.log("Page " + currentUrl.getNormal() + " is dark! Brightness: " + data.brightness);
                } else {
                    if(debug) console.log("Page " + currentUrl.getNormal() + " is light! Brightness: " + data.brightness);
                    if(typeof(lightCallback) === "function"){
                        // Check if "dark-mode" for url is undefined
                        if(debug) console.log("Before check whitelist");
                        var shouldRunCallback = urlSettings.checkDarkModeIsUndefined(currentUrl);
                        if(debug) console.log("shouldRunCallback = " + shouldRunCallback);
                        if(shouldRunCallback){
                            if(debug) { console.log("Running light callback"); }
                            lightCallback();
                        }
                    }
                }
            });
        });
    }
}

// End Detect If Page Is Dark ---------------------------------------------- }}}
// Context (Right Click) Menus --------------------------------------------- {{{

// Setup Basic Toggle context menu
function createToggleDarkModeContextMenu(){
    chrome.contextMenus.create({
        "id": "toggleDarkMode",
        "title": "Toggle Dark Mode",
        "onclick": function(){
            ContentAction.toggleDarkMode(currentUrl);
        },
        "contexts": ["all"]
    });
}
createToggleDarkModeContextMenu();

// For the Toggle stem menu item to have the current url within the menu
// text the context menu must first be created (`chrome.contextMenus.create`)
// and then updated on when the tab or window changes.
//
// Choosing what events update this menu is tricky. There is no definitive
// one tab event or window event that satifies a window or tab "change".
// Therefore multiple events are listening to call the
// `updateContextMenuAndBrowserAction` function. That function is rate limited
// by waiting at least 10ms to call `context.contextMenus.update`.
//
// There is probably a better way to do this, but this works for now.

function createToggleStemContextMenu(){
    chrome.contextMenus.create({
        "id": "toggleStemFromContextMenu",
        "title": "Toggle Dark Mode for all " + currentUrl.getDomain()  + " urls",
        "onclick": function(){
            ContentAction.toggleDarkModeStem(currentUrl);
        },
        "contexts": ["all"]
    });
}

var updateContextMenuToggleUrlStemTimestamp = Date.now();
var updateIntervalMs = 10;

var showContextMenus = true;
var contextMenusRemoved = false;

function updateContextMenuAndBrowserAction(){
    // My solution to rate limit changing this too often
    // If one of the events triggers this function don't do it again for
    // `updateIntervalMs` milliseconds.
    if(Date.now() > updateContextMenuToggleUrlStemTimestamp + updateIntervalMs){
        currentUrl.update(function(){
            if(currentUrl.getShouldUpdateMenu()){
                if(showContextMenus){
                    // Update the relevant context menus
                    chrome.contextMenus.update("toggleStemFromContextMenu", {
                        "title": "Toggle Dark Mode for all " + currentUrl.getDomain()  + " urls",
                    });
                } else {
                    // Create all context menus and browser action
                    showContextMenus = true;
                    createToggleDarkModeContextMenu();
                    createToggleStemContextMenu();
                    activateBrowserAction();
                    contextMenusRemoved = false;
                }
            } else {
                // Remove both context menus and browser action
                showContextMenus = false;
                if(!contextMenusRemoved){
                    deactivateBrowserAction();
                    chrome.contextMenus.remove("toggleDarkMode");
                    chrome.contextMenus.remove("toggleStemFromContextMenu");
                    contextMenusRemoved = true;
                }
            }
        });
        updateContextMenuToggleUrlStemTimestamp = Date.now();
    }
}

// End Context (Right Click) Menus ----------------------------------------- }}}
// Context Menu Events ----------------------------------------------------- {{{

chrome.tabs.onHighlighted.addListener(function(){
    updateContextMenuAndBrowserAction();
});

chrome.tabs.onUpdated.addListener(function(){
    updateContextMenuAndBrowserAction();
});
chrome.tabs.onActivated.addListener(function(){
    updateContextMenuAndBrowserAction();
});

chrome.windows.onCreated.addListener(function(){
    updateContextMenuAndBrowserAction();
});

chrome.windows.onFocusChanged.addListener(function(){
    updateContextMenuAndBrowserAction();
});

chrome.contextMenus.onClicked.addListener(function(){
    updateContextMenuAndBrowserAction();
});

// End Context Menu Events ------------------------------------------------- }}}
// Main ------------------------------------------------------------------- {{{

var debug = false;

setTimeout(function(){
    updateContextMenuAndBrowserAction();
    if(debug) { console.log("Hello from Typescript!"); }
}, 5);

var urlSettings = new UrlSettings();

var currentUrl = new Url();

BackgroundReceiver.init();

var state = new State();

currentUrl.update(function(){
    createToggleStemContextMenu();
    state.update(currentUrl, urlSettings, function(){});
});

// End Main --------------------------------------------------------------- }}}
