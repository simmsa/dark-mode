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

import * as child_process from "child_process";

import * as dotenv from "dotenv";
import * as inquirer from "inquirer";
import * as jsonfile from "jsonfile";
import fetch from "node-fetch";
import * as semver from "semver";
import * as wordwrap from "wordwrap";

import uploadToChromeWebStore from "./uploadToChromeWebStore";

// tslint:disable:no-var-requires
const currentVersion = require("../package").version;
const commitLineNumChars = 72;
const exec = child_process.execSync;
const wrap = wordwrap(commitLineNumChars);

const incrementChoices = {};
incrementChoices["patch '" + semver.inc(currentVersion, "patch") + "'"] =
  "patch";
incrementChoices["minor '" + semver.inc(currentVersion, "minor") + "'"] =
  "minor";
incrementChoices["major '" + semver.inc(currentVersion, "major") + "'"] =
  "major";

const filesToCommit = [
  "package.json",
  "package-lock.json",
  "manifest.json",
  "update.xml",
];

const filesToUpdateVersion = [
  "package.json",
  "package-lock.json",
  "manifest.json",
];

const updatePackageVersionInFile = (fname, versionNumber) => {
  const currentPackage = require(`../${fname}`);

  const packageWithUpdatedVersion = {
    ...currentPackage,
    version: versionNumber,
  };

  jsonfile.writeFileSync(fname, packageWithUpdatedVersion, { spaces: 2 });
};

const hasCleanGitStatus = () => {
  const status = exec("git status --porcelain", { encoding: "utf8" }).trim();
  return status === "";
};

// tslint:disable:no-console
const main = async () => {
  try {
    if (!hasCleanGitStatus()) {
      console.log(
        "This command needs a clean git status, please commit then try again!",
      );
      return;
    }

    const nextVersionChoice = (await inquirer.prompt({
      choices: Object.keys(incrementChoices),
      message:
        "Updating current version: " +
        currentVersion +
        "\nChoose the versioning increment",
      name: "versionIncrement",
      type: "list",
    })).versionIncrement;

    const nextVersionNumber: string = semver.inc(
      currentVersion,
      incrementChoices[nextVersionChoice],
    );

    let commitTitleIsValid = false;
    let commitTitle: string = "";

    while (!commitTitleIsValid) {
      commitTitle = (await inquirer.prompt({
        message: "Add a title for version " + nextVersionNumber + ":",
        name: "commitTitle",
        type: "input",
      })).commitTitle;

      if (commitTitle.length + nextVersionNumber.length > commitLineNumChars) {
        console.log("Commit title is too long! Please try again");
      } else {
        commitTitleIsValid = true;
      }
    }

    let readBulletPoint = true;
    const bulletPoints: string[] = [];

    while (readBulletPoint) {
      const bulletPoint: string = (await inquirer.prompt({
        message:
          "Add a bullet point for " +
          nextVersionNumber +
          ". Press x to exit:\n",
        name: "bulletPoint",
        type: "input",
      })).bulletPoint;

      if (bulletPoint === "x") {
        readBulletPoint = false;
      } else {
        const wrappedBulletPoint = wrap(bulletPoint);
        bulletPoints.push(wrappedBulletPoint);
      }
    }

    const hasBulletPoints = bulletPoints.length > 0;

    const formattedBulletPoints = bulletPoints
      .map(point => {
        return `* ${point}`;
      })
      .join("\n");

    const commitBulletPoints = hasBulletPoints
      ? `\n\n${formattedBulletPoints}`
      : "";

    const completeCommit = `v${nextVersionNumber}: ${commitTitle}${commitBulletPoints}`;

    filesToUpdateVersion.map(fname => {
      updatePackageVersionInFile(fname, nextVersionNumber);
    });

    console.log(`Building ${nextVersionNumber} crx file...`);
    exec("npm run build");

    exec("git add " + filesToCommit.join(" "), { encoding: "utf8" });
    exec(`git commit -m "${completeCommit}"`);
    exec("git tag " + "v" + nextVersionNumber);

    exec(`echo "${formattedBulletPoints}" | pbcopy`);

    console.log(
      `Committed ${currentVersion} -> ${nextVersionNumber} with message:\n${completeCommit}`,
    );

    const pushToMaster = (await inquirer.prompt({
      message: "Should we push to origin?",
      name: "shouldUpload",
      type: "confirm",
    })).shouldUpload;

    if (pushToMaster) {
      console.log("Pushing to origin...");
      exec("git push origin master");
    }

    const uploadReleaseToGithub = (await inquirer.prompt({
      message: "Would you like to upload this to github as a release?",
      name: "shouldUpload",
      type: "confirm",
    })).shouldUpload;

    if (uploadReleaseToGithub) {
      const env = dotenv.config().parsed;
      const ghToken = env.GITHUB_TOKEN;
      const baseGitHubUrl = (accessPoint: string) =>
        `https://${accessPoint}.github.com/repos/simmsa/dark-mode`;
      const githubApiUrl = baseGitHubUrl("api");
      const githubUploadUrl = baseGitHubUrl("uploads");

      console.log("Uploading github release...");

      const uploadResult = await fetch(
        `${githubApiUrl}/releases?access_token=${ghToken}`,
        {
          body: JSON.stringify({
            body: hasBulletPoints ? formattedBulletPoints : "",
            draft: false,
            name: commitTitle,
            prerelease: false,
            tag_name: `v${nextVersionNumber}`,
          }),
          method: "POST",
        },
      );

      const uploadJson = await uploadResult.json();
      const releaseId = uploadJson.id;

      const successStatus = 201;
      if (uploadResult.status !== successStatus) {
        console.log("Failed github release upload!");
        return;
      }

      console.log("Metadata uploaded successfully!");
      console.log("Uploading release crx...");

      const crxFName = `dark-mode-${nextVersionNumber.replace(/\./g, "-")}.crx`;
      const crxFLocation = `ReleaseBuilds/${crxFName}`;

      const uploadUrl = `${githubUploadUrl}/releases/${releaseId}/assets?name=${crxFName}`;

      const contentType = '-H "Content-Type: application/zip"';
      const auth = `-H "Authorization: token ${ghToken}"`;

      // We use `curl` because `node-fetch` and the github api don't get along
      // with file uploads. It seems to be related to chunked uploads and file
      // streams
      exec(
        `curl ${contentType} ${auth} --data-binary @${crxFLocation} ${uploadUrl}`,
      );
    }

    const uploadToChromeStore = (await inquirer.prompt({
      message: "Would you like to upload this to the chrome web store?",
      name: "shouldUpload",
      type: "confirm",
    })).shouldUpload;

    if (uploadToChromeStore) {
      const zipFName = `dark-mode-${nextVersionNumber.replace(/\./g, "-")}.zip`;
      const zipFLocation = `ReleaseBuilds/${zipFName}`;

      await uploadToChromeWebStore(zipFLocation);
    }
  } catch (e) {
    throw e;
  }
};

(async () => {
  await main();
  console.log("incrementVersion complete!");
})();
