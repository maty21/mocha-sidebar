'use strict';

const
  escapeRegExp = require('escape-regexp'),
  MochaShim = require('./mochashim'),
  path = require('path'),
  vscode = require('vscode');

function Runner() {
  this.tests = [];
  this.lastRunResult = null;
}

Runner.prototype.loadTestFiles = function () {
  return MochaShim.findTests(vscode.workspace.rootPath)
    .then(tests => {
      this.tests = tests;

      return tests;
    });
};

Runner.prototype.loadAsyncTestFiles = async function () {
  //  vscode.window.showWarningMessage(`entering loadAsyncTestFiles ${vscode.workspace.rootPath}`)
  return process.platform == 'win32' ? MochaShim.findTestsProcess(vscode.workspace.rootPath) : MochaShim.findTests(vscode.workspace.rootPath);

};


Runner.prototype._runMocha = function (testFiles, grep, logMessages) {
  let tests = testFiles.map(test => test.file);
  return MochaShim.runTests(dedupeStrings(tests), grep, logMessages)
    .then(result => {
      this.lastRunResult = result;

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
      this.lastRunResult = result;

      const numFailed = (result.failed || []).length;

      numFailed && vscode.window.showWarningMessage(`There are ${numFailed} test${numFailed > 1 ? 's' : ''} failed.`);
    },
    err => {
      console.error(err);
      throw err;
    });
};

Runner.prototype.runAll = function (logMessages) {
  return this._runMocha(this.tests.map(test => test.file), null, logMessages);
};

Runner.prototype.runWithGrep = function (grep) {
  return this._runMocha(this.tests.map(test => test.file), grep);
};

Runner.prototype.runTest = function (test) {
  return this._runMocha([test], `^${escapeRegExp(test.fullName)}$`);
};

Runner.prototype.runFailed = function () {
  const failed = (this.lastRunResult || {}).failed || [];

  if (!failed.length) {
    vscode.window.showWarningMessage(`No tests failed in last run.`);

    return new Promise(resolve => resolve());
  } else {
    return this._runMocha(
      dedupeStrings(failed.map(test => test.file)),
      `^${failed.map(test => `(${escapeRegExp(test.fullName)})`).join('|')}$`
    )
  }
};

Runner.prototype.runLastSet = function () {
  const
    failed = (this.lastRunResult || {}).failed || [],
    passed = (this.lastRunResult || {}).passed || [],
    set = failed.concat(passed);

  if (!set.length) {
    vscode.window.showWarningMessage(`No tests were ran.`);

    return new Promise(resolve => resolve());
  } else {
    return this._runMocha(
      dedupeStrings(set.map(test => test.file)),
      `^${set.map(test => `(${escapeRegExp(test.fullName)})`).join('|')}$`
    )
  }
};

function dedupeStrings(array) {
  const keys = {};

  array.forEach(key => { keys[key] = 0; });

  return Object.keys(keys);
}

module.exports = Runner;
