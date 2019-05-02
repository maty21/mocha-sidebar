"use strict";

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const config = require("./lib/config");
const vscode = require("vscode");
const treeProvider = require("./lib/treeProvider");
const lensProvider = require("./lib/provider-extensions/mochaLens");
const decorationProvider = require("./lib/provider-extensions/decorationProvider");
const subscriptionRegister = require("./lib/subscriptionRegister");
const notificationsProvider = require("./lib/notificationsProvider");
const coverage = require("./lib/coverage/code-coverage");
const core = require("./lib/core");
const testStatusBar = require("./lib/provider-extensions/testStatusBar");

function bootstrap(context) {
  const _treeProvider = new treeProvider();
  const _codeLensProvider = new lensProvider(context, core);
  const _testStatusBar = new testStatusBar();
  const _decorationProvider = new decorationProvider();
  const _subscriptionRegister = new subscriptionRegister();
  const _notificationsProvider = new notificationsProvider();
  core.run().then(() => {
    _notificationsProvider.init();
    _decorationProvider.init(_notificationsProvider);
    _testStatusBar.init();
    _subscriptionRegister.init(context, _treeProvider);
    vscode.window.registerTreeDataProvider("mocha", _treeProvider);
    vscode.languages.registerCodeLensProvider(_codeLensProvider.selector, _codeLensProvider);
    if (config.coverage().enable) {
      coverage.run();
    }
  });
  //debugInit(_mochaProvider);
}

exports.activate = bootstrap;

// this method is called when your extension is deactivated
function deactivate() {}

exports.deactivate = deactivate;
