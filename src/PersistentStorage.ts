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

const debug = false;

class PersistentStorage {
  protected dataObject: any;
  private name: string;

  private lastSave: number;

  constructor(name: string) {
    this.setData(name);
    this.lastSave = Date.now();
  }

  private setData(savedObjectName: string) {
    this.name = savedObjectName;
    // Special syntax for using `this` inside a callback
    chrome.storage.local.get(savedObjectName, result => {
      this.dataObject = result[this.name];

      // Guard against undefined `dataObject`
      if (typeof this.dataObject === "undefined") {
        this.dataObject = {};
      }
    });
  }

  protected getAll(): any {
    return this.dataObject;
  }

  protected get(key: string): any {
    try {
      return this.dataObject[key];
    } catch (e) {
      if (debug) {
        // tslint:disable:no-console
        console.log(
          key +
            " does not exist in PersistentStorage object named: " +
            this.name,
        );
      }
    }
  }

  protected add(key: string, data: any) {
    this.dataObject[key] = data;
  }

  protected exists(key: string, object: any): boolean {
    if (object.hasOwnProperty(key)) {
      return true;
    }
    return false;
  }

  protected remove(key: string) {
    if (this.exists(key, this.dataObject)) {
      delete this.dataObject[key];
    }
  }

  protected save() {
    const saveIntervalMs = 100;
    if (Date.now() > this.lastSave + saveIntervalMs) {
      chrome.storage.local.remove(this.name);
      if (debug) {
        console.log("Saving: " + this.name);
      }
      const saveObject = {};
      saveObject[this.name] = this.dataObject;
      if (debug) {
        console.log(saveObject);
      }
      chrome.storage.local.set(saveObject);
      this.lastSave = Date.now();
    }
  }

  protected clear() {
    chrome.storage.local.remove(this.name);
    this.setData(this.name);
  }
}

export default PersistentStorage;
