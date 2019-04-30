/* eslint-disable no-console */
const vscode = require("vscode");
const path = require("path");
const changesNotification = require("./changesNotification");
const core = require("./core");
const config = require("./config");
const coverage = require("./coverage/code-coverage");
const { runLastSetAgain, runFailedTests, runTestAtCursor, runTestsByPattern, selectAndRunTest } = require("./codeCommands");

const hasWorkspace = () => {
  const root = vscode.workspace.rootPath;
  const validWorkspace = typeof root === "string" && root.length;

  if (!validWorkspace) {
    vscode.window.showErrorMessage("Please open a folder before trying to execute Mocha.");
  }

  return validWorkspace;
};

const subscriptionRegister = (context, treeProvider) => {
  const subscriptions = context.subscriptions;
  const { commands } = vscode;
  subscriptions.push(
    commands.registerCommand("mocha-maty.autoPlayStart", element => {
      if (hasWorkspace()) {
        commands.executeCommand("setContext", "runAutoPlay", false);
        //  _changesNotification.start();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha-maty.autoPlayPause", element => {
      if (hasWorkspace()) {
        commands.executeCommand("setContext", "runAutoPlay", true);
        //   _changesNotification.pause();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha-maty.runAllDebug", element => {
      if (hasWorkspace()) {
        core.debug(null, null, core.runTypes.ALL);
      }
    })
  );
  subscriptions.push(
    vscode.commands.registerCommand("mocha-maty.debugLevel", element => {
      if (hasWorkspace()) {
        core.debug(element.name, element, core.runTypes.SUITE);
      }
    })
  );
  subscriptions.push(
    commands.registerCommand("mocha-maty.debugItem", ({ item }) => {
      if (hasWorkspace()) {
        const test = item.__test ? item.__test : item;
        core.debug(test.fullName, test, core.runTypes.TEST);
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha-maty.runAllTests", element => {
      if (hasWorkspace()) {
        core.execute(null, core.runTypes.ALL);
        //runAllTests();
      }
    })
  );
  subscriptions.push(
    commands.registerCommand("mocha-maty.runTest", ({ item }) => {
      if (hasWorkspace()) {
        const test = item.__test ? item.__test : item;
        core.execute(test, core.runTypes.TEST);
        //runAllTests();
      }
    })
  );
  subscriptions.push(
    commands.registerCommand("mocha-maty.runDescriberLevelTest", element => {
      if (hasWorkspace()) {
        //  _mochaProvider.runDescriberLevelTest(element);
        core.execute(element, core.runTypes.SUITE);
        //runAllTests();
      }
    })
  );
  subscriptions.push(
    commands.registerCommand("mocha-maty.toggleCoverage", element => {
      if (hasWorkspace()) {
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
      if (hasWorkspace()) {
        core.run();
      }
    })
  );
  subscriptions.push(
    commands.registerCommand("mocha-maty.coverage", element => {
      if (hasWorkspace()) {
        if (config.coverage().enable) {
          coverage.runViaRequest();
        }
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha-maty.setSubdirectory", element => {
      if (hasWorkspace() && element.path) {
        const relativePath = path.relative(vscode.workspace.rootPath, element.path);
        config.setSubdirectory(relativePath || element.path);
      }
    })
  );
  subscriptions.push(
    commands.registerCommand("mocha-maty.itemSelection", item => {
      if (hasWorkspace()) {
        treeProvider.itemSelection(item);
        //runAllTests();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha.runAllTests", () => {
      if (hasWorkspace()) {
        core.execute();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha.runTestAtCursor", () => {
      if (hasWorkspace()) {
        runTestAtCursor();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha.selectAndRunTest", () => {
      if (hasWorkspace()) {
        selectAndRunTest();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha.runFailedTests", () => {
      if (hasWorkspace()) {
        runFailedTests();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha.runTestsByPattern", () => {
      if (hasWorkspace()) {
        runTestsByPattern();
      }
    })
  );

  subscriptions.push(
    commands.registerCommand("mocha.runLastSetAgain", () => {
      if (hasWorkspace()) {
        runLastSetAgain();
      }
    })
  );
};

module.exports = subscriptionRegister;
