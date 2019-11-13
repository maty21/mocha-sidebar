"use strict";

const vscode = require("vscode");
const path = require("path");
const { getInstalledPathSync } = require("get-installed-path");
const messages = require("./output/messages");
const getConfiguration = () => vscode.workspace.getConfiguration("mocha");
let mochaLocation = null;
let nycLocation = null;

const refreshConfig = () => {
  mochaPath(true);
  nycPath(true);
};
const mochaNodeModulesPath = () => getConfiguration().path;
const mochaPath = (refresh = false) => {
  if (!mochaLocation || refresh) {
    let mochaPath = getConfiguration().path;
    if (mochaPath) {
      // if (!path.isAbsolute(mochaPath)) {
      //   mochaPath = path.join(vscode.workspace.rootPath, mochaPath);
      // }

      return (mochaLocation = { require: path.join(mochaPath, "index.js"), binary: path.join(mochaPath, "/bin/_mocha") });
    } else {
      try {
        const baseMochaFolder = getInstalledPathSync("mocha", { cwd: vscode.workspace.rootPath, local: true });
        //const mochaSuffix = "/bin/mocha";
        return (mochaLocation = { require: path.join(baseMochaFolder, "index.js"), binary: path.join(baseMochaFolder, "/bin/_mocha") });
      } catch (error) {
        messages.send(messages.channelName.TEST, `cannot find mocha locally and there is no setting for other path,${error}`);
      }
      return (mochaLocation = { require: "mocha", binary: "mocha" });
    }
  }
  return mochaLocation;
};

const nycPath = (refresh = false) => {
  if (!nycLocation || refresh) {
    let nycPath = getConfiguration().nycPath;
    if (nycPath) {
      return nycPath;
    } else {
      try {
        let _pathToNyc = getInstalledPathSync("nyc", { cwd: vscode.workspace.rootPath, local: true });
        _pathToNyc = path.join(_pathToNyc, "/bin/nyc.js");
        return _pathToNyc;
      } catch (error) {
        messages.send(messages.channelName.COVERAGE, `cant find nyc locally and there is no setting for other path,${error}`);
        messages.sendPopUpMessage(`cant find nyc locally and there is no setting for other path,${error}`);
      }
      return null;
    }
  }
  return nycLocation;
};
const env = () => getConfiguration().env;
const logVerbose = () => getConfiguration().logVerbose;
const runTestsOnSave = () => getConfiguration().runTestsOnSave;
const options = () => getConfiguration().options;
const node_options = () => getConfiguration().node_options;
const files = () => getConfiguration().files;
const parallelTests = () => getConfiguration().parallelTests;
const subdirectory = () => getConfiguration().subdirectory;
const setSubdirectory = subdirectory => getConfiguration().update("subdirectory", subdirectory);
const requires = () => {
  const files = getConfiguration().requires || [];
  if (!Array.isArray(files)) throw new Error("mocha.requires configuration must be an array of files");
  return files.map(s => s.toString());
};
const sideBarOptions = () => getConfiguration().sideBarOptions;
const coverage = () => getConfiguration().coverage;
const coverageReporters = () => getConfiguration().coverage.reporters;
const showErrorPopup = () => getConfiguration().showErrorPopup;
const debugSettingsName = () => getConfiguration().debugSettingsName;
module.exports = {
  refreshConfig,
  mochaNodeModulesPath,
  mochaPath,
  nycPath,
  env,
  logVerbose,
  runTestsOnSave,
  options,
  node_options,
  files,
  parallelTests,
  subdirectory,
  setSubdirectory,
  requires,
  sideBarOptions,
  coverage,
  coverageReporters,
  showErrorPopup,
  debugSettingsName
};
