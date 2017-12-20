'use strict';

const vscode = require('vscode');

const getConfiguration = () => vscode.workspace.getConfiguration('mocha');

exports.env = () => getConfiguration().env;
exports.runTestsOnSave = () => getConfiguration().runTestsOnSave;
exports.options = () => getConfiguration().options;
exports.node_options = () => getConfiguration().node_options;
exports.files = () => getConfiguration().files;
exports.subdirectory = () => getConfiguration().subdirectory;
exports.requires = () => {
  const files = getConfiguration().requires || [];
  if (!Array.isArray(files))
    throw new Error("mocha.requires configuration must be an array of files");
  return files.map(s => s.toString());
};
exports.sideBarOptions = () => getConfiguration().sideBarOptions;