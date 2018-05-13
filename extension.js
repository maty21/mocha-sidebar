'use strict';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const ChildProcess = require('child_process');
const escapeRegExp = require('escape-regexp');
const fs = require('fs');
const { runTestsOnSave } = require('./config');
const Glob = require('glob').Glob;
const parser = require('./parser');
const path = require('path');
const Promise = require('bluebird');
const Runner = require('./runner');
const config = require('./config');
const vscode = require('vscode');
const changesNotification = require('./changesNotification');
const mochaProvider = require('./mochaProvider');
const mochaLensProvider = require('./provider-extensions/mochaLens')
const access = Promise.promisify(fs.access);
const runner = new Runner();
const { debugAll, debugItem, debugLevel, debugInit } = require('./provider-extensions/runDebug');

const coverage = require('./lib/code-coverage');

const getOnTerminateFunc = func => {
  const noop = function () { };
  return config.sideBarOptions().showDebugTestStatus ? func : noop;
}
let lastPattern;
let lastRunResult;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  const subscriptions = context.subscriptions;
  const _mochaProvider = new mochaProvider();
  debugInit(_mochaProvider);
  vscode.window.registerTreeDataProvider('mocha', _mochaProvider)
  if(config.coverage().enable){
    coverage.run();
  }
  const _codeLensProvider = new mochaLensProvider(context, _mochaProvider);
  const _changesNotification = new changesNotification(_mochaProvider, _codeLensProvider);
  let registerCodeLens = vscode.languages.registerCodeLensProvider(_codeLensProvider.selector, _codeLensProvider);
  vscode.commands.executeCommand('setContext', 'runAutoPlay', runTestsOnSave())
  let runAutoPlay = runTestsOnSave();
  subscriptions.push(registerCodeLens);
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.autoPlayStart', (element) => {
    if (hasWorkspace()) {
      vscode.commands.executeCommand('setContext', 'runAutoPlay', false)
      _changesNotification.start();
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.autoPlayPause', (element) => {
    if (hasWorkspace()) {
      vscode.commands.executeCommand('setContext', 'runAutoPlay', true)
      _changesNotification.pause();
    }
  }))


  subscriptions.push(vscode.commands.registerCommand('mocha-maty.runAllDebug', (element) => {
    if (hasWorkspace()) {
      debugAll(element, getOnTerminateFunc(_mochaProvider.runAllTests));
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.debugLevel', (element) => {
    if (hasWorkspace()) {
      debugLevel(element, getOnTerminateFunc(_mochaProvider.runTestWithoutElement));
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.debugItem', (element) => {
    if (hasWorkspace()) {
      debugItem(element, getOnTerminateFunc(_mochaProvider.runTest));
    }
  }))


  subscriptions.push(vscode.commands.registerCommand('mocha-maty.runAllTests', (element) => {
    if (hasWorkspace()) {
      _mochaProvider.runAllTests(element);
      //runAllTests();
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.runTest', (element) => {
    if (hasWorkspace()) {
      _mochaProvider.runTest(element);
      //runAllTests();
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.runDescriberLevelTest', (element) => {
    if (hasWorkspace()) {
      _mochaProvider.runDescriberLevelTest(element);
      //runAllTests();
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.toggleCoverage', (element) => {
    if (hasWorkspace()) {
      try {
        coverage.toggleCoverage();
        
      } catch (e) {
        console.log(e);
      } 
     // _mochaProvider.runDescriberLevelTest(element);
      //runAllTests();
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.refreshExplorer', (element) => {
    if (hasWorkspace()) {
      _mochaProvider.refreshExplorer(element);
      _mochaProvider.updateDecorations(vscode.workspace.rootPath);
      _codeLensProvider.raiseEventOnUpdate();
      //runAllTests();
    }
  }))
  subscriptions.push(vscode.commands.registerCommand('mocha-maty.itemSelection', item => {
    if (hasWorkspace()) {
      _mochaProvider.itemSelection(item);
      //runAllTests();
    }
  }))


  subscriptions.push(vscode.commands.registerCommand('mocha.runAllTests', function () {
    if (hasWorkspace()) {
      runAllTests();
    }
  }));

  subscriptions.push(vscode.commands.registerCommand('mocha.runTestAtCursor', function () {
    if (hasWorkspace()) {
      runTestAtCursor();
    }
  }));

  subscriptions.push(vscode.commands.registerCommand('mocha.selectAndRunTest', function () {
    if (hasWorkspace()) {
      selectAndRunTest();
    }
  }));

  subscriptions.push(vscode.commands.registerCommand('mocha.runFailedTests', function () {
    if (hasWorkspace()) {
      runFailedTests();
    }
  }));

  subscriptions.push(vscode.commands.registerCommand('mocha.runTestsByPattern', function () {
    if (hasWorkspace()) {
      runTestsByPattern();
    }
  }));

  subscriptions.push(vscode.commands.registerCommand('mocha.runLastSetAgain', function () {
    if (hasWorkspace()) {
      runLastSetAgain();
    }
  }));

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);
  // status.command = 'extension.selectedLines';
  const statusTemplate = (passed,failed)=>` Tests  $(check) ${passed}   $(x) ${failed} `;
  status.text = statusTemplate(0,0);
  subscriptions.push(status);
  status.show();
  _mochaProvider.onDidChangeTreeData((rootItem) => {
    status.text = statusTemplate(_mochaProvider.results.passed.length,
        _mochaProvider.results.failed.length);
  })
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

exports.deactivate = deactivate;

function hasWorkspace() {
  const root = vscode.workspace.rootPath;
  const validWorkspace = typeof root === "string" && root.length;

  // console.log(root);
  // console.log(vscode);
  //console.log(validWorkspace);

  if (!validWorkspace) {
    vscode.window.showErrorMessage('Please open a folder before trying to execute Mocha.');
  }

  return validWorkspace;
}

function fork(jsPath, args, options) {
  return findNodeJSPath().then(execPath => new Promise((resolve, reject) => {
    resolve(ChildProcess.spawn(
      execPath,
      [jsPath].concat(args),
      options
    ))
  }), err => {
    vscode.window.showErrorMessage('Cannot find Node.js installation from environment variable');

    throw err;
  });
}

function runAllTests() {
  runner.loadTestFiles()
    .then(
      files => {
        if (!files.length) {
          return vscode.window.showWarningMessage('No tests were found.');
        }

        runner.runAll();
      }
    ).catch(
      err => vscode.window.showErrorMessage(`Failed to run tests due to ${err.message}`)
    );
}

function runTestAtCursor() {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return vscode.window.showErrorMessage('No active editors were found.');
  } else if (editor.document.languageId !== 'javascript') {
    return vscode.window.showErrorMessage('Mocha is only available for JavaScript files.');
  }

  let detectError = 'No test(s) were detected at the current cursor position.';
  let test = null;

  try {
    test = parser.getTestAtCursor(editor.document.getText(), editor.selection.active);
  } catch (e) {
    console.error(e);
    detectError = `Parsing failed while detecting test(s) at the current cursor position: ${e.message}`;
  }

  vscode.window.showErrorMessage(test);
  return runner.loadTestFiles()
    .then(() => {
      if (test) {
        return runner.runWithGrep(test.label);
      } else {
        // Only run test from the current file
        const currentFile = editor.document.fileName;
        runner.tests = runner.tests.filter(t => t.file === currentFile);

        return runner.runAll([`WARNING: ${detectError} Running all tests in the current file.`]);
      }
    })
    .catch(err => vscode.window.showErrorMessage(`Failed to run test(s) at the cursor position due to ${err.message}`));
}

function selectAndRunTest() {
  const rootPath = vscode.workspace.rootPath;

  vscode.window.showQuickPick(
    runner.loadTestFiles()
      .then(
        tests => {
          if (!tests.length) {
            vscode.window.showWarningMessage(`No tests were found.`);
            throw new Error('no tests found');
          }

          return tests.map(test => ({
            detail: path.relative(rootPath, test.file),
            label: test.fullName,
            test
          }));
        },
        err => {
          vscode.window.showErrorMessage(`Failed to find tests due to ${err.message}`);
          throw err;
        }
      )
  )
    .then(entry => {
      if (!entry) { return; }

      runner
        .runTest(entry.test)
        .catch(err => {
          vscode.window.showErrorMessage(`Failed to run selected tests due to ${err.message}`);
        });
    });
}

function runFailedTests() {
  runner.runFailed()
    .catch(() => vscode.window.showErrorMessage(`Failed to rerun failed tests due to ${err.message}`));
}

function runTestsByPattern() {
  return Promise.props({
    pattern: vscode.window.showInputBox({
      placeHolder: 'Regular expression',
      prompt: 'Pattern of tests to run',
      value: lastPattern || ''
    }),
    loadTests: runner.loadTestFiles()
  }).then(props => {
    const pattern = props.pattern;

    if (!pattern) { return; }

    lastPattern = pattern;

    return runner.runWithGrep(pattern);
  }, err => vscode.window.showErrorMessage(`Failed to run tests by pattern due to ${err.message}`));
}

function runLastSetAgain() {
  runner.runLastSet()
    .catch(() => vscode.window.showErrorMessage(`Failed to rerun last set due to ${err.message}`));
}
