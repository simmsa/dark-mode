import * as child_process from "child_process";

import * as inquirer from "inquirer";
import * as jsonfile from "jsonfile";
import * as semver from "semver";

// tslint:disable:no-var-requires
const currentVersion = require("../package").version;
const exec = child_process.execSync;

const incrementChoices = {};
incrementChoices["patch '" + semver.inc(currentVersion, "patch") + "'"] = "patch";
incrementChoices["minor '" + semver.inc(currentVersion, "minor") + "'"] = "minor";
incrementChoices["major '" + semver.inc(currentVersion, "major") + "'"] = "major";

const filesToCommit = ["package.json", "package-lock.json", "manifest.json"];

const updatePackageVersionInFile = (fname, versionNumber) => {
  const currentPackage = require(`../${fname}`);

  const packageWithUpdatedVersion = {
    ...currentPackage,
    version: versionNumber,
  };

  jsonfile.writeFileSync(fname, packageWithUpdatedVersion, {spaces: 2});
};

const hasCleanGitStatus = () => {
  const status = exec("git status --porcelain", {encoding: "utf8"}).trim();
  return status === "";
};

// tslint:disable:no-console
const main = async () => {
  if (!hasCleanGitStatus()) {
    console.log("This command needs a clean git status, please commit then try again!");
    return;
  }

  const nextVersionChoice = (await inquirer.prompt({
    choices: Object.keys(incrementChoices),
    message: "Updating current version: " + currentVersion + "\nChoose the versioning increment",
    name: "versionIncrement",
    type: "list",
  })).versionIncrement;

  const nextVersionNumber: string = semver.inc(currentVersion, incrementChoices[nextVersionChoice]);

  const commitLineNumChars = 72;

  let commitTitleIsValid = false;
  let commitTitle: string = "";

  while (!commitTitleIsValid) {
    commitTitle = (await inquirer.prompt({
      message: "Add a title for version " + nextVersionNumber + ":",
      name: "commitTitle",
      type: "input",
    })).commitTitle;

    if (commitTitle.length  + nextVersionNumber.length > commitLineNumChars) {
      console.log("Commit title is too long! Please try again");
    } else {
      commitTitleIsValid = true;
    }
  }

  let readBulletPoint = true;
  const bulletPoints: string[] = [];

  while (readBulletPoint) {
    const bulletPoint = (await inquirer.prompt({
      message: "Add a bullet point for " + nextVersionNumber + ". Press x to exit:\n",
      name: "bulletPoint",
      type: "input",
    })).bulletPoint;

    if (bulletPoint === "x") {
      readBulletPoint = false;
    } else {
      // Use `fold` to elegantly wrap text
      const formattedBulletPoint = exec(`echo "${bulletPoint}" | fold -s -w ${commitLineNumChars}`).toString();
      bulletPoints.push(formattedBulletPoint);
    }
  }

  const formattedBulletPoints = bulletPoints.map((point) => {
    return `* ${point}`;
  }).join("\n");

  const completeCommit = `v${nextVersionNumber}: ${commitTitle}\n\n${formattedBulletPoints}`;

  filesToCommit.map((fname) => {
    updatePackageVersionInFile(fname, nextVersionNumber);
  });

  exec("git add " + filesToCommit.join(" "), {encoding: "utf8"});
  exec(`git commit -m "${completeCommit}"`);
  exec("git tag " + "v" + nextVersionNumber);

  exec(`echo "${formattedBulletPoints}" | pbcopy`);

  console.log(`Updated ${currentVersion} -> ${nextVersionNumber} with message:\n${completeCommit}`);
  console.log("Copied bullet points to the clipboard!");
};

(async () => {
  await main();
  process.exit(0);
})();
