// Whitelist Functions ----------------------------------------------------- {{{

/**
 * toggleOrCheckWhitelist manages the whitelist data structure and returns
 * the boolean result of a search for a url
 *
 * The whitelist is formatted with the first level keys as "url stems"
 * and the second level as sub urls, both with options for dark-mode
 * and advanced dark mode.
 *
 * { "whitelist": "urlStem":
 *   { "dark-mode": true,
 *     "advanced-mode": false,
 *     "fullUrl": {
 *       "dark-mode": true,
 *       "advanced-mode": false
 *     },
 *     "fullUrl": {
 *       "dark-mode": true,
 *       "advanced-mode": false
 *     }
 *   }
 * }
 *
 * checkWhitelist first checks if the url stem exists, the mode of the stem, then if necessary the full url and the mode
 *
 * @param {Object} whitelist The whitelist pulled from chrome storage
 * @param {String} url The current raw url
 * @return [{Whitelist}, {Boolean}] Result of whitelist search for url
 */
function checkWhitelist(whitelist, url, field){
    var result;
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    var cleanedUrl = cleanUrl(url);
    if(objExists(whitelist[urlStem])){
        if(objExists(whitelist[urlStem][cleanedUrl])){
            if(objExists(whitelist[urlStem][cleanedUrl][field])){
                result = whitelist[urlStem][cleanedUrl][field];
            }
        }
    }
    return result;
}


function checkWhitelistStem(whitelist, url, field){
    var result;
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    if(objExists(whitelist[urlStem])){
        if(objExists(whitelist[urlStem][field])){
            result = whitelist[urlStem][field];
        }
    }
    return result;
}

function checkDarkMode(whitelist, url){
    // Various scenarios for checking dark mode.
    // | Dark Mode | Url   | Url Stem | Result |
    // | ---       | ---   | ---      | ---    |
    // | On        | Undef | Undef    | True   |
    // | On        | Undef | True     | True   |
    // | On        | True  | True     | True   |
    // | On        | True  | Undef    | True   |
    // | On        | False | True     | False  |
    // | Off       | False | Undef    | False  |
    // | Off       | Undef | False    | False  |
    // | Off       | True  | False    | False  |
    // | Off       | False | False    | False  |

    var urlResult = checkWhitelist(whitelist, url, "dark-mode");
    var urlStemResult = checkWhitelistStem(whitelist, url, "dark-mode");

    console.log("Url is: " + urlResult + ", Url Stem is: " + urlStemResult);

    // Results that turn dark mode ON
    if(urlResult === undefined && urlStemResult === undefined){
        return true;
    }
    if(urlResult === undefined && urlStemResult === true){
        return true;
    }
    if(urlResult === true && urlStemResult === true){
        return true;
    }
    if(urlResult === true && urlStemResult === undefined){
        return true;
    }
    if(urlResult === true && urlStemResult === false){
        return true;
    }

    // Results that turn dark mode OFF
    if(urlResult === false && urlStemResult === true){
        return false;
    }
    if(urlResult === false && urlStemResult === undefined){
        return false;
    }
    if(urlResult === undefined && urlStemResult === false){
        return false;
    }
    if(urlResult === false && urlStemResult === false){
        return false;
    }
    console.log("Error: checkWhitelist returned without a result");
}

function checkStemDarkMode(whitelist, url){
    var stemResult = checkWhitelistStem(whitelist, url, "dark-mode");
    if(stemResult === false){
        return false;
    } else {
        return true;
    }
}

function toggleWhitelist(whitelist, url, field){
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    var cleanedUrl = cleanUrl(url);
    if(objExists(whitelist[urlStem])){
        if(objExists(whitelist[urlStem][cleanedUrl])){
            if(objExists(whitelist[urlStem][cleanedUrl][field])){
                whitelist[urlStem][cleanedUrl][field] = !whitelist[urlStem][cleanedUrl][field];
            } else {
                // Turns dark mode off
                whitelist[urlStem][cleanedUrl][field] = false;
            }
        } else {
            whitelist[urlStem][cleanedUrl] = {};
            whitelist[urlStem][cleanedUrl][field] = false;
        }
    } else {
        whitelist[urlStem] = {};
        whitelist[urlStem][cleanedUrl] = {};
        whitelist[urlStem][cleanedUrl][field] = false;
    }

    saveWhitelist(whitelist);
    return whitelist;
}

function toggleWhitelistStem(whitelist, url, field){
    whitelist = cleanWhitelist(whitelist);
    var urlStem = getUrlStem(url);
    if(objExists(whitelist[urlStem])){
        if(objExists(whitelist[urlStem][field])){
            whitelist[urlStem][field] = !whitelist[urlStem][field];
        } else {
            whitelist[urlStem][field] = false;
        }
    } else {
        whitelist[urlStem] = {};
        // Deactivate the stem
        whitelist[urlStem][field] = false;
    }

    saveWhitelist(whitelist);
    return whitelist;
}

function toggleDarkMode(whitelist, url){
    console.log("toggleDarkMode");
    return toggleWhitelist(whitelist, url, "dark-mode");
}

function toggleStemDarkMode(whitelist, url){
    return toggleWhitelistStem(whitelist, url, "dark-mode");
}

// Helper Functions

function saveWhitelist(whitelist){
    chrome.storage.local.remove("whitelist");
    chrome.storage.local.set({"whitelist": whitelist});
}

function cleanWhitelist(whitelist){
    if(whitelist === undefined){
        whitelist = {};
    }

    if(objExists(whitelist.whitelist)){
        whitelist = whitelist.whitelist;
    }

    return whitelist;
}

function checkOptions(options, passedValue){
    if(options.indexOf(passedValue) == -1){
        throw new Error(passedValue + " is an invalid option!");
    }
}

function objExists(object){
    if(typeof object !== "undefined"){
        return true;
    }
    return false;
}

// End Whitelist Functions ------------------------------------------------- }}}
// PersistentStorage Class ------------------------------------------------ {{{

class PersistentStorage {
    protected dataObject: any;
    private name: string;

    constructor(name: string) {
        this.setData(name);
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
            console.log(key + " does not exist in PersistentStorage object named: " + this.name);
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
        chrome.storage.local.remove(this.name);
        // Typescript, or maybe js, doesn't like `this.name` as an object key
        var thisName: string = this.name;
        console.log("Saving: " + this.name);
        var saveObject = {}
        saveObject[this.name] = this.dataObject;
        console.log(saveObject);
        chrome.storage.local.set(saveObject);
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

    private checkUrlStem(url: string): QueryResult{
        var urlStem = getUrlStem(url);
        if(this.exists(urlStem, this.dataObject)){
            return QueryResult.True;
        }
        return QueryResult.Undefined;
    }

    private checkUrlForField(url: string, field: string): QueryResult {
        var urlStem = getUrlStem(url);
        var cleanedUrl = cleanUrl(url);
        if(this.exists(urlStem, this.dataObject)){
            if(this.exists(cleanedUrl, this.dataObject[urlStem])){
                if(this.exists(field, this.dataObject[urlStem][cleanedUrl])){
                     return this.returnQueryResultIfBool(this.dataObject[urlStem][cleanedUrl][field]);
                }
            }
        }
        return QueryResult.Undefined;
    }

    private checkUrlStemForField(url: string, field: string): QueryResult{
        var urlStem = getUrlStem(url);
        if(this.exists(urlStem, this.dataObject)){
            if(this.exists(field, this.dataObject[urlStem])){
                return this.returnQueryResultIfBool(this.dataObject[urlStem][field]);
            }
        }
        return QueryResult.Undefined;
    }

    private checkUrlStemForUrl(url: string): QueryResult{
        var urlStem = getUrlStem(url);
        var cleanedUrl = cleanUrl(url);
        if(this.exists(urlStem, this.dataObject)){
            if(this.exists(cleanedUrl, this.dataObject[urlStem])){
                return QueryResult.True;
            }
        }
        return QueryResult.Undefined;
    }

    private checkUrlForFieldBool(url: string, field: string, resultIfUndefined: boolean): boolean {
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

        // var urlResult = checkWhitelist(whitelist, url, "dark-mode");
        var urlResult = this.checkUrlForField(url, field);
        // var urlStemResult = checkWhitelistStem(whitelist, url, "dark-mode");
        var urlStemResult = this.checkUrlStemForField(url, field);

        console.log("Url is: " + urlResult + ", Url Stem is: " + urlStemResult);

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
        console.log("Error: checkWhitelist returned without a result");
        return;
    }

    private checkUrlStemForFieldBool(url: string, field: string, defaultValue: boolean): boolean {
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

    checkDarkMode(url: string): boolean{
        // If the stem and the url are undefined turn dark mode ON!
        return this.checkUrlForFieldBool(url, this.fields.darkMode.name, true);
    }

    checkDarkModeStem(url: string): boolean{
        return this.checkUrlStemForFieldBool(url, this.fields.darkMode.name, true);
    }

    checkHueRotate(url: string): boolean{
        // If the stem and the url are undefined turn hue rotate ON!
        return this.checkUrlForFieldBool(url, this.fields.hueRotate.name, true);
    }

    checkHueRotateStem(url: string): boolean{
        return this.checkUrlStemForFieldBool(url, this.fields.hueRotate.name, true);
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

    private toggleUrl(url: string, field: string, defaultValue: boolean){
        this.checkFieldIsBoolean(field);

        // Testing which fields are undefined
        // Check if stem exists
        // Check if stem -> url exists
        // Check if stem -> url -> field exists
        var stem = this.isQueryUndefined(this.checkUrlStem(url));
        var stem_Url = this.isQueryUndefined(this.checkUrlStemForUrl(url));
        var stem_Url_Field = this.isQueryUndefined(this.checkUrlForField(url, field));

        var urlStem = getUrlStem(url);
        var cleanedUrl = cleanUrl(url);

        var isNotUndefined = this.allArgsFalse(true, true);

        console.log("stem: " + stem);
        console.log("stem_Url: " + stem_Url);
        console.log("stem_Url_Field: " + stem_Url_Field);

        // The value exists, successfully run toggle
        if(this.allArgsFalse(stem, stem_Url, stem_Url_Field)){
            // this.dataObject[urlStem][cleanedUrl][field] = !this.dataObject[urlStem][cleanedUrl][field];
            if(this.dataObject[urlStem][cleanedUrl][field] === true) {
                this.dataObject[urlStem][cleanedUrl][field] = false;
            } else {
                this.dataObject[urlStem][cleanedUrl][field] = true;
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
            // this.dataObject[urlStem] = {cleanedUrl: {field: defaultValue}};
            this.dataObject[urlStem] = {};
            this.dataObject[urlStem][cleanedUrl] = {};
            this.dataObject[urlStem][cleanedUrl][field] = defaultValue;
        }
        this.save();
    }

    private toggleUrlStem(url: string, field: string, defaultValue: boolean){
        this.checkFieldIsBoolean(field);

        // Check if stem exists
        // Check if stem -> field exists
        var stem = this.isQueryUndefined(this.checkUrlStem(url));
        var stem_Field = this.isQueryUndefined(this.checkUrlStemForField(url, field));

        var urlStem = getUrlStem(url);

        // The stem -> field exists, run toggle
        if(this.allArgsFalse(stem, stem_Field)){
            this.dataObject[urlStem][field] = !this.dataObject[urlStem][field];
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

    toggleDarkMode(url: string){
        // Dark mode is always on (true), so when it is toggled for the first
        // time set the value to off (false)
        this.toggleUrl(url, this.fields.darkMode.name, false);
    }

    toggleDarkModeStem(url: string){
        this.toggleUrlStem(url, this.fields.darkMode.name, false);
    }

    toggleHueRotate(url: string){
        this.toggleUrl(url, this.fields.hueRotate.name, false);
    }

    toggleHueRotateStem(url: string){
        this.toggleUrlStem(url, this.fields.hueRotate.name, false);
    }

    // stem
    private removeStem(url: string){
        delete this.dataObject[getUrlStem(url)];
        this.save();
    }

    // stem -> field
    private removeStemField(url: string, field: string){
        delete this.dataObject[getUrlStem(url)][this.fields[field].name];
        this.save();
    }

    // stem -> url
    private removeUrl(url: string){
        delete this.dataObject[getUrlStem(url)][cleanUrl(url)];
        this.save();
    }

    // stem -> url -> field
    private removeField(url: string, field: string){
        delete this.dataObject[getUrlStem(url)][cleanUrl(url)][this.fields[field].name];
        this.save();
    }

    clearUrl(url: string){
        this.removeUrl(url);
    }

    clearUrlStem(url: string){
        this.removeStem(url);
    }

    clearDarkMode(url: string){
        this.removeField(url, this.fields.darkMode.name);
    }

    clearDarkModeStem(url: string){
        this.removeStemField(url, this.fields.darkMode.name);
    }

    clearHueRotate(url: string){
        this.removeField(url, this.fields.hueRotate.name);
    }

    clearHueRotateStem(url: string){
        this.removeStemField(url, this.fields.hueRotate.name);
    }

}

// End UrlSettings Class -------------------------------------------------- }}}

// Url Parsing ------------------------------------------------------------- {{{
/**
 * getUrlStem returns the url stem of a url.
 *
 * A url stem is the root of a url:
 *
 * http://www.reddit.com/r/cats/kitties -> http://www.reddit.com/
 *
 * The trailing slash is necessary because document.documentURI returns
 * urls formatted like this.
 *
 * @param {String} url A url from document.documentURI or chrome.tabs api
 * @return {String} urlStem
 */

var abnormalStems = [
    "file://",
    "about:blank",
];

function getAbnormalStem(url){
    // Uri.js is pretty useful, but fails on local file, "file://" urls.
    // This is the unideal solution to fix these, and probably other, urls.
    for(var i = 0; i <= abnormalStems.length; i++){
        if(url.indexOf(abnormalStems[i]) == 0){
            console.log("Found abnormalStem: " + abnormalStems[i]  + " in " + url);
            return abnormalStems[i];
        }
    }
    return "";
}

function getUrlStem(url){
    if(debug) console.log("Getting url stem from " + url);
    var abnormalStem = getAbnormalStem(url);
    if(abnormalStem.length > 0){
        return abnormalStem;
    }
    var fullUrl = URI(url);
    var urlStem = new URI({
        protocol: fullUrl.protocol(),
        hostname: fullUrl.hostname(),
    }).toString();
    if(debug) console.log("The stem of " + url + " is '" + urlStem + "'?");
    return urlStem;
}

/**
 * cleanUrl removes any query(?) or fragment(#) strings from a url and returns the cleaned url.
 *
 * Matches up to the query string if it exists, otherwise matches up to the last backslash.
 *
 * @param {String} url from document.document.URI or chrome.tabs api
 * @return {String} cleaned url
 */
function cleanUrl(url){
    // var cleanUrlWithQueryStringRegex = /^.*:\/\/.*\/(.*(?=\?|#))?/;
    var fullUrl = URI(url);
    var cleanedUrl = new URI({
        protocol: fullUrl.protocol(),
        hostname: fullUrl.hostname(),
        path: fullUrl.path()
    }).toString();
    console.log("The cleaned url of " + url + " is '" + cleanedUrl + "'?");
    return cleanedUrl;
}

function addTrailingSlash(url){
    var hasQueryString = url.indexOf("?") > -1;
    var hasFragmentString = url.indexOf("#") > -1;
    var hasTrailingSlash = url.charAt(url.length - 1) == "/";

    if(!hasQueryString && !hasFragmentString && !hasTrailingSlash){
        return url += "/";
    } else {
        return url;
    }
}

function getMinimalUrl(url){
    console.log("Minimizing url: " + url);
    var abnormalStem = getAbnormalStem(url);
    if(abnormalStem.length > 0){
        console.log("The minimal url of " + url + " is '" + abnormalStem + "'?");
        return abnormalStem;
    }
    try {
        var fullUrl = URI(url);
        var minimalUrl = fullUrl.hostname().toString();
        console.log("The minimal url of " + url + " is '" + minimalUrl + "'?");
        return minimalUrl;
    } catch(e) {
        console.log("Cannot minimize url: " + url);
    }
}

var urlBlacklist = [
    "chrome://",
    "chrome-extension://",
    "about:blank"
];

function urlInBlacklist(url){
    for(var i = 0; i < urlBlacklist.length; i++){
        if(url.indexOf(urlBlacklist[i]) > -1){
            return true;
        }
    }
    return false;
}

// End Url Parsing --------------------------------------------------------- }}}
// Url and Whitelist Action Callbacks -------------------------------------- {{{

function getWhitelist(callback, url){
    chrome.storage.local.get("whitelist", function(result){
        var whitelist = result;
        callback(whitelist, url);
    });
}

function getCurrentUrl(callback, callback2){
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
        var url = tabs[0].url;
        if(typeof callback === "function"){
            callback(callback2, url);
        }
    });
}

function getUrlAndWhitelist(callback){
    getCurrentUrl(getWhitelist, callback);
}

// End Url and Whitelist Action Callbacks ---------------------------------- }}}
// Setup ------------------------------------------------------------------- {{{

var debug = true;
var setup = true;

setGlobalWhitelist();
setTimeout(function(){
    updateContextMenuAndBrowserAction();
    console.log("Hello from Typescript!");
}, 5);

var u = new UrlSettings();
var g = "http://www.google.com";

// Wait 10 seconds to declare setup is over
setTimeout(function(){
    setup = false;
}, 10000);

// End Setup --------------------------------------------------------------- }}}
// Whitelist --------------------------------------------------------------- {{{

var globalWhitelist = {};
function setGlobalWhitelist(){
    chrome.storage.local.get("whitelist", function(whitelist){
        globalWhitelist = whitelist;
        if(debug) console.log(globalWhitelist);
    });
}

// End Whitelist ----------------------------------------------------------- }}}
// Messages ---------------------------------------------------------------- {{{

function sendDarkModeStatusMessage(){
    chrome.runtime.sendMessage({
        "name": "dark-mode-status",
        "dark-mode": checkDarkMode(globalWhitelist, currentUrl),
        "dark-mode-stem": checkStemDarkMode(globalWhitelist, currentUrl),
        "url": currentUrl,
        "url-stem": getMinimalUrl(currentUrl)
    });
}

// Listen for an event / one-time request from the popup
function darkModeStatusListener(listenerMessage, actionFunction){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if(message === listenerMessage){
            if(debug) console.log("Received Message: " + message);
            if(typeof(actionFunction) === "function"){
                actionFunction();
            }
            sendDarkModeStatusMessage();
        }
    });
}

darkModeStatusListener("request-dark-mode-status", null);
darkModeStatusListener("toggle-dark-mode-from-popup", function() {
    executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
});
darkModeStatusListener("toggle-dark-mode-stem", function(){
    executeDarkModeScript(globalWhitelist, currentUrl, "toggleStem");
});

function darkModeActivatorListener(){
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if(message === "activate-dark-mode"){
            executeDarkModeScript(globalWhitelist, currentUrl, "init");
        }
    });
}
darkModeActivatorListener();

// Send a message to the content script
var activateDarkMode = function(){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendMessage(tab.id, {type: "toggle-dark-mode"});
    });
};

// Send a message to the content script
var sendMessageToCurrentTabContext = function(message){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.sendMessage(tab.id, {type: message});
    });
};
// End Messages ------------------------------------------------------------ }}}
// ExecuteScripts ---------------------------------------------------------- {{{

function executeScriptInCurrentWindow(filename){
    chrome.tabs.getSelected(null, function(tab){
        chrome.tabs.executeScript(tab.id, {
            "file": "js/" + filename,
            "allFrames": true,
            "matchAboutBlank": true,
            "runAt": "document_start",
        }, function(){
            if(debug) console.log("Executing " + filename + " in " + tab.title);
        });
        if(filename.indexOf("Off") > -1){
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-off-19.png",
                    "38": "img/dark-mode-off-38.png"
                },
                "tabId": tab.id
            });
        } else {
            chrome.browserAction.setIcon({
                "path": {
                    "19": "img/dark-mode-on-19.png",
                    "38": "img/dark-mode-on-38.png"
                },
                "tabId": tab.id
            });
        }
    });
}

function executeTurnOnDarkModeScript(){
    executeScriptInCurrentWindow("turnOnDarkMode.js");
}

function executeTurnOffDarkModeScript(){
    executeScriptInCurrentWindow("turnOffDarkMode.js");
}

function executeDarkModeScript(whitelist, url, choice){
    if(choice === "toggle"){
        // This could make more sense!
        globalWhitelist = toggleDarkMode(whitelist, url);
        whitelist = globalWhitelist;
    }
    if(choice === "toggleStem"){
        // This could make more sense!
        globalWhitelist = toggleStemDarkMode(whitelist, url);
        whitelist = globalWhitelist;
    }
    if(checkDarkMode(whitelist, url)){
        executeTurnOnDarkModeScript();
    } else {
        executeTurnOffDarkModeScript();
    }
}

// End ExecuteScripts ------------------------------------------------------ }}}
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
            executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            break;
    }
});

// End Listen for Keystrokes ----------------------------------------------- }}}
// Detect If Page Is Dark -------------------------------------------------- {{{

// Pages where auto dark mode fails
var autoDarkBlacklist = [
    // I think this is because of js loading timing problems
    "pdf"
];

// Runs on the currently active tab in the current window
function isPageDark(lightCallback){
    if(debug) console.log("Starting isPageDark");
    var brightnessThreshold = 50;
    // Test if url is in auto dark blacklist
    var runScreenshot = true;
    for(var i = 0; i <= autoDarkBlacklist.length; i++){
        console.log("Testing: " + autoDarkBlacklist[i] + " in " + currentUrl);
        if(currentUrl.indexOf(autoDarkBlacklist[i]) > -1){
            runScreenshot = false;
            console.log(autoDarkBlacklist[i] + " in " + currentUrl);
            console.log("Not taking screenshot!");
            break;
        }
    }

    // Don't try to take screen shots while chrome is loading.
    // It blocks the background from doing other processing.
    if(runScreenshot && setup === false){
        chrome.tabs.captureVisibleTab(function(screenshot){
            resemble(screenshot).onComplete(function(data){
                if(data.brightness < brightnessThreshold){
                    if(debug) console.log("Page is dark! Brightness: " + data.brightness);
                } else {
                    if(debug) console.log("Page is light! Brightness: " + data.brightness);
                    if(typeof(lightCallback) === "function"){
                        // Check if "dark-mode" for url is undefined
                        if(debug) console.log("Before check whitelist");
                        var shouldRunCallback = checkWhitelist(globalWhitelist, currentUrl, "dark-mode");
                        if(debug) console.log("shouldRunCallback = " + shouldRunCallback);
                        if(typeof(shouldRunCallback) === "undefined"){
                            console.log("Running light callback");
                            lightCallback();
                        }
                    }
                }
            });
        });
    }
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if(message === "check-is-page-dark"){
        if(debug) console.log("check-is-page-dark");
        isPageDark(function(){
            // executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
            executeTurnOffDarkModeScript();
        });
    }
});

// End Detect If Page Is Dark ---------------------------------------------- }}}
// Context (Right Click) Menus --------------------------------------------- {{{

// Setup Basic Toggle context menu
function createToggleDarkModeContextMenu(){
    chrome.contextMenus.create({
        "id": "toggleDarkMode",
        "title": "Toggle Dark Mode",
        "onclick": function(){
            executeDarkModeScript(globalWhitelist, currentUrl, "toggle");
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

// Get the url for this tab?
var currentUrl = "about:blank";

function createToggleStemContextMenu(){
    currentUrl = getMinimalUrl(currentUrl);
    chrome.contextMenus.create({
        "id": "toggleStemFromContextMenu",
        "title": "Toggle Dark Mode for all " + currentUrl  + " urls",
        "onclick": function(){
            executeDarkModeScript(globalWhitelist, currentUrl, "toggleStem");
        },
        "contexts": ["all"]
    });
}
createToggleStemContextMenu();

var updateContextMenuToggleUrlStemTimestamp = Date.now();
var updateIntervalMs = 10;

var showContextMenus = true;
var contextMenusRemoved = false;

function updateContextMenuAndBrowserAction(){
    // My solution to rate limit changing this too often
    // If one of the events triggers this function don't do it again for
    // `updateIntervalMs` milliseconds.
    if(Date.now() > updateContextMenuToggleUrlStemTimestamp + updateIntervalMs){
        if(debug) console.log("In event loop @ " + Date.now());
        chrome.tabs.query({"active": true, "currentWindow": true}, function(tabs){
            try {
                currentUrl = tabs[0].url;
            } catch (e) {
                if(debug) console.log("Could not get url for updating context menu: " + e);
            }
            if(urlInBlacklist(currentUrl)){
                // Remove both context menus and browser action
                showContextMenus = false;
                if(!contextMenusRemoved){
                    deactivateBrowserAction();
                    chrome.contextMenus.remove("toggleDarkMode");
                    chrome.contextMenus.remove("toggleStemFromContextMenu");
                    contextMenusRemoved = true;
                }
            } else {
                if(showContextMenus){
                    // Update the relevant context menus
                    chrome.contextMenus.update("toggleStemFromContextMenu", {
                        "title": "Toggle Dark Mode for all " + getMinimalUrl(currentUrl)  + " urls",
                    });
                } else {
                    // Create all context menus and browser action
                    showContextMenus = true;
                    createToggleDarkModeContextMenu();
                    createToggleStemContextMenu();
                    activateBrowserAction();
                    contextMenusRemoved = false;
                }
            }
        });
        updateContextMenuToggleUrlStemTimestamp = Date.now();
    }
}

// End Context (Right Click) Menus ----------------------------------------- }}}
// Context Menu Events ----------------------------------------------------- {{{

chrome.tabs.onHighlighted.addListener(function(){
    if(debug) console.log("onHighlighted @ " + Date.now());
    updateContextMenuAndBrowserAction();
});

chrome.tabs.onUpdated.addListener(function(){
    if(debug) console.log("onUpdated @ " + Date.now());
    updateContextMenuAndBrowserAction();
});
chrome.tabs.onActivated.addListener(function(){
    if(debug) console.log("onActivated @ " + Date.now());
    updateContextMenuAndBrowserAction();
});

chrome.windows.onCreated.addListener(function(){
    if(debug) console.log("onCreated @ " + Date.now());
    updateContextMenuAndBrowserAction();
});

chrome.windows.onFocusChanged.addListener(function(){
    if(debug) console.log("onFocusChanged @ " + Date.now());
    updateContextMenuAndBrowserAction();
});

// End Context Menu Events ------------------------------------------------- }}}
