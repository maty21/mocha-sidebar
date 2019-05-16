"use strict";

const escapeRegExp = require("escape-regexp");
const MochaShim = require("./mochashim");
const vscode = require("vscode");

let mochaProviderRef = null;

class Runner {
  constructor() {
    this.lastRunResult = null;
  }
  //TODO: delete this
  async loadTestFiles() {
    return await MochaShim.findTests(vscode.workspace.rootPath);
  }

  async loadAsyncTestFiles() {
    return await MochaShim.findTests(vscode.workspace.rootPath);
  }

  async runAsyncTests(testFiles, grep, logMessages) {
    const res = await MochaShim.runTests(testFiles, grep, logMessages);
    this.lastRunResult = res;
    return res;
  }

  _runMocha(testFiles, grep, logMessages) {
    let tests = testFiles.map(test => test.file);
    return MochaShim.runAsyncTests(this._dedupeStrings(tests), grep, logMessages).then(
      result => {
        this.lastRunResult = result;
        const numFailed = (result.failed || []).length;
        numFailed && vscode.window.showWarningMessage(`There are ${numFailed} test${numFailed > 1 ? "s" : ""} failed.`);
      },
      err => {
        console.error(err);
        throw err;
      }
    );
  }
  _runMochaSingleTest(testFiles, grep, logMessages) {
    return MochaShim.runTests(this._dedupeStrings(testFiles), grep, logMessages).then(
      result => {
        this.lastRunResult = result;
        const numFailed = (result.failed || []).length;
        numFailed && vscode.window.showWarningMessage(`There are ${numFailed} test${numFailed > 1 ? "s" : ""} failed.`);
      },
      err => {
        console.error(err);
        throw err;
      }
    );
  }
  //TODO: delete this
  runAll(logMessages) {
    return this.runAsyncTests(tests.map(test => test.file), null, logMessages);
  }

  async runWithGrep(grep) {
    const res = await this.runAsyncTests(tests.map(test => test.file), grep);
    mochaProviderRef.hookResultsFromCommands(res);
  }

  runTest(test) {
    return this.runAsyncTests([test], `^${escapeRegExp(test.fullName)}$`);
  }

  async runFailed() {
    const failed = (this.lastRunResult || {}).failed || [];
    if (!failed.length) {
      vscode.window.showWarningMessage(`No tests failed in last run.`);
      return new Promise(resolve => resolve());
    } else {
      const res = await this.runAsyncTests(this._dedupeStrings(failed.map(test => test.file)), `^${failed.map(test => `(${escapeRegExp(test.fullName)})`).join("|")}$`);
      mochaProviderRef.hookResultsFromCommands(res);
    }
  }

  async runLastSet() {
    const failed = (this.lastRunResult || {}).failed || [],
      passed = (this.lastRunResult || {}).passed || [],
      set = failed.concat(passed);
    if (!set.length) {
      vscode.window.showWarningMessage(`No tests were ran.`);
      return new Promise(resolve => resolve());
    } else {
      const res = this.runAsyncTests(this._dedupeStrings(set.map(test => test.file)), `^${set.map(test => `(${escapeRegExp(test.fullName)})`).join("|")}$`);
    }

    mochaProviderRef.hookResultsFromCommands(res);
  }

  _dedupeStrings(array) {
    const keys = {};
    array.forEach(key => {
      keys[key] = 0;
    });

    return Object.keys(keys);
  }
}

//setMochaProvider = (mochaProvider) => mochaProviderRef = mochaProvider;

module.exports = Runner;
