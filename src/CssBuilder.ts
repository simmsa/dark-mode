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

export default class CssBuilder {
  //  Element Creation and Selection -------------------------------------{{{

  public static iFrameContrast = 100;
  public static defaultContrast = 85;
  private static filter = "-webkit-filter";

  // Elements that should not be inverted
  // To fix this specific elements are uninverted, with another `filter: invert()`.
  // Effectively inverting an element to 200% or back to normal
  private static unInvertElements = [
    ".no-dark",
    "img",
    "video",
    "body *[style*=url]",
    'object[type="application/x-shockwave-flash"]',
    'embed[type="application/x-shockwave-flash"]',
    "body div[style*=url]",
    "body div[style*=url] > *",
    "body div[style*=url] > * img",
    "body div[style*=url] > * video",
    'body div[style*=url] > * object[type="application/x-shockwave-flash"]',
    'body div[style*=url] > * embed[type="application/x-shockwave-flash"]',
  ];

  private static specialCases = [".no-dark img"];

  public static iFrameUnInvertElements = [
    "img",
    "video", // Fixes twitter embedded videos, but has other side effects?
    "body *[style*=url]",
    'object[type="application/x-shockwave-flash"]',
    'embed[type="application/x-shockwave-flash"]',
  ];

  // Edge cases that need to be un un inverted
  private static unUnInvertElements = [
    // Google search input
    "body input[style*=transparent]",
    "body *[style*=url] img",
    "body *[style*=url] video",
    'body *[style*=url] object[type="application/x-shockwave-flash"]',
    'body *[style*=url] embed[type="application/x-shockwave-flash"]',
  ];

  private static siteRules = {
    "blog.mozilla.org": ["#masthead"],
    "example.com": [".test"],
    "twitter.com": [".gallery-overlay", ".Gallery-media"],
    "upwork.com": [".hero-visitor-banner"],
  };

  private static buildSelector(selector: string, elements: string[]): string {
    if (elements.length === 0) {
      return selector + " ";
    }

    return elements
      .map(element => {
        return `${selector} ${element}`;
      })
      .join(",\n    ");
  }

  private static darkSelector(
    isDark: boolean,
    isIFrame: boolean,
    elements: string[],
  ) {
    // const selector = `html[data-dark-mode-active="${isDark}"][data-dark-mode-iframe="${isIFrame}"]
    // :not(*:-webkit-full-screen-ancestor):not(img)`;
    const selector = `html[data-dark-mode-active="${isDark}"][data-dark-mode-iframe="${isIFrame}"]`;
    return CssBuilder.buildSelector(selector, elements);
  }

  private static siteSelector(url: string, elements: string[]): string {
    const selector = `html[data-dark-mode-active="true"][data-dark-mode-url*="${url}"]`;
    return CssBuilder.buildSelector(selector, elements);
  }

  private static inverseSiteSelector(url: string, elements: string[]): string {
    const selector = `html[data-dark-mode-active="true"][data-dark-mode-url*="${url}"]`;
    return CssBuilder.buildSelector(
      selector,
      elements.map(element => element + " > *"),
    );
  }

  public static buildSiteRules(): string {
    const invertRules = Object.keys(CssBuilder.siteRules)
      .map(url => {
        return `${CssBuilder.siteSelector(url, CssBuilder.siteRules[url])} {
        ${CssBuilder.buildFilter(true, true, CssBuilder.iFrameContrast)}
    }`;
      })
      .join("\n\n    ");

    const unInvertRules = Object.keys(CssBuilder.siteRules)
      .map(url => {
        return `${CssBuilder.inverseSiteSelector(
          url,
          CssBuilder.siteRules[url],
        )} {
        ${CssBuilder.buildFilter(false, false, CssBuilder.iFrameContrast)}
    }`;
      })
      .join("\n\n    ");

    return invertRules + "\n\n    " + unInvertRules;
  }

  public static buildFilter(
    invert?: boolean,
    hue?: boolean,
    contrast?: number,
  ) {
    if (invert === undefined && hue === undefined && contrast === undefined) {
      return `${CssBuilder.filter}: none !important;`;
    }
    const invertStr = invert ? "invert(100%)" : "invert(0%)";
    const hueStr = hue ? "180deg" : "0deg";
    return `${
      CssBuilder.filter
    }: ${invertStr} hue-rotate(${hueStr}) contrast(${contrast}%) !important;`;
  }

  //  End Element Creation and Selection ---------------------------------}}}
  //  Base Frame ---------------------------------------------------------{{{

  public static buildForBaseFrame(
    Dark: boolean,
    Hue: boolean,
    Contrast: number,
  ): string {
    if (!Dark) {
      return "";
    }

    return `
@media screen {
    ${CssBuilder.darkSelector(Dark, false, [])}{
        ${CssBuilder.buildFilter(Dark, Hue, Contrast)}
        background-color: #000000;
    }

    ${CssBuilder.buildSiteRules()}

    ${CssBuilder.darkSelector(Dark, false, CssBuilder.specialCases)} {
        ${CssBuilder.buildFilter(!Dark, !Hue, CssBuilder.iFrameContrast)}
    }

    ${CssBuilder.darkSelector(Dark, false, CssBuilder.unInvertElements)} {
        ${CssBuilder.buildFilter(Dark, Hue, CssBuilder.iFrameContrast)}
    }

    ${CssBuilder.darkSelector(Dark, false, CssBuilder.unUnInvertElements)} {
        ${CssBuilder.buildFilter(!Dark, !Hue, CssBuilder.iFrameContrast)}
    }
}`;
  }

  //  End Base Frame -----------------------------------------------------}}}
  //  Iframe -------------------------------------------------------------{{{

  public static buildForIFrame(
    Dark: boolean,
    Hue: boolean,
    Contrast: number,
    BaseFrameIsDark: boolean | undefined,
  ): string {
    if (!BaseFrameIsDark) {
      // Kill every inversion
      return `
@media screen {
    ${CssBuilder.darkSelector(false, true, [])}{
        ${CssBuilder.buildFilter()}
    }

    ${CssBuilder.darkSelector(false, true, CssBuilder.iFrameUnInvertElements)} {
        ${CssBuilder.buildFilter()}
    }

    ${CssBuilder.darkSelector(false, true, CssBuilder.unUnInvertElements)} {
        ${CssBuilder.buildFilter()}
    }
}`;
    }

    // These cascade, so changing the first one will affects the second
    // and third. Basically, don't touch this!
    return `
@media screen {
    ${CssBuilder.darkSelector(true, true, [])}{
        ${CssBuilder.buildFilter(
          Dark,
          Hue,
          Contrast || CssBuilder.iFrameContrast,
        )}
    }

    ${CssBuilder.darkSelector(true, true, CssBuilder.iFrameUnInvertElements)} {
        ${CssBuilder.buildFilter(
          !Dark,
          !Hue,
          Contrast || CssBuilder.iFrameContrast,
        )}
    }

    ${CssBuilder.darkSelector(true, true, CssBuilder.unUnInvertElements)} {
        ${CssBuilder.buildFilter(
          Dark,
          Hue,
          Contrast || CssBuilder.iFrameContrast,
        )}
    }
}`;
  }

  //  End Iframe ---------------------------------------------------------}}}
}
//  Export Styles as Text ----------------------------------------------{{{

// If called from node print out default css setup
// Allows for creating the default styles/css/dark-mode.css file from gulp
try {
  if (require.main === module) {
    // tslint:disable:no-console
    console.log(
      CssBuilder.buildForBaseFrame(true, true, CssBuilder.defaultContrast),
    );
    console.log(
      CssBuilder.buildForIFrame(false, false, CssBuilder.iFrameContrast, true),
    );
  }
} catch (e) {
  if (e instanceof ReferenceError) {
    // pass
  }
}

//  End Export Styles as Text ------------------------------------------}}}
