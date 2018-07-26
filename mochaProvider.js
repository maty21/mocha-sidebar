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
const { updateDecorationStyle, setDecorationOnUpdateResults, clearData, setCurrentWorkspaceFile } = require('./provider-extensions/setDecortaion');
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
        this.currentResultWithItem = [];
        this.collapseState = vscode.TreeItemCollapsibleState.Expanded;
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
        this._tests.forEach(__test => {
            for (var i = 0; i <= __test.suitePath.length; i++) {
                __test.fullName = __test.fullName.trimLeft();
                if (i == __test.suitePath.length) {
                    let meta = navigateEditorItem(__test.file, __test.name);
                    objCurrentPos[__test.name] = { __test, meta };
                    objCurrentPos = obj;
                }
                else {
                    let name = i == 0 ? __test.suitePath[i] : this._trimLastDescriber(__test, i);
                    if (!objCurrentPos.hasOwnProperty(name)) {
                        let meta = null;
                        if (name != "") {
                            meta = navigateEditorItem(__test.file, name);
                        }
                        objCurrentPos[name] = { meta }
                    }
                    objCurrentPos = objCurrentPos[name];
                }

            }
        })
        return obj;
    }



    async getChildren(element) {
        console.log(`get Children: ${this._hierarchyLevel}`);
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
    async collapseTree() {
        this.collapseState = vscode.TreeItemCollapsibleState.Collapsed;
        await this._refreshData()
    }
    async _refreshData() {

        if (this.item) {
            await this.loadAndFormatTests();
            this.item.item = this._formatedTest[""];
        }
        this._onDidChangeTreeData.fire(this.item);
    }

    async refreshExplorer() {
        this.collapseState = vscode.TreeItemCollapsibleState.Expanded;
        await this._refreshData()
    }
    _cleanLevelZero() {
        this._tests.forEach(test => test.suitePath.splice(0, 1))
    }

    _newLevelRunning(element) {
        let nodes = [];
        if (!element) {
            return nodes;
        }
        Object.entries(element).forEach(item => {
            if (item[0] == "meta") {
                return
            }
            if (item[1].__test) {
                let iconPath = this._iconPath;
                let status = null;
                if (this.results) {
                    status = setItemResultStatus(this.results, item[1].__test.fullName, item[1].__test.suitePath);
                    iconPath = this._setPassOrFailIcon(status.status);
                } else {
                    status = consts.NOT_RUN;
                }
                console.log(`name:${item[1].__test.name},file:${item[1].__test.file}`);
                let mItem = new mochaItem(item[1].__test.name, vscode.TreeItemCollapsibleState.None, 'testItem', iconPath, item[1], 0);
                setDecorationOnUpdateResults(status, mItem);
                this.currentResultWithItem.push({ status, test: item[1].__test, type: "test" })
                return nodes.push(mItem);
            }
            else {
                let name = item[0];
                let i = new mochaItem(name,this.collapseState, 'testDescriber', null, item[1], 0);
                return nodes.push(i);
            }
        })
        return nodes;
    }


    updateDecorations(fileName) {
        clearData();
        setCurrentWorkspaceFile(fileName);
        updateDecorationStyle();
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
        clearData();
        let tests = []
        this._findObjectByLabel(element, '__test', tests);
        let log = {};
        this.results = await this.runMochaTests(tests, null, null)
        this.results.ranTests = tests;
        this._onDidChangeTreeData.fire(this.item);
        console.log('tests');
    }


    async runDescriberLevelTest(element) {
        clearData();
        let tests = [];
        let results = [];
        mochaShim.outputChannel.clear();
        this._findObjectByLabel(element, '__test', tests);
        for (let test of tests) {
            let result = await this.runMochaTests([test], `^${escapeRegExp(test.fullName)}$`)
            results.push(result);
        }
        // let combinedResults = {
        //     passed: [],
        //     failed: []
        // }
        // results.forEach(res => {
        //     if (res.passed.length > 0) {
        //         res.passed.forEach(r => combinedResults.passed.push(r))
        //     }
        //     if (res.failed.length > 0) {
        //         res.failed.forEach(r => combinedResults.failed.push(r))
        //     }
        // })
        this.results = this._combinedResults(results);
        this.results.ranTests = tests;

        this._onDidChangeTreeData.fire(this.item);
        // tests .forEach(async test => {
        // })
        // let results = await Promise.all(promiseArray);
        // let spread = assign(results);
        //  console.log('res');
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

    _combinedResultsWithCurrentResults(newResults, resultsToCombine) {


        if (newResults.passed.length > 0) {
            newResults.passed.forEach(r => resultsToCombine.passed.push(r))
        }
        if (newResults.failed.length > 0) {
            newResults.failed.forEach(r => resultsToCombine.failed.push(r))
        }
        if (newResults.ranTests && newResults.ranTests.length > 0) {
            if (!resultsToCombine.ranTests) {
                resultsToCombine.ranTests = [];
            }
            newResults.ranTests.forEach(r => resultsToCombine.ranTests.push(r))
        }
        return resultsToCombine;
    }


    async runTest(element) {
        clearData();
        let tests = []
        this._findObjectByLabel(element, '__test', tests);
        let log = {};


        this.results = await this.runMochaTests(tests, `${escapeRegExp(tests[0].fullName)}`)
        this.results.ranTests = tests;
        // if (this.results.passed.length == 0) {
        //     this.results.failed.push(tests[0])
        // }
        this._onDidChangeTreeData.fire(this.item);
        console.log('tests');
    }
    async runTestWithoutElement(test) {
        clearData();
        let result = await this.runMochaTests([test], `^${escapeRegExp(test.fullName)}$`)
        result.ranTests = [test];
        this.results = this._combinedResultsWithCurrentResults(result, this.results);
        this._onDidChangeTreeData.fire(this.item);
    }

    clearResults() {
        this.results = {
            passed: [],
            failed: []
        }
    }
    async itemSelection({ __test, line }) {

        // navigateEditorItem(file, name);
        vscode.workspace.openTextDocument(__test.file).then(doc => {
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

    };



    _dedupeStrings(array) {
        const keys = {};

        array.forEach(key => { keys[key] = 0; });

        return Object.keys(keys);
    }
    getTreeItem(element) {
        console.log(`getTreeItem:${element.label} expended:${element.contextValue}`);
        return element;
    }

}


module.exports = mochaProvider; 