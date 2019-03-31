const runner = require("./runner");
const navigateEditorItem = require("./provider-extensions/NavigateEditorItem.js");
const asynclib = require("async");
const { promisify } = require("util");
const config = require("../lib/config");
const mapLimit = promisify(asynclib.mapLimit);
const isObject = require("lodash.isobject");
const consts = require("./provider-extensions/consts");
const escapeRegExp = require("escape-regexp");

const path = require("path");


class Core {
  constructor() {
    this._runner = new runner();
    this._tests = null;
    this._formatedTest = null;
    this.enrichedTests = null;
    this.events = [];
  }
  async init() {
    this.run();
  }

  registerForUpdates(callback) {
    this.events.push(callback);
  }
  async run() {
    this._tests = await this._runner.loadAsyncTestFiles();
    //  this._formatedTest = this._createTreeFromArray();
    this.enrichedTests = this._enrichedMoreDataForTests();
  }

  _enrichedMoreDataForTests() {
    return this._tests.map(t => {
      let meta = navigateEditorItem(t.file, t.name);
      meta.rawData = t;
      t.meta = meta;
      return { ...t };
    });
  }

  async execute(element) {
    //   clearData();
    //let tests = [];
    let flattenTest = [];
    let results = [];
    // mochaShim.outputChannel.clear();
    let tests = this._findTestsToRun(this._formatedTest, element);
    // this._flattenTests(tests[0]);
    const status = await mapLimit(tests, config.parallelTests(), async test => {
      test.iconPath = this._setResultIcon(consts.RUNNING);
      //   this._onDidChangeTreeData.fire(test.mItem);
      const result = await this.runTests(
        [test],
        `^${escapeRegExp(test.fullName)}$`
      );
      results.push(result);
      let status = consts.NOT_RUN;
      if (result.passed.length) {
        status = consts.PASSED;
      } else if (result.failed.length) {
        status = consts.FAILED;
      }
      test.iconPath = this._setResultIcon(status);
      //    this._onDidChangeTreeData.fire(test.mItem);
      return status;
    });

    this.results = this._combinedResults(results);
    this.results.ranTests = tests;
    //this._onDidChangeTreeData.fire(this.item);
  }

  async runTests(testFiles, regex) {
    let tests = testFiles.map(test => test.file);
    return this._runner.runAsyncTests(this._dedupeStrings(tests), regex, null);
  }

  _findTestsToRun(obj, label) {
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

  // _flattenTests(test, flattenTests = []) {
  //   if (!isObject(test)) {
  //     return flattenTests;
  //   }
  //   if (Object.keys(test).length === 1) {
  //     flattenTests.push(test);
  //     return flattenTests;
  //   }
  //   if (Object.values(test).length > 1) {
  //     Object.values(test).forEach(t => this._flattenTests(t));
  //   }
  // }
  // _createTreeFromArray() {
  //   let obj = {};
  //   let objCurrentPos = obj;
  //   this._tests.forEach(__test => {
  //     for (var i = 0; i <= __test.suitePath.length; i++) {
  //       __test.fullName = __test.fullName.trimLeft();
  //       if (i == __test.suitePath.length) {
  //         let meta = navigateEditorItem(__test.file, __test.name);
  //         meta.rawData = __test;
  //         meta.type = "__test__";
  //         objCurrentPos[__test.name] = { meta };
  //         objCurrentPos = obj;
  //       } else {
  //         let name =
  //           i == 0 ? __test.suitePath[i] : this._trimLastDescriber(__test, i);
  //         if (!objCurrentPos.hasOwnProperty(name)) {
  //           let meta = null;
  //           if (name != "") {
  //             meta = navigateEditorItem(__test.file, name);
  //             meta.rawData = __test;
  //           }
  //           objCurrentPos[name] = { meta };
  //         }
  //         objCurrentPos = objCurrentPos[name];
  //       }
  //     }
  //   });
  //   return obj;
  // }

  // _trimLastDescriber(element, hierarchyLevel) {
  //   return element.suitePath[hierarchyLevel]
  //     .replace(element.suitePath[hierarchyLevel - 1], "")
  //     .trimLeft();
  // }

  // _findTests(obj, label, arr = []) {
  //   if (!isObject(obj)) {
  //     return null;
  //   }
  //   Object.values(obj).forEach(o => {
  //     if (!o) {
  //       return;
  //     }
  //     if (!o.meta || !o.meta.type === "__test__") {
  //       this._findTests(o, label, arr);
  //     }
  //     if (o.hasOwnProperty(label)) {
  //       arr.push(o[label]);
  //       return;
  //     } else {
  //       this._findTests(o, label, arr);
  //     }
  //   });
  // }

  _setResultIcon(status) {
    let icon = null;
    switch (status) {
      case consts.PASSED:
        icon = {
          dark: path.join(
            __filename,
            "..",
            "..",
            "images",
            "dark",
            "testPass.svg"
          ),
          light: path.join(
            __filename,
            "..",
            "..",
            "images",
            "light",
            "testPass.svg"
          )
        };
        break;
      case consts.FAILED:
        icon = {
          dark: path.join(
            __filename,
            "..",
            "..",
            "images",
            "dark",
            "testFail.svg"
          ),
          light: path.join(
            __filename,
            "..",
            "..",
            "images",
            "light",
            "testFail.svg"
          )
        };
        break;
      case consts.RUNNING:
        icon = {
          dark: path.join(
            __filename,
            "..",
            "..",
            "images",
            "dark",
            "refresh.svg"
          ),
          light: path.join(
            __filename,
            "..",
            "..",
            "images",
            "light",
            "refresh.svg"
          )
        };
        break;
      default:
        icon = {
          dark: path.join(
            __filename,
            "..",
            "..",
            "images",
            "dark",
            "testNotRun.svg"
          ),
          light: path.join(
            __filename,
            "..",
            "..",
            "images",
            "light",
            "testNotRun.svg"
          )
        };
    }
    return icon;
  }
}

module.exports = new Core();
