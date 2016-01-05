class CssBuilder {

    static buildSelector(selector: string, elements: string[]): string{
        var result = "";

        for(var x in elements){
            if(x == 0){
                result += selector + " " + elements[x] + ",\n";
            } else if(x != elements.length - 1){
                result += "    " + selector + " " + elements[x] + ",\n";
            } else {
                result += "    " + selector + " " + elements[x];
            }
        }

        return result;
    }

    static build(Dark: boolean, Hue: boolean, Contrast: number){
        if(!Dark){
            return "";
        }

        var filter = "-webkit-filter:";
        var contrastInvert = Contrast;
        var contrastUnInvert = 100 + (100 - Contrast);

        var hueDeg = Hue ? "180deg" : "0deg"

        // Elements that should not be inverted
        // To fix this specific elements are uninverted, with another `filter: invert()`.
        // Effectively inverting an element to 200% or back to normal
        var unInvertElements = [
            "img",
            "video",
            "body *[style*=url]",
            "object[type=\"application/x-shockwave-flash\"]",
            "embed[type=\"application/x-shockwave-flash\"]"
        ];

        // Edge cases that need to be un un inverted
        var unUnInvertElements = [
            // Google search input
            "body input[style*=transparent]",
            "body *[style*=url] img",
            "body *[style*=url] video",
            "body *[style*=url] object[type=\"application/x-shockwave-flash\"]",
            "body *[style*=url] embed[type=\"application/x-shockwave-flash\"]"
        ];


        return `
@media screen {
    html[data-dark-mode-active="true"][data-dark-mode-iframe="false"]{
        -webkit-filter: invert() hue-rotate(${hueDeg}) contrast(${contrastInvert}%) !important;
        background-color: #171717;
    }

    ${CssBuilder.buildSelector("html[data-dark-mode-active=\"true\"][data-dark-mode-iframe=\"false\"]", unInvertElements)} {
        -webkit-filter: invert() hue-rotate(${hueDeg}) contrast(${contrastUnInvert}%) !important;
    }

    ${CssBuilder.buildSelector("html[data-dark-mode-active=\"true\"][data-dark-mode-iframe=\"false\"]", unUnInvertElements)} {
        -webkit-filter: invert(0%) hue-rotate(${hueDeg}) contrast(100%) !important;
    }

    /* Inside iframe */
    html[data-dark-mode-active="true"][data-dark-mode-iframe="true"] {
        -webkit-filter: none !important;
    }

    ${CssBuilder.buildSelector("html[data-dark-mode-active=\"true\"][data-dark-mode-iframe=\"true\"]", unInvertElements)} {
        -webkit-filter: invert() hue-rotate(${hueDeg}) contrast(100%) !important;
    }

    ${CssBuilder.buildSelector("html[data-dark-mode-active=\"true\"][data-dark-mode-iframe=\"true\"]", unUnInvertElements)} {
        -webkit-filter: invert(0%) hue-rotate(${hueDeg}) contrast(100%) !important;
    }
}`
        ;
    }
}

// If called from node print out default css setup
// Allows for creating the default styles/css/dark-mode.css file from gulp
try{
    if(require.main === module){
        console.log(CssBuilder.build(true, true, 85));
    }
} catch(e){
    if(e instanceof(ReferenceError)){
        // pass
    }
}
