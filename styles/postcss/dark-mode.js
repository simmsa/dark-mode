var postcss = require("postcss");
var postcssJs = require("postcss-js");

var contrastMin = 70;
var contrastMax = 130;

// Elements that should not be inverted
// Because `filter: invert()` inverts everything, some elements look terrible.
// To fix this specific elements are uninverted, with another `filter: invert()`.
var unInverseElements = [
    "img",
    "video",
    "body *[style*=url]",
    "object[type=\"application/x-shockwave-flash\"]",
    "embed[type=\"application/x-shockwave-flash\"]"
];

// Edge cases that need to be un un inverted
var unUnInverseElements = [
    "body *[style*=gif]",
    "body *[style*=url] img",
    "body *[style*=url] video",
    "body *[style*=url] object[type=\"application/x-shockwave-flash\"]",
    "body *[style*=url] embed[type=\"application/x-shockwave-flash\"]"
];

var style = {};

function dataDarkElement(name, value){
    return "html[data-" + name + "=\"" + value + "\"]";
}

function dataInverseSelector(selector, inputArray){
    var result = "";

    for(var x in inputArray){
        if(x == inputArray.length - 1){
            // Remove last comma
            result += selector + " " + inputArray[x] + "\n";
        } else {
            result += selector + " " + inputArray[x] + ",\n";
        }
    }
    return result;
}

function addIframeAttribute(name, value, filter){
    style[dataDarkElement(name, value)] = {
        "backgroundColor": "#ffffff",
        "-webkitFilter": filter
    };
}

addIframeAttribute("dark-mode-iframe", "true", "invert(0%) hue-rotate(0deg)");

var invertOn_HueRotateOn = {
    selector: "html[data-dark-mode=\"on\"][data-dark-mode-hue=\"on\"]",
    invertStyle: "invert() hue-rotate(180deg)",
    unInvertStyle: "invert() hue-rotate(180deg)"
};

var invertOn_HueRotateOff = {
    selector: "html[data-dark-mode=\"on\"][data-dark-mode-hue=\"off\"]",
    invertStyle: "invert()",
    unInvertStyle: "invert()"
};

var unUnInvertStyle = "invert(0%) contrast(100%)";

var i, j;
for(i = contrastMin, j = contrastMax; i <= contrastMax; i++, j--){
    style[invertOn_HueRotateOn.selector + "[data-dark-mode-contrast=\"" + i + "\"]"] = {
        "backgroundColor": "#171717",
        "-webkitFilter": invertOn_HueRotateOn.invertStyle + " contrast(" + i + "%)"
    };
    style[invertOn_HueRotateOff.selector + "[data-dark-mode-contrast=\"" + i + "\"]"] = {
        "backgroundColor": "#171717",
        "-webkitFilter": invertOn_HueRotateOff.invertStyle + " contrast(" + i + "%)"
    };
    style[dataInverseSelector(invertOn_HueRotateOn.selector + "[data-dark-mode-contrast=\"" + i + "\"]", unInverseElements)] = {
        // "backgroundColor": "#171717",
        "-webkitFilter": invertOn_HueRotateOn.unInvertStyle + " contrast(" + j + "%)"
    };
    style[dataInverseSelector(invertOn_HueRotateOff.selector + "[data-dark-mode-contrast=\"" + i + "\"]", unInverseElements)] = {
        // "backgroundColor": "#171717",
        "-webkitFilter": invertOn_HueRotateOff.unInvertStyle + " contrast(" + j + "%)"
    };
    style[dataInverseSelector(invertOn_HueRotateOn.selector + "[data-dark-mode-contrast=\"" + i + "\"]", unUnInverseElements)] = {
        // "backgroundColor": "#171717",
        // "-webkitFilter": invertOn_HueRotateOn.invertStyle + " contrast(" + j + "%)"
        "-webkitFilter": unUnInvertStyle
    };
    style[dataInverseSelector(invertOn_HueRotateOff.selector + "[data-dark-mode-contrast=\"" + i + "\"]", unUnInverseElements)] = {
        // "backgroundColor": "#171717",
        // "-webkitFilter": invertOn_HueRotateOff.invertStyle + " contrast(" + j + "%)"
        "-webkitFilter": unUnInvertStyle
    };
}

postcss().process(style, { parser: postcssJs }).then((result) => {
    console.log(result.css);
});
