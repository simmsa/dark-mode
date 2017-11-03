import * as path from "path";

import * as webpack from "webpack";

import * as Crx from "crx-webpack-plugin";

// tslint:disable:no-var-requires
const packageJson = require("../package.json");

// tslint:disable:object-literal-sort-keys
const config: webpack.Configuration = {
  entry: {
    background: "./src/background.ts",
    content: "./src/content.ts",
    popup: "./src/popup.tsx",
  },
  module: {
    rules: [
      {
        test: /\.ts*/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "[name]-bundle.js",
    path: path.join(__dirname, "..", "dist"),
  },
  plugins: [
    new Crx({
      // A list of files, starting with the manifest, to include in the crx
      contentPath: [
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

        path.join(__dirname, "..", "lib", "jquery.min.js"),

        path.join(__dirname, "..", "bootstrap", "js", "bootstrap.min.js"),
        path.join(__dirname, "..", "bootstrap", "js", "bootstrap-switch.min.js"),
        path.join(__dirname, "..", "bootstrap", "js", "bootstrap-slider.js"),

        path.join(__dirname, "..", "bootstrap", "css", "bootstrap.min.css"),
        path.join(__dirname, "..", "bootstrap", "css", "bootstrap-switch.min.css"),
        path.join(__dirname, "..", "bootstrap", "css", "bootstrap-slider.css"),

        path.join(__dirname, "..", "bootstrap", "fonts", "glyphicons-halflings-regular.ttf"),
      ],
      keyFile: path.join(__dirname, "..", "key.pem"),
      name: `dark-mode-${packageJson.version.replace(/\./g, "-")}`,
      outputPath: path.join(__dirname, "..", "ReleaseBuilds"),
      updateUrl: "https://github.com/simmsa/dark-mode",
    }),
  ],
};

export default config;
