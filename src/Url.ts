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

import * as URI from "urijs";

// tslint:disable:no-console
const debug = false;

class Url {
  // Example input url: https://www.google.com/search?q=test
  private stem: string; // https://www.google.com -> protocol + hostname
  private domain: string; // google.com -> domain
  private normal: string; // https://www.google.com/search -> protocol + hostname + path, no query or fragment strings
  private full: string; // everything

  private shouldUpdateMenu: boolean;
  private shouldAutoDark: boolean;

  private defaultUrl = "about:blank";

  private updateBlacklist = ["chrome://", "chrome-extension://", "about:blank"];

  private parseBlacklist = ["chrome://", "chrome-extension://", "file://"];

  private autoDarkModeBlacklist = [".pdf"];

  constructor(newUrl?: string) {
    if (newUrl) {
      this.parse(newUrl);
    } else {
      this.parse(this.defaultUrl);
    }
  }

  public update(callback?: () => void) {
    if (debug) {
      console.log("Updating URL class url!");
    }
    try {
      chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
        try {
          if (tabs !== undefined && tabs[0] !== undefined) {
            this.parse(tabs[0].url);
          }
        } catch (e) {
          if (debug) {
            console.log("There is no valid url in tabs object: ");
          }
          if (debug) {
            console.log(tabs[0]);
          }
          if (debug) {
            console.log("The error is: " + e);
          }
        }

        if (callback !== undefined) {
          callback();
        }
      });
    } catch (e) {
      if (debug) {
        console.log("Cannot update url: " + e);
      }
    }
  }

  public parse(input: string | undefined) {
    // If the url has not changed, do nothing
    if (input === this.full || input === undefined) {
      return;
    }

    // Test url against parseBlacklist
    const inParseBlacklist = this.inputInList(input, this.parseBlacklist);
    if (inParseBlacklist.result) {
      this.stem = this.domain = this.normal = this.full = this.parseBlacklist[
        inParseBlacklist.position
      ];
    } else {
      try {
        const url = new URI(input).normalize();
        this.stem = new URI({
          hostname: url.hostname(),
          protocol: url.protocol(),
        }).toString();

        // If the subdomain is not www start the domain with that
        const subdomain = url.subdomain();
        this.domain = subdomain !== "www" && subdomain.length > 0 ? subdomain + "." + url.domain() : url.domain();

        this.normal = new URI({
          hostname: url.hostname(),
          path: url.path(),
          protocol: url.protocol(),
        }).toString();

        this.full = url.toString();
      } catch (e) {
        if (debug) {
          console.log(
            "Error parsing potential url: " + input + " Error is: " + e,
          );
        }
        this.stem = this.domain = this.normal = this.full = this.defaultUrl;
      }
    }
    this.setShouldUpdateMenu(input);
    this.setShouldAutoDark(input);
  }

  public inputInList(input: string, list: string[]): any {
    for (let i = 0; i < list.length; i++) {
      if (input.indexOf(list[i]) > -1) {
        return { result: true, position: i };
      }
    }
    return { result: false, position: -1 };
  }

  public setShouldAutoDark(input: string) {
    this.shouldAutoDark = !this.inputInList(input, this.autoDarkModeBlacklist)
      .result;
  }

  public setShouldUpdateMenu(input: string) {
    this.shouldUpdateMenu = !this.inputInList(input, this.updateBlacklist)
      .result;
  }

  public getFull(): string {
    return this.full;
  }

  public getStem(): string {
    return this.stem;
  }

  public getDomain(): string {
    if (debug) {
      console.log("Getting domain: " + this.domain);
    }
    return this.domain;
  }

  public getNormal(): string {
    return this.normal;
  }

  public getShouldAutoDark(): boolean {
    return this.shouldAutoDark;
  }

  public getShouldUpdateMenu() {
    return this.shouldUpdateMenu;
  }
}

export default Url;
