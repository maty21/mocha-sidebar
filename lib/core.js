const EventEmitter = require('events')
const { promisify } = require("util");
const runner = require("./runner");
const navigateEditorItem = require("./provider-extensions/NavigateEditorItem.js");
const asynclib = require("async");
const config = require("../lib/config");
const mapLimit = promisify(asynclib.mapLimit);
const isObject = require("lodash.isobject");
const consts = require("./provider-extensions/consts");
const escapeRegExp = require("escape-regexp");

const path = require("path");

class Core extends EventEmitter {
  constructor() {
    super();
    this._runner = new runner();
    this._tests = null;
    this._formatedTest = null;
    this.enrichedTests = null;
    this.events = {
      TESTS: 'TESTS',
      DESCRIBERS:'DESCRIBERS',
      INIT_RESULTS: 'INIT_RESULTS',
      UPDATE_RESULT: 'UPDATE_RESULTS',
      FINISH_RESULTS: 'FINISH_RESULTS'
    };
    this.runTypes = {
      ALL: 'ALL',
      SUITE: 'SUITE',
      TEST: 'TEST',
    };

  }
  // async init() {
  //   this.run();
  // }

  async getTests() {
    if (!this.enrichedTests) {
      await this.run();
      return this.enrichedTests;
    }
    else {
      return this.enrichedTests;

    }

  }

  registerForUpdates(callback) {
    this.events.push(callback);
  }
  async run() {
    try {
      this._tests = await this._runner.loadAsyncTestFiles();
      //  this._formatedTest = this._createTreeFromArray();

      this.enrichedTests = this._enrichedMoreDataForTests();
      this.enrichedDescribers = this._enrichedMoreDataForDescribers();
      this.emit(this.events.TESTS, this.enrichedTests);
      this.emit(this.events.DESCRIBERS, this.enrichedDescribers);
    } catch (error) {
      console.log(`cant get tests ${error} `);
    }
  }

  _enrichedMoreDataForTests() {
    return this._tests.map(t => {
      let meta = navigateEditorItem(t.file, t.name);
      t.rawData = t;
      t.meta = meta;
      return { ...t };
    });
  }

  _enrichedMoreDataForDescribers(){
   const describerObject=[];
    this._tests.forEach(test=>test.suitePath.forEach(p=>{
      if(!(p==="")){
        if(!describerObject.find(des=>des.file===test.file&&des.name===p)){
          describerObject.push({ file:test.file,name:p,meta:navigateEditorItem(test.file, p)})
        }
      }
      // if(!describerObject[test.file]){
      //   describerObject[test.file]=[];
      //   describerObject[test.file][p]= test;
      // }
    }))
    return describerObject;
    
  }

  async execute(element = null, type) {
    let results = [];
    // mochaShim.outputChannel.clear();
    const tests = this._getTests(element, type);
    this.emit(this.events.INIT_RESULTS, null);
    await mapLimit(tests, config.parallelTests(), async test => {
      this._sendResultStatus(test, consts.RUNNING, null);
      const result = await this.runTests([test], `^${escapeRegExp(test.fullName)}$`);
      results.push(result);
      if (result) {
        let status = this._getResultStatus(result);
        this._sendResultStatus(test, status, result);
        return status;
      }
      else {
        return null;
      }
    });
    // let combinedResults = this._combinedResults(results);
    // combinedResults.ranTests = tests;
    this.emit(this.events.FINISH_RESULTS, { results, ranTests: tests });
    //this._onDidChangeTreeData.fire(this.item);
  }
  _getTests(element, type) {
    let tests = null;
    const { ALL, SUITE, TEST } = this.runTypes;
    switch (type) {
      case ALL:
        tests = this.enrichedTests
        break;
      case SUITE:
        tests = this._findSuiteTestsToRun(element.label)
        break;
      case TEST:
        tests =  this._findTestToRun(element.fullName)
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
  _sendResultStatus(item, status, result) {
    this.emit(this.events.UPDATE_RESULT, { item, status, result })
  }

  async runTests(testFiles, regex) {
    let tests = testFiles.map(test => test.file);
    return this._runner.runAsyncTests(this._dedupeStrings(tests), regex, null);
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
    }
    results.forEach(res => {
      if (res.passed.length > 0) {
        res.passed.forEach(r => combinedResults.passed.push(r))
      }
      if (res.failed.length > 0) {
        res.failed.forEach(r => combinedResults.failed.push(r))
      }
    })
    return combinedResults;
  }


  _setResultIcon(status) {
    let icon = null;
    switch (status) {
      case consts.PASSED:
        icon = {
          dark: path.join(__filename, "..", "..", "images", "dark", "testPass.svg"),
          light: path.join(__filename, "..", "..", "images", "light", "testPass.svg")
        };
        break;
      case consts.FAILED:
        icon = {
          dark: path.join(__filename, "..", "..", "images", "dark", "testFail.svg"),
          light: path.join(__filename, "..", "..", "images", "light", "testFail.svg")
        };
        break;
      case consts.RUNNING:
        icon = {
          dark: path.join(__filename, "..", "..", "images", "dark", "refresh.svg"),
          light: path.join(__filename, "..", "..", "images", "light", "refresh.svg")
        };
        break;
      default:
        icon = {
          dark: path.join(__filename, "..", "..", "images", "dark", "testNotRun.svg"),
          light: path.join(__filename, "..", "..", "images", "light", "testNotRun.svg")
        };
    }
    return icon;
  }
}

module.exports = new Core();
