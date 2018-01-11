/*
 *  ____             _      __  __           _
 * |  _ \  __ _ _ __| | __ |  \/  | ___   __| | ___
 * | | | |/ _` | '__| |/ / | |\/| |/ _ \ / _` |/ _ \
 * | |_| | (_| | |  |   <  | |  | | (_) | (_| |  __/
 * |____/ \__,_|_|  |_|\_\ |_|  |_|\___/ \__,_|\___|
 *
 * Copyright (c) 2015-present, Andrew Simms
 * Author: Andrew Simms <simms.andrew@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
  [
    "http://latex.wikia.com/wiki/List_of_LaTeX_symbols",
    "http://latex.wikia.com/wiki/List_of_LaTeX_symbols/",
  ],
  [
    "https://www.google.com/search?q=test&oq=test&aqs=chrome.0.69i59j69i60j69i65l3j69i61.953j0j1&sourceid=chrome&es_sm=119&ie=UTF-8",
    "https://www.google.com/search/",
  ],
  ["http://reddit.com/#page=2", "http://reddit.com/"],
];

function testCleanedUrl(urlArray) {
  // // var cleanedUrl = cleanUrl(urlArray[0]);
  // var cleanedUrl = new Url;
  // var result = urlArray[1] === cleanedUrl;
  // if(!result){
  //     console.log("Failure: " + urlArray[0] + " != " + cleanedUrl);
  // } else {
  //     console.log("Pass!");
  // }
}

function testUrls(urlArray) {
  console.log("Running Url Tests:\n");
  for (var i = 0; i < urlArray.length; i++) {
    testCleanedUrl(urlArray[i]);
  }
}

testUrls(urls);
