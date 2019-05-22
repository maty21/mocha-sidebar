/* eslint-disable no-console */
const EventEmitter = require("events");
const { promisify } = require("util");
const runner = require("./runner");
const navigateEditorItem = require("./provider-extensions/NavigateEditorItem.js");
const asynclib = require("async");
const config = require("../lib/config");
const mapLimit = promisify(asynclib.mapLimit);
const difference = require("lodash.difference");
const consts = require("./provider-extensions/consts");
const escapeRegExp = require("escape-regexp");
const debuggerProvider = require("./provider-extensions/runDebug");
const messages = require("./output/messages");
class Core extends EventEmitter {
  constructor() {
    super();
    this._runner = new runner();
    this._tests = null;
    this._formatedTest = null;
    this.enrichedTests = null;
    this.lastRun = {
      input: { element: null, type: null },
      output: { results: null, ranTests: null, notRunTests: null }
    };
    this.events = {
      TESTS: "TESTS",
      DESCRIBERS: "DESCRIBERS",
      INIT_RESULTS: "INIT_RESULTS",
      UPDATE_RESULT: "UPDATE_RESULTS",
      FINISH_RESULTS: "FINISH_RESULTS",
      FINISH_RESULTS_AGGREGATED: "FINISH_RESULTS_AGGREGATED"
    };
    this.runTypes = {
      ALL: "ALL",
      SUITE: "SUITE",
      TEST: "TEST"
    };
    this.debugMap = {
      [this.runTypes.TEST]: debuggerProvider.debugItem.bind(debuggerProvider),
      [this.runTypes.SUITE]: debuggerProvider.debugSuite.bind(debuggerProvider),
      [this.runTypes.ALL]: debuggerProvider.debugAll.bind(debuggerProvider)
    };
  }
  // async init() {
  //   this.run();
  // }

  async getTests() {
    if (!this.enrichedTests) {
      await this.run();
      return this.enrichedTests;
    } else {
      return this.enrichedTests;
    }
  }
  async runTests(testFiles, regex) {
    let tests = testFiles.map(test => test.file);
    const results = await this._runner.runAsyncTests(this._dedupeStrings(tests), regex, null);
    this._mergeResultsWithMeta(testFiles, results.passed);
    this._mergeResultsWithMeta(testFiles, results.failed);
    return results;
  }

  registerForUpdates(callback) {
    this.events.push(callback);
  }
  async run() {
    try {
      this._tests = await this._runner.loadAsyncTestFiles();
      this.testEnrichment();
      //  this._formatedTest = this._createTreeFromArray();
    } catch (error) {
      messages.send(messages.channelName.TEST, `cant get tests ${error} `, messages.messageType.WARNING);
      messages.sendPopUpMessage(`cant get tests ${error} `, messages.messageType.WARNING);
      console.error(`cant get tests ${error} `);
    }
  }
  testEnrichment(tests = this._tests, text = null) {
    // if lens updated without saving we sould modify the line for a specific test
    if (text) {
      const modifiedTests = this._enrichedMoreDataForTests(tests, text);
      this.enrichedTests = this._mergeArraysByName(this.enrichedTests, modifiedTests);
      const modifiedDescribers = this._enrichedMoreDataForDescribers(tests, text);
      this.enrichedDescribers = this._mergeArraysByName(this.enrichedDescribers, modifiedDescribers);
    } else {
      this.enrichedTests = this._enrichedMoreDataForTests(tests);
      this.enrichedDescribers = this._enrichedMoreDataForDescribers(tests);
    }

    this.emit(this.events.TESTS, this.enrichedTests);
    this.emit(this.events.DESCRIBERS, this.enrichedDescribers);
  }
  async debug(name, item, runType) {
    await this.debugMap[runType](name);
    if (config.sideBarOptions().showDebugTestStatus) {
      this.execute(item, runType);
    }
  }
  async execute(element = null, type) {
    let results = [];
    // mochaShim.outputChannel.clear();
    const tests = this._getTests(element, type);
    this.emit(this.events.INIT_RESULTS, tests);
    await mapLimit(tests, config.parallelTests(), async test => {
      this._sendResultStatus(test, consts.RUNNING, null);
      const result = await this.runTests([test], `^${escapeRegExp(test.fullName)}$`);
      results.push(result);
      if (result) {
        let status = this._getResultStatus(result);
        if (status === consts.FAILED) {
          this._mergeErrorDetailesToTest(test, result);
        }
        this._sendResultStatus(test, status, result);
        return status;
      } else {
        return null;
      }
    });
    // let combinedResults = this._combinedResults(results);
    // combinedResults.ranTests = tests;
    const notRunTests = this._notRunTests(tests);
    const aggregatedResults = { results: this._combinedResults(results), ranTests: tests, notRunTests };
    this.lastRun = {
      input: { element, type },
      output: aggregatedResults
    };
    this.emit(this.events.FINISH_RESULTS, { results, ranTests: tests, notRunTests });
    this.emit(this.events.FINISH_RESULTS_AGGREGATED, aggregatedResults);
    //this._onDidChangeTreeData.fire(this.item);
  }
  runLastSuite() {
    const { element, type } = this.lastRun.input;
    this.execute(element, type);
  }

  runLastFailed() {
    this.lastRun.output.results.failed.forEach(test => this.execute(test, this.runTypes.TEST));
  }
  runTestAtCursor(fileName, line) {
    const testItem = this.enrichedTests.find(test => test.file === fileName && line === test.meta.number);
    if (!testItem) {
      const describerItem = this.enrichedDescribers.find(test => test.file === fileName && line === test.meta.number);
      if (!describerItem) {
        throw `cant find test matched courser`;
      } else {
        this.execute(describerItem, this.runTypes.SUITE);
      }
    } else {
      this.execute(testItem, this.runTypes.TEST);
    }
  }
  _enrichedMoreDataForTests(tests, text) {
    return tests.map(t => {
      let meta = navigateEditorItem(t.file, t.name, text)[0];
      t.rawData = t;
      t.meta = meta;
      return { ...t };
    });
  }
  updateLines(file, text) {
    const tests = this._tests.filter(test => test.file === file);
    this.testEnrichment(tests, text);
  }
  _trimPrevNameForLineNumber(current, prev) {
    return current.replace(prev, "").trim();
  }
  _enrichedMoreDataForDescribers(tests, text) {
    const describerObject = [];
    tests.forEach(test =>
      test.suitePath.forEach((p, i, arr) => {
        if (!(p === "")) {
          if (!describerObject.find(des => des.file === test.file && des.name === p)) {
            describerObject.push({
              file: test.file,
              name: p,
              meta: navigateEditorItem(test.file, this._trimPrevNameForLineNumber(p, arr[i - 1]), text)[0]
            });
          }
        }
      })
    );
    return describerObject;
  }

  _getTests(element, type) {
    let tests = null;
    const { ALL, SUITE, TEST } = this.runTypes;
    switch (type) {
      case ALL:
        tests = this.enrichedTests;
        break;
      case SUITE:
        tests = this._findSuiteTestsToRun(element.name);
        break;
      case TEST:
        tests = this._findTestToRun(element.fullName);
        break;

      default:
        break;
    }
    return tests;
  }
  _getResultStatus(result) {
    let status = consts.NOT_RUN;
    if (result.passed.length) {
      status = consts.PASSED;
    } else if (result.failed.length) {
      status = consts.FAILED;
    }
    return status;
  }
  _mergeErrorDetailesToTest(test, result) {
    if (result && result.failed.length === 1) {
      test.error = result.failed[0].error;
    }
  }
  _mergeArraysByName(full, partial) {
    return full.map(t => {
      const temptest = partial.find(mt => mt.name === t.name);
      if (temptest) {
        return temptest;
      }
      return t;
    });
  }
  _sendResultStatus(item, status, result) {
    this.emit(this.events.UPDATE_RESULT, { item, status, result });
  }

  _notRunTests(ranTests) {
    return difference(this.enrichedTests, ranTests);
  }
  _findTestToRun(fullName) {
    return this.enrichedTests.filter(test => test.fullName === fullName);
  }
  _findSuiteTestsToRun(label) {
    return this.enrichedTests.filter(test => {
      if (test.suitePath.find(l => l === label)) {
        return test;
      }
    });
  }
  _mergeResultsWithMeta(tests, result) {
    result.forEach(r => {
      const test = tests.find(t => t.fullName === r.fullName);
      if (test) {
        r.meta = test.meta;
      } else {
        console.warn(`result with name ${r.fullName} did not found on tests`);
      }
    });
    return result;
  }
  _dedupeStrings(array) {
    const keys = {};

    array.forEach(key => {
      keys[key] = 0;
    });

    return Object.keys(keys);
  }

  _combinedResults(results) {
    let combinedResults = {
      passed: [],
      failed: []
    };
    results.forEach(res => {
      if (res.passed.length > 0) {
        res.passed.forEach(r => combinedResults.passed.push(r));
      }
      if (res.failed.length > 0) {
        res.failed.forEach(r => combinedResults.failed.push(r));
      }
    });
    return combinedResults;
  }
}

module.exports = new Core();
