import * as fs from "fs";
import * as path from "path";

import * as ChromeExtension from "crx";

// tslint:disable:no-magic-numbers
const args = process.argv.slice(2);
const isDevBuild = args.length > 0 && args[0] === "--dev";

// tslint:disable:no-var-requires
const packageJson = require("../package.json");
const sanitizedVersion = packageJson.version.replace(/\./g, "-");
const crxFileName = `dark-mode-${isDevBuild
  ? "dev-"
  : ""}${sanitizedVersion}.crx`;

const crx = new ChromeExtension({
  // A link to the crx file of the current release
  codebase: `https://www.github.com/simmsa/dark-mode/releases/download/v${packageJson.version}/${crxFileName}`,
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
];

crx
  .load(extensionFiles)
  .then(crxBuild => crxBuild.pack())
  .then(crxBuffer => {
    const updateXml = crx.generateUpdateXML();

    const xmlPath = path.join(__dirname, "..", "update.xml");
    const extensionPath = path.join(
      __dirname,
      "..",
      "ReleaseBuilds",
      `dark-mode-${sanitizedVersion}.crx`,
    );

    fs.writeFileSync(xmlPath, updateXml);
    fs.writeFileSync(extensionPath, crxBuffer);
  });