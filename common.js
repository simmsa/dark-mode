/**
 * toggleOrCheckWhitelist manages the whitelist data structure and returns
 * the boolean result of a search for a url
 *
 * The whitelist is formatted with the first level keys as "url stems"
 * and the second level as sub urls, both with options for dark-mode
 * and advanced dark mode.
 *
 * { "whitelist": "urlStem":
 *   { "dark-mode-off": true,
 *     "advanced-mode-on": false,
 *     "fullUrl": {
 *       "dark-mode-off": true,
 *       "advanced-mode-on": false
 *     },
 *     "fullUrl": {
 *       "dark-mode-off": true,
 *       "advanced-mode-on": false
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
function toggleOrCheckWhitelist(option, whitelist, url, field){
    checkOptions(["toggle", "check"], option);
    checkOptions(["dark-mode-off", "advanced-mode-on"], field);

    var toggle = (option === "toggle") ? true : false;
    // var toggle = false;
    // if(option === "toggle"){
    //     toggle = true;
    // }

    var urlStem = getUrlStem(url);
    var cleanedUrl = cleanUrl(url);
    var isUrlStem = urlStem === cleanedUrl;

    var current;

    if(whitelist === undefined){
        whitelist = {};
    }

    whitelist = whitelist.whitelist;

    if(whitelist === undefined){
        whitelist = {};
    }

    // Make a url prove it is in the whitelist
    var result = false;

    if(objExists(whitelist[urlStem])){
        // Check the specific url first
        if(objExists(whitelist[urlStem][cleanedUrl])){
            if(objExists(whitelist[urlStem][cleanedUrl][field])){
                result = whitelist[urlStem][cleanedUrl][field];
            }
            if(toggle){
                whitelist[urlStem][cleanedUrl][field] = !whitelist[urlStem][cleanedUrl][field];
                result = whitelist[urlStem][cleanedUrl][field];
                // saveWhitelist(whitelist);
            }
        // Then check for the stem
        } else if(objExists(whitelist[urlStem][field])){
            result = whitelist[urlStem][field];
            if(toggle){
                whitelist[urlStem][field] = !whitelist[urlStem][field];
                result = whitelist[urlStem][field];
                // saveWhitelist(whitelist);
            }
        }
    } else if (toggle){
        // If the field doesn't exist, create it and set it to true.
        whitelist[urlStem] = {};
        whitelist[urlStem][cleanedUrl] = {};
        whitelist[urlStem][cleanedUrl][field] = true;
        // Can't use expressions for identifiers in an object literal
        // whitelist[urlStem] = { cleanedUrl: {field: true} };
        // saveWhitelist(whitelist);
        result = true;
    }
    saveWhitelist(whitelist);
    return result;
}

function saveWhitelist(whitelist){
    chrome.storage.local.remove("whitelist");
    chrome.storage.local.set({"whitelist": whitelist});
}

function checkWhitelist(whitelist, url, field){
    return toggleOrCheckWhitelist("check", whitelist, url, field);
}

function checkDarkModeOff(whitelist, url){
    return checkWhitelist(whitelist, url, "dark-mode-off");
}

function toggleWhitelist(whitelist, url, field){
    return toggleOrCheckWhitelist("toggle", whitelist, url, field);
}

function toggleDarkModeOff(whitelist, url){
    return toggleWhitelist(whitelist, url, "dark-mode-off");
}

function checkOptions(options, passedValue){
    if(options.indexOf(passedValue) == -1){
        console.log("Error: " + passedValue + " is an invalid option!");
        throw new Error("Error: " + passedValue + " is an invalid option!");
    }
}

function objExists(object){
    if(typeof object !== "undefined"){
        return true;
    }
    return false;
}

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
function getUrlStem(url){
    var urlStemRegex = /^.*:\/\/.*?(\/)/;
    return urlStemRegex.exec(url)[0];
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
    var cleanUrlWithQueryStringRegex = /^.*:\/\/.*\/(.*(?=\?|#))?/;
    // var cleanUrlRegex = /^.*:\/\/.*\//;

    var result = cleanUrlWithQueryStringRegex.exec(url)[0];
    if(result.charAt(result.length - 1) != "/"){
        result += "/";
    }

    return result;
}
