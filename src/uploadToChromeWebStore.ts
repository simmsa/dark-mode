import * as child_process from "child_process";
import * as dotenv from "dotenv";
import * as inquirer from "inquirer";

import fetch from "node-fetch";

const exec = child_process.spawnSync;

const env = dotenv.config().parsed;

const chromeId = env.CHROME_OAUTH_CLIENT_ID;
const chromeSecret = env.CHROME_OAUTH_CLIENT_SECRET;
const chromeAppId = env.CHROME_WEBSTORE_APP_ID;

// tslint:disable:no-console
console.log("Uploading release to Chrome Web Store...");

const uploadToChromeWebStore = async (zipFLocation: string) => {
  console.log(
    "Login with your account in the browser to retrieve the chrome web store access code...",
  );

  // tslint:disable:max-line-length
  exec(
    `open "https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=${chromeId}&redirect_uri=urn:ietf:wg:oauth:2.0:oob"`,
  );

  const chromeCode = (await inquirer.prompt({
    message: "Enter the chrome code from the browser:",
    name: "code",
    type: "input",
  })).code;

  const chromeWebStoreResult = await fetch(
    "https://accounts.google.com/o/oauth2/token",
    {
      // tslint:disable:max-line-length
      body: `client_id=${chromeId}&client_secret=${chromeSecret}&code=${chromeCode}&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
  );

  const responseJson = await chromeWebStoreResult.json();
  console.log(responseJson);

  const chromeWebStoreToken = responseJson.access_token;

  if (!chromeWebStoreToken) {
    console.log(
      "Unable to retrieve chrome web store access token, see below for possible hints why this failed",
    );
    console.log(responseJson);
    return;
  }

  console.log(
    `Successfully retrieved chrome web store access token: ${chromeWebStoreToken}`,
  );

  const chromeHeaders = `-H "Authorization: Bearer ${chromeWebStoreToken}" -H "x-goog-api-version: 2"`;
  const storeUrl = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${chromeAppId}`;
  console.log("Uploading zip bundle to chrome web store...");

  exec(`curl ${chromeHeaders} -X PUT -T ${zipFLocation} -v ${storeUrl}`);

  console.log("Publishing new release...");

  const publishResult = await fetch(
    `https://www.googleapis.com/chromewebstore/v1.1/items/${chromeAppId}/publish`,
    {
      headers: {
        "Authorization": `Bearer ${chromeWebStoreToken}`,
        "x-goog-api-aersion": "2",
      },
      method: "POST",
    },
  );

  const publishResultJson = await publishResult.json();

  console.log(publishResultJson);
  console.log("Chrome web store release upload complete!");
};

export default uploadToChromeWebStore;
