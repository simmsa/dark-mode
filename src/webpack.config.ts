import * as path from "path";

import * as webpack from "webpack";

// tslint:disable:object-literal-sort-keys
const config = (): webpack.Configuration => {
  return {
    entry: {
      background: "./src/background.ts",
      content: "./src/content.ts",
      popup: "./src/popup/index.tsx",
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
  };
};

export default config;
