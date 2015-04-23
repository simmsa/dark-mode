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

    if(objExists(whitelist["whitelist"])){
        whitelist = whitelist["whitelist"];
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
    return addTrailingSlash(urlStemRegex.exec(url)[0]);
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

    // console.log("Input url: " + url);
    url = addTrailingSlash(url);
    var result = cleanUrlWithQueryStringRegex.exec(url)[0];
    // console.log("Clean url: " + result);
    // console.log("Clean url with trailing slash: " + addTrailingSlash(result));

    // console.log("Cleaned url: " + addTrailingSlash(result));
    return addTrailingSlash(result);
}

function addTrailingSlash(url){
    var hasQueryString = url.indexOf("?") > -1;
    var hasFragmentString = url.indexOf("#") > -1;
    var hasTrailingSlash = url.charAt(url.length - 1) == "/";

    // console.log(url);
    // console.log("hasQueryString: " + hasQueryString + " hasFragmentString: " + hasFragmentString + " hasTrailingSlash: " + hasTrailingSlash);
    // console.log();

    if(!hasQueryString && !hasFragmentString && !hasTrailingSlash){
        return url += "/";
    } else {
        return url;
    }
}

function getMinimalUrl(url){
    var minUrlRegex = /\/\/.*\//;
    return minUrlRegex.exec(getUrlStem(url))[0].replace(/\//g, "");
}
