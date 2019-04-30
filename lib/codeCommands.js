/* eslint-disable no-console */
const vscode = require("vscode");
const path = require("path");
const runner = require("./runner");
const parser = require("./parser");

let lastPattern;
let lastRunResult;

const runAllTests = () => {
  runner
    .loadTestFiles()
    .then(files => {
      if (!files.length) {
        return vscode.window.showWarningMessage("No tests were found.");
      }

      runner.runAll();
    })
    .catch(err => vscode.window.showErrorMessage(`Failed to run tests due to ${err.message}`));
};

const runTestAtCursor = () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return vscode.window.showErrorMessage("No active editors were found.");
  } else if (editor.document.languageId !== "javascript") {
    return vscode.window.showErrorMessage("Mocha is only available for JavaScript files.");
  }

  let detectError = "No test(s) were detected at the current cursor position.";
  let test = null;

  try {
    test = parser.getTestAtCursor(editor.document.getText(), editor.selection.active);
  } catch (e) {
    console.error(e);
    detectError = `Parsing failed while detecting test(s) at the current cursor position: ${e.message}`;
  }
  vscode.window.showErrorMessage(test);
  return runner
    .loadTestFiles()
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
};

const selectAndRunTest = () => {
  const rootPath = vscode.workspace.rootPath;

  vscode.window
    .showQuickPick(
      runner.loadTestFiles().then(
        tests => {
          if (!tests.length) {
            vscode.window.showWarningMessage(`No tests were found.`);
            throw new Error("no tests found");
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
      if (!entry) {
        return;
      }

      runner.runTest(entry.test).catch(err => {
        vscode.window.showErrorMessage(`Failed to run selected tests due to ${err.message}`);
      });
    });
};

const runFailedTests = () => {
  runner.runFailed().catch(() => vscode.window.showErrorMessage(`Failed to rerun failed tests due to ${err.message}`));
};

const runTestsByPattern = () => {
  return Promise.props({
    pattern: vscode.window.showInputBox({
      placeHolder: "Regular expression",
      prompt: "Pattern of tests to run",
      value: lastPattern || ""
    }),
    loadTests: runner.loadTestFiles()
  }).then(
    props => {
      const pattern = props.pattern;

      if (!pattern) {
        return;
      }

      lastPattern = pattern;

      return runner.runWithGrep(pattern);
    },
    err => vscode.window.showErrorMessage(`Failed to run tests by pattern due to ${err.message}`)
  );
};

const runLastSetAgain = () => {
  runner.runLastSet().catch(() => vscode.window.showErrorMessage(`Failed to rerun last set due to ${err.message}`));
};

module.exports = { runAllTests, runFailedTests, runLastSetAgain, runTestAtCursor, runTestsByPattern, selectAndRunTest };
