"use strict";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const config = require("./lib/config");
const vscode = require("vscode");
const changesNotification = require("./lib/changesNotification");
const treeProvider = require("./lib/treeProvider");
const lensProvider = require("./lib/provider-extensions/mochaLens");
const decorationProvider = require("./lib/provider-extensions/setDecortaion");
const subscriptionRegister = require("./lib/subscriptionRegister");
const coverage = require("./lib/coverage/code-coverage");
const core = require("./lib/core");
const testStatusBar = require("./lib/provider-extensions/testStatusBar");

function bootstrap(context) {
  const _treeProvider = new treeProvider();
  const _codeLensProvider = new lensProvider(context, core);
  const _testStatusBar = new testStatusBar();
  const _decorationProvider = new decorationProvider();
  const _subscriptionRegister = new subscriptionRegister();

  core.run().then(r => {
    _decorationProvider.init();
    _testStatusBar.init();
    _subscriptionRegister.init(context, _treeProvider);

    vscode.window.registerTreeDataProvider("mocha", _treeProvider);
    vscode.languages.registerCodeLensProvider(_codeLensProvider.selector, _codeLensProvider);
  });
  //debugInit(_mochaProvider);

  if (config.coverage().enable) {
    coverage.run();
  }
}

exports.activate = bootstrap;

// this method is called when your extension is deactivated
function deactivate() {}

exports.deactivate = deactivate;
