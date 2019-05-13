/* eslint-disable no-console */
const vscode = require("vscode");
const path = require("path");
const core = require("./core");
const config = require("./config");
const { runLastSetAgain, runFailedTests, runTestAtCursor, runTestsByPattern, selectAndRunTest } = require("./codeCommands");

class subscriptionRegister {
  init(context, treeProvider, coverage) {
    const subscriptions = context.subscriptions;
    const { commands } = vscode;
    this._treeProvider = treeProvider;
    this._coverage = coverage;
    subscriptions.push(
      commands.registerCommand("mocha-maty.autoPlayStart", element => {
        if (this._hasWorkspace()) {
          commands.executeCommand("setContext", "runAutoPlay", false);
          //  _changesNotification.start();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha-maty.autoPlayPause", element => {
        if (this._hasWorkspace()) {
          commands.executeCommand("setContext", "runAutoPlay", true);
          //   _changesNotification.pause();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha-maty.runAllDebug", element => {
        if (this._hasWorkspace()) {
          core.debug(null, null, core.runTypes.ALL);
        }
      })
    );
    subscriptions.push(
      vscode.commands.registerCommand("mocha-maty.debugLevel", element => {
        if (this._hasWorkspace()) {
          core.debug(element.name, element, core.runTypes.SUITE);
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.debugItem", ({ item }) => {
        if (this._hasWorkspace()) {
          const test = item.__test ? item.__test : item;
          core.debug(test.fullName, test, core.runTypes.TEST);
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha-maty.runAllTests", element => {
        if (this._hasWorkspace()) {
          core.execute(null, core.runTypes.ALL);
          //runAllTests();
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.runTest", ({ item }) => {
        if (this._hasWorkspace()) {
          const test = item.__test ? item.__test : item;
          core.execute(test, core.runTypes.TEST);
          //runAllTests();
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.runDescriberLevelTest", element => {
        if (this._hasWorkspace()) {
          //  _mochaProvider.runDescriberLevelTest(element);
          core.execute(element, core.runTypes.SUITE);
          //runAllTests();
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.toggleCoverage", element => {
        if (this._hasWorkspace()) {
          try {
            coverage.toggleCoverage();
          } catch (e) {
            console.log(e);
          }
          //runAllTests();
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.refreshExplorer", element => {
        if (this._hasWorkspace()) {
          core.run();
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.coverage", element => {
        if (this._hasWorkspace()) {
          if (config.coverage().enable) {
            this._coverage.run();
          }
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha-maty.setSubdirectory", element => {
        if (this._hasWorkspace() && element.path) {
          const relativePath = path.relative(vscode.workspace.rootPath, element.path);
          config.setSubdirectory(relativePath || element.path);
        }
      })
    );
    subscriptions.push(
      commands.registerCommand("mocha-maty.itemSelection", item => {
        if (this._hasWorkspace()) {
          treeProvider.itemSelection(item);
          //runAllTests();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha.runAllTests", () => {
        if (this._hasWorkspace()) {
          core.execute();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha.runTestAtCursor", () => {
        if (this._hasWorkspace()) {
          runTestAtCursor();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha.selectAndRunTest", () => {
        if (this._hasWorkspace()) {
          selectAndRunTest();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha.runFailedTests", () => {
        if (this._hasWorkspace()) {
          runFailedTests();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha.runTestsByPattern", () => {
        if (this._hasWorkspace()) {
          runTestsByPattern();
        }
      })
    );

    subscriptions.push(
      commands.registerCommand("mocha.runLastSetAgain", () => {
        if (this._hasWorkspace()) {
          runLastSetAgain();
        }
      })
    );
  }

  _hasWorkspace() {
    const root = vscode.workspace.rootPath;
    const validWorkspace = typeof root === "string" && root.length;

    if (!validWorkspace) {
      vscode.window.showErrorMessage("Please open a folder before trying to execute Mocha.");
    }

    return validWorkspace;
  }
}

module.exports = subscriptionRegister;
