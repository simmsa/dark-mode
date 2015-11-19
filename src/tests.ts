var fs = require("fs");
var vm = require("vm");

// var content = fs.readFileSync("common.js");
// vm.runInThisContext(content);

vm.runInThisContext(fs.readFileSync(__dirname + "/common.js"));

console.log("Running Tests:\n");

var urls = [
    // Test Url          Passing Url
    ["http://test.com/", "http://test.com/"],
    ["http://test.com", "http://test.com/"],
    ["http://latex.wikia.com/wiki/List_of_LaTeX_symbols", "http://latex.wikia.com/wiki/List_of_LaTeX_symbols/"],
    ["https://www.google.com/search?q=test&oq=test&aqs=chrome.0.69i59j69i60j69i65l3j69i61.953j0j1&sourceid=chrome&es_sm=119&ie=UTF-8", "https://www.google.com/search/"],
    ["http://reddit.com/#page=2", "http://reddit.com/"]
];

function testCleanedUrl(urlArray){
    // // var cleanedUrl = cleanUrl(urlArray[0]);
    // var cleanedUrl = new Url;
    // var result = urlArray[1] === cleanedUrl;
    // if(!result){
    //     console.log("Failure: " + urlArray[0] + " != " + cleanedUrl);
    // } else {
    //     console.log("Pass!");
    // }
}

function testUrls(urlArray){
    console.log("Running Url Tests:\n");
    for(var i = 0; i < urlArray.length; i++){
        testCleanedUrl(urlArray[i]);
    }
}

testUrls(urls);
