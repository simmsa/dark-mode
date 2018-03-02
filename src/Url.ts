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

  private parseBlacklist = ["chrome://", "chrome-extension://"];

  private autoDarkModeBlacklist = this.parseBlacklist.concat([".pdf"]);

  constructor(newUrl?: string) {
    if (typeof newUrl !== "undefined") {
      this.parse(newUrl);
    } else {
      this.stem = this.domain = this.normal = this.full = this.defaultUrl;
      this.shouldAutoDark = true;
      this.shouldUpdateMenu = false;
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

  // Tries to parse the unique parts of a url
  public parse(input: string | undefined) {
    // If the url has not changed, do nothing
    if (input === this.full || typeof input === "undefined") {
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
        const hostname = url.hostname();
        const protocol = url.protocol();
        const path = url.path();
        const dummyString = "test";
        this.stem =
          hostname && protocol
            ? new URI({
                hostname,
                protocol,
              }).toString()
            : protocol !== ""
              ? new URI({ protocol, hostname: dummyString })
                  .toString()
                  .replace(dummyString, "")
              : input;

        // If the subdomain is not www start the domain with that
        const subdomain = url.subdomain();
        this.domain =
          subdomain !== "www" && subdomain.length > 0
            ? subdomain + "." + url.domain()
            : url.domain();

        if (protocol === "file") {
          this.domain = path;
        }

        if (this.domain === "") {
          this.domain = input;
        }

        // We need the path parts raw (not normalized) hence the reparse
        const pathParts = new URI(input).path().split("/");

        // Many webapps use these characters as unique identifiers in urls. It
        // seems desirable to remove paths with these chars, because this
        // gives a less unique url is more in line with what the user
        // intended.
        const removeFinalPathPattern = new RegExp("[+@!]");
        const normalizedPath: string =
          pathParts.length <= 1
            ? pathParts.join("")
            : pathParts
                .map(section => {
                  return section.match(removeFinalPathPattern) ? "" : section;
                })
                .filter(section => section.length > 0)
                .join("/");

        this.normal =
          path && hostname && protocol
            ? new URI({
                hostname: url.hostname(),
                path: normalizedPath,
                protocol: url.protocol(),
              }).toString()
            : protocol === "file"
              ? new URI({ protocol, path }).toString()
              : input;

        this.full = input;
      } catch (e) {
        // Return something unique
        this.stem = this.domain = this.normal = this.full = input;
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
