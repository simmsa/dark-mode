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

import * as fs from "fs";
import * as path from "path";

import * as ChromeExtension from "crx";

// tslint:disable:no-magic-numbers
const args = process.argv.slice(2);
const isDevBuild = args.length > 0 && args[0] === "--dev";

// tslint:disable:no-var-requires
const packageJson = require("../package.json");
const sanitizedVersion = packageJson.version.replace(/\./g, "-");

interface ExtFile {
  fileName: string;
  devFileName: string;
  path: string;
  devPath: string;
}

// tslint:disable:object-literal-sort-keys
const buildFileName = (ext: string): ExtFile => {
  return {
    fileName: `dark-mode-${sanitizedVersion}.${ext}`,
    devFileName: `dark-mode-${
      isDevBuild ? "dev-" : ""
    }${sanitizedVersion}.${ext}`,
    get path() {
      return path.join(__dirname, "..", "ReleaseBuilds", this.fileName);
    },
    get devPath() {
      return path.join(__dirname, "..", "ReleaseBuilds", this.devFileName);
    },
  };
};

const originalManifest = require("../manifest.json");

const addUpdateUrlToManifest = () => {
  const newJson = {
    update_url:
      "https://raw.githubusercontent.com/simmsa/dark-mode/master/update.xml",
  };
  const manifest = originalManifest;
  const updatedManifest = {
    ...manifest,
    newJson,
  };

  fs.writeFileSync("../manifest.json", stringifyManifest(updatedManifest));
};

const removeUpdateUrlFromManifest = () => {
  fs.writeFileSync("../manifest.json", originalManifest);
};

const stringifyManifest = (input): string => {
  const jsonSpaces = 2;
  return JSON.stringify(input, undefined, jsonSpaces);
};

const files = {
  crx: buildFileName("crx"),
  zip: buildFileName("zip"),
};

// let crxFileName = `dark-mode-${sanitizedVersion}.crx`;
// let zipFileName = `dark-mode-${sanitizedVersion}.zip`;

const crx = new ChromeExtension({
  // A link to the crx file of the current release
  codebase: `https://www.github.com/simmsa/dark-mode/releases/download/v${
    packageJson.version
  }/${files.crx.fileName}`,
  privateKey: fs.readFileSync(path.join(__dirname, "..", "key.pem")),
});

const extensionFiles = [
  path.join(__dirname, "..", "manifest.json"),
  path.join(__dirname, "..", "dist", "background-bundle.js"),
  path.join(__dirname, "..", "dist", "content-bundle.js"),
  path.join(__dirname, "..", "dist", "popup-bundle.js"),
  path.join(__dirname, "..", "index.html"),

  path.join(__dirname, "..", "styles", "css", "dark-mode.css"),
  path.join(__dirname, "..", "styles", "css", "dark-mode-popup.css"),

  path.join(__dirname, "..", "img", "dark-mode-inactive-128.png"),
  path.join(__dirname, "..", "img", "dark-mode-inactive-48.png"),
  path.join(__dirname, "..", "img", "dark-mode-inactive-38.png"),
  path.join(__dirname, "..", "img", "dark-mode-inactive-19.png"),
  path.join(__dirname, "..", "img", "dark-mode-inactive-16.png"),

  path.join(__dirname, "..", "img", "dark-mode-off-128.png"),
  path.join(__dirname, "..", "img", "dark-mode-off-48.png"),
  path.join(__dirname, "..", "img", "dark-mode-off-38.png"),
  path.join(__dirname, "..", "img", "dark-mode-off-19.png"),
  path.join(__dirname, "..", "img", "dark-mode-off-16.png"),

  path.join(__dirname, "..", "img", "dark-mode-on-128.png"),
  path.join(__dirname, "..", "img", "dark-mode-on-48.png"),
  path.join(__dirname, "..", "img", "dark-mode-on-38.png"),
  path.join(__dirname, "..", "img", "dark-mode-on-19.png"),
  path.join(__dirname, "..", "img", "dark-mode-on-16.png"),

  path.join(__dirname, "..", "img", "dark-mode-logo-w-text.svg"),

  path.join(__dirname, "..", "fonts", "MaterialIcons-Regular.ttf"),
  path.join(__dirname, "..", "fonts", "MaterialIcons-Regular.woff"),
  path.join(__dirname, "..", "fonts", "MaterialIcons-Regular.woff2"),
];

crx
  .load(extensionFiles)
  .then(crxBuild => crxBuild.loadContents())
  .then(zipBuffer => {
    fs.writeFileSync(files.zip.devPath, zipBuffer);
  });

addUpdateUrlToManifest();

crx
  .load(extensionFiles)
  .then(crxBuild => crxBuild.pack())
  .then(crxBuffer => {
    const updateXml = crx.generateUpdateXML();

    const xmlPath = path.join(__dirname, "..", "update.xml");

    fs.writeFileSync(xmlPath, updateXml);
    fs.writeFileSync(files.crx.devPath, crxBuffer);
  });

removeUpdateUrlFromManifest();
