'use strict';


const escapeRegExp = require('escape-regexp');
const MochaShim = require('./mochashim');
const path = require('path');
const vscode = require('vscode');

let tests = [];
let lastRunResult = null;
let mochaProviderRef = null;


function Runner() {
}


Runner.prototype.setMochaProvider = (mochaProvider) => mochaProviderRef = mochaProvider;
Runner.prototype.loadTestFiles = function () {
  return MochaShim.findTests(vscode.workspace.rootPath)
    .then(tests => {
      tests = tests;

      return tests;
    });
};

Runner.prototype.loadAsyncTestFiles = async () => {
  //  vscode.window.showWarningMessage(`entering loadAsyncTestFiles ${vscode.workspace.rootPath}`)
  //return process.platform == 'win32' ? MochaShim.findTestsProcess(vscode.workspace.rootPath) : MochaShim.findTests(vscode.workspace.rootPath);
 
  const tests= await MochaShim.findTests(vscode.workspace.rootPath);
  return tests;
};

Runner.prototype.runAsyncTests = async (testFiles, grep, logMessages) => {
  //  vscode.window.showWarningMessage(`entering loadAsyncTestFiles ${vscode.workspace.rootPath}`)
  //return process.platform == 'win32' ? MochaShim.runTestsInProcess(testFiles, grep, logMessages) : MochaShim.runTests(testFiles, grep, logMessages);
  const res = await MochaShim.runTests(testFiles, grep, logMessages);
  lastRunResult = res;
  return res;
};



Runner.prototype._runMocha = function (testFiles, grep, logMessages) {
  let tests = testFiles.map(test => test.file);
  return MochaShim.runAsyncTests(dedupeStrings(tests), grep, logMessages)
    .then(result => {
      lastRunResult = result;

      const numFailed = (result.failed || []).length;

      numFailed && vscode.window.showWarningMessage(`There are ${numFailed} test${numFailed > 1 ? 's' : ''} failed.`);
    },
      err => {
        console.error(err);
        throw err;
      });
};
Runner.prototype._runMochaSingleTest = function (testFiles, grep, logMessages) {

  return MochaShim.runTests(dedupeStrings(testFiles), grep, logMessages)
    .then(result => {
      lastRunResult = result;

      const numFailed = (result.failed || []).length;

      numFailed && vscode.window.showWarningMessage(`There are ${numFailed} test${numFailed > 1 ? 's' : ''} failed.`);
    },
      err => {
        console.error(err);
        throw err;
      });
};

Runner.prototype.runAll = function (logMessages) {
  return this.runAsyncTests(tests.map(test => test.file), null, logMessages);
};

Runner.prototype.runWithGrep = async function (grep) {
  const res = await this.runAsyncTests(tests.map(test => test.file), grep);
  mochaProviderRef.hookResultsFromCommands(res);
};

Runner.prototype.runTest = function (test) {
  return this.runAsyncTests([test], `^${escapeRegExp(test.fullName)}$`);
};

Runner.prototype.runFailed = async function () {
  const failed = (lastRunResult || {}).failed || [];

  if (!failed.length) {
    vscode.window.showWarningMessage(`No tests failed in last run.`);

    return new Promise(resolve => resolve());
  } else {
    const res = await this.runAsyncTests(
      dedupeStrings(failed.map(test => test.file)),
      `^${failed.map(test => `(${escapeRegExp(test.fullName)})`).join('|')}$`
    )
    mochaProviderRef.hookResultsFromCommands(res);
  }
};

Runner.prototype.runLastSet = async function () {
  const
    failed = (lastRunResult || {}).failed || [],
    passed = (lastRunResult || {}).passed || [],
    set = failed.concat(passed);

  if (!set.length) {
    vscode.window.showWarningMessage(`No tests were ran.`);

    return new Promise(resolve => resolve());
  } else {
    const res = this.runAsyncTests(
      dedupeStrings(set.map(test => test.file)),
      `^${set.map(test => `(${escapeRegExp(test.fullName)})`).join('|')}$`
    )
  }

  mochaProviderRef.hookResultsFromCommands(res)
};

function dedupeStrings(array) {
  const keys = {};

  array.forEach(key => { keys[key] = 0; });

  return Object.keys(keys);
}

module.exports = Runner;
