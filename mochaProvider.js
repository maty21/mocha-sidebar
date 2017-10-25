const vscode = require('vscode');
const mochaItem = require('./mochaItem');
const runner = require('./runner');
const path = require('path');
const forIn = require('lodash.forin');
const isObject = require('lodash.isobject');
const assign = require('lodash.assign');
const mochaShim = require('./mochashim');
const escapeRegExp = require('escape-regexp')
const navigateEditorItem = require('./provider-extensions/NavigateEditorItem.js');
const consts = require('./provider-extensions/consts');
const setItemResultStatus = require('./provider-extensions/setItemResultStatus');
const RESULT = {
    FAIL: 'fail',
    PASS: 'pass',
    NOT_EXECUTE: 'notExecute'
}
class mochaProvider {
    constructor() {
        console.log('------------------------------------');
        console.log('constructor');
        console.log('------------------------------------');
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._tests = null;
        this._formatedTest = null;
        this._runner = new runner();
        this._testCounter = 0;
        this._elements = {

        }
        this._iconPath = {
            dark: path.join(__filename, '..', 'images', 'light', 'testNotRun.svg'),
            light: path.join(__filename, '..', 'images', 'light', 'testNotRun.svg')

        };
        this._hierarchyLevel = 0;
    }



    _createTreeFromArray() {
        let obj = {};
        let objCurrentPos = obj;
        this._tests.forEach(test => {
            for (var i = 0; i <= test.suitePath.length; i++) {
                if (i == test.suitePath.length) {
                    objCurrentPos[test.name] = { test };
                    objCurrentPos = obj;
                }
                else {
                    let name = i == 0 ? test.suitePath[i] : this._trimLastDescriber(test, i);
                    if (!objCurrentPos[name]) {
                        objCurrentPos[name] = {}
                    }
                    objCurrentPos = objCurrentPos[name];
                }

            }
        })
        return obj;
    }



    async getChildren(element) {
        console.log('------------------------------------');
        console.log(`get Children: ${this._hierarchyLevel}`);
        console.log('------------------------------------');
        if (!element) {
            let nodes = [];
            await this.loadAndFormatTests();
            this.item = new mochaItem('Tests', vscode.TreeItemCollapsibleState.Expanded, 'rootTests', null, this._formatedTest[""], 0)
            nodes.push(this.item);
            return nodes;

        } else {
            return this._newLevelRunning(element.item)
        }
    }

    async loadAndFormatTests() {
        this._tests = await this._runner.loadAsyncTestFiles();
        this._formatedTest = this._createTreeFromArray();
    }

    async refreshExplorer() {
        if (this.item) {
            await this.loadAndFormatTests();
            this.item.item = this._formatedTest[""];
        }
        this._onDidChangeTreeData.fire(this.item);
    }
    _cleanLevelZero() {
        this._tests.forEach(test => test.suitePath.splice(0, 1))
    }

    _newLevelRunning(element) {
        let nodes = [];
        if (!element) {
            return nodes;
        }
        nodes = Object.entries(element).map(item => {
            if (item[1].test) {
                let iconPath = this._iconPath;
                if (this.results) {
                    let status = setItemResultStatus(this.results, item[1].test.fullName);
                    iconPath = this._setPassOrFailIcon(status);
                }
                return new mochaItem(item[1].test.name, vscode.TreeItemCollapsibleState.None, 'testItem', iconPath, item[1], 0);
            }
            else {
                let name = item[0];
                return new mochaItem(name, vscode.TreeItemCollapsibleState.Expanded, 'testDescriber', null, item[1], 0);
            }
        })
        return nodes;
    }

    _setPassOrFailIcon(status) {
        let icon = null;
        switch (status) {
            case consts.PASSED:
                icon = {
                    dark: path.join(__filename, '..', 'images', 'light', 'testPass.svg'),
                    light: path.join(__filename, '..', 'images', 'light', 'testPass.svg')
                }
                break;
            case consts.FAILED:
                icon = {
                    dark: path.join(__filename, '..', 'images', 'light', 'testFail.svg'),
                    light: path.join(__filename, '..', 'images', 'light', 'testFail.svg')
                }
                break;
            default:
                icon = {
                    dark: path.join(__filename, '..', 'images', 'light', 'testNotRun.svg'),
                    light: path.join(__filename, '..', 'images', 'light', 'testNotRun.svg')
                };
        }

        return icon;
    }


    _trimLastDescriber(element, hierarchyLevel) {
        return element.suitePath[hierarchyLevel].replace(element.suitePath[hierarchyLevel - 1], "").trimLeft();
    }
    async runAllTests(element) {
        let tests = []
        this._findObjectByLabel(element, 'test', tests);
        let log = {};
        this.results = await this.runMochaTests(tests, null, null)
        this._onDidChangeTreeData.fire(this.item);
        console.log('tests');
    }


    async runDescriberLevelTest(element) {

        let tests = [];
        let results = [];
        mochaShim.outputChannel.clear();
        this._findObjectByLabel(element, 'test', tests);
        for (let test of tests) {
            let result = await this.runMochaTests([test], `^${escapeRegExp(test.fullName)}$`)
            results.push(result);
        }
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
        this.results = combinedResults;
        this._onDidChangeTreeData.fire(this.item);
        // tests .forEach(async test => {
        // })
        // let results = await Promise.all(promiseArray);
        // let spread = assign(results);
        //  console.log('res');
    }
    async runTest(element) {
        let tests = []
        this._findObjectByLabel(element, 'test', tests);
        let log = {};


        this.results = await this.runMochaTests(tests, `^${escapeRegExp(tests[0].fullName)}$`)
        // if (this.results.passed.length == 0) {
        //     this.results.failed.push(tests[0])
        // }
        this._onDidChangeTreeData.fire(this.item);
        console.log('tests');
    }

    async itemSelection({ test, line }) {

        // navigateEditorItem(file, name);
        vscode.workspace.openTextDocument(test.file).then(doc => {
            var textRange = new vscode.Range(line[0].number - 1, 0, line[0].number - 1, 0);
            vscode.window.showTextDocument(doc, { selection: textRange });
        })
    }

    async runMochaTests(testFiles, regex) {
        let tests = testFiles.map(test => test.file);
        return this._runner.runAsyncTests(this._dedupeStrings(tests), regex, null)
    }
    async runMochaTest(test, regex) {


        return this._runner.runAsyncTests([test.file], `^${escapeRegExp(test.fullName)}$`, null)
    }
    _findObjectByLabel(obj, label, arr = []) {

        if (!isObject(obj)) {
            return null
        }
        Object.values(obj).forEach(o => {
            if (!o) {
                return
            }
            if (o.hasOwnProperty(label)) {
                arr.push(o[label])
            } else {
                this._findObjectByLabel(o, label, arr);
            }
        })
        // for (var i in obj) {
        //     if (obj.hasOwnProperty(i)) {
        //         var foundLabel = this._findObjectByLabel(obj[i], label);
        //         if (foundLabel) { return foundLabel; }
        //     }
        // }
        // return null;
    };



    _dedupeStrings(array) {
        const keys = {};

        array.forEach(key => { keys[key] = 0; });

        return Object.keys(keys);
    }
    getTreeItem(element) {
        console.log('------------------------------------');
        console.log(`getTreeItem:${element.label} expended:${element.contextValue}`);

        console.log('------------------------------------');

        return element;
    }

}


module.exports = mochaProvider; 