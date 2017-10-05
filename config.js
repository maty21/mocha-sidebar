'use strict';

const vscode = require('vscode');

function getConfiguration() {
  return vscode.workspace.getConfiguration('mocha');
}

exports.env = function env() {
  return getConfiguration().env;
};

exports.options = function options() {
  return getConfiguration().options;
};

exports.node_options = function options() {
  return getConfiguration().node_options;
};

exports.files = function files() {
  return getConfiguration().files;
};

exports.subdirectory = function subdirectory() {
  return getConfiguration().subdirectory;
};

exports.requires = function requires() {
  const files = getConfiguration().requires || [];

  if(!Array.isArray(files))
    throw new Error("mocha.requires configuration must be an array of files");

  return files.map(s => s.toString());
};
