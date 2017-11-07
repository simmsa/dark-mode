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

// tslint:disable:no-console
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

if (hasCleanGitStatus()) {
  inquirer.prompt({
    choices: Object.keys(incrementChoices),
    message: "Updating current version: " + currentVersion + "\nChoose the versioning increment",
    name: "versionIncrement",
    type: "list",
  })
  .then((answer) => {
    console.log(answer.versionIncrement);
    const newVersion = semver.inc(currentVersion, incrementChoices[answer.versionIncrement]);
    inquirer.prompt({
      message: "What features are included in version " + newVersion + ":",
      name: "commitNote",
      type: "input",
    })
    .then((nextAnswer) => {
      filesToCommit.map((fname) => {
        updatePackageVersionInFile(fname, newVersion);
      });

      exec("git add " + filesToCommit.join(" "), {encoding: "utf8"});
      exec(`git commit -m "v${newVersion}: ${nextAnswer.commitNote}"`);
      exec("git tag " + "v" + newVersion);
      console.log("Updated version to " + newVersion + " with message " + nextAnswer.commitNote);
    }).catch((error) => {
      console.log("Inner error", error);
    });

  }).catch((error) => {
    console.log("Unable to update version! Error: ", error);
  });
} else {
  console.log("This command needs a clean git status, please commit then try again!");
}
