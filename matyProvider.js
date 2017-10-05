const vscode = require('vscode');
const matyItem = require('./matyItem');
const runner = require('./runner');
const path = require('path');
const forIn = require('lodash.forin');
const isObject = require('lodash.isobject');
const mochaShim = require('./mochashim');
const escapeRegExp = require('escape-regexp')
const RESULT = {
    FAIL: 'fail',
    PASS: 'pass',
    NOT_EXECUTE: 'notExecute'
}
class matyProvider {
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
            this._tests = await this._runner.loadTestFiles();
            this._cleanLevelZero();
            this._formatedTest = this._createTreeFromArray();
            this.item = new matyItem('Tests', vscode.TreeItemCollapsibleState.Expanded, 'rootTests', null, this._formatedTest, 0)
            nodes.push(this.item);
            return nodes;

        } else {
            return this._newLevelRunning(element.item)
        }
    }
    _cleanLevelZero() {
        this._tests.forEach(test => test.suitePath.splice(0, 1))
    }
    // _levelRunning() {
    //     let nodes = []
    //     this._tests.forEach(test => {
    //         let item = this._treeItem(test, this._hierarchyLevel);
    //         if (item) {
    //             nodes.push(item);
    //         }
    //     })
    //     this._hierarchyLevel = this._hierarchyLevel + 1;
    //     return nodes;
    // }

    _newLevelRunning(element) {
        let nodes = [];
        nodes = Object.entries(element).map(item => {
            if (item[1].test) {
                let iconPath = this._iconPath;
                if (this.results) {
                    iconPath = this._setPassOrFailIcon(item[1].test.name);
                }
                return new matyItem(item[1].test.name, vscode.TreeItemCollapsibleState.None, 'testItem', iconPath, item[1], 0);
            }
            else {
                let name = item[0];
                return new matyItem(name, vscode.TreeItemCollapsibleState.Expanded, 'testDescriber', null, item[1], 0);
            }
        })
        return nodes;
    }

    _setPassOrFailIcon(itemName) {
        let icon = {
            dark: path.join(__filename, '..', 'images', 'light', 'testNotRun.svg'),
            light: path.join(__filename, '..', 'images', 'light', 'testNotRun.svg')
        };
        if (this.results.passed.find(res => res.name == itemName)) {
            icon = {
                dark: path.join(__filename, '..', 'images', 'light', 'testPass.svg'),
                light: path.join(__filename, '..', 'images', 'light', 'testPass.svg')
            }
        }
        if (this.results.failed.find(res => res.name == itemName)) {
            icon = {
                dark: path.join(__filename, '..', 'images', 'light', 'testFail.svg'),
                light: path.join(__filename, '..', 'images', 'light', 'testFail.svg')
            }
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

    async runTest(element) {
        let tests = []
        this._findObjectByLabel(element, 'test', tests);
        let log = {};
        this.results = await this.runMochaTests(tests, `^${escapeRegExp(tests[0].fullName)}$`)
        if (this.results.passed.length == 0) {
            this.results.failed.push(tests[0])
        }
        this._onDidChangeTreeData.fire(this.item);
        console.log('tests');
    }
    async runMochaTests(testFiles, regex) {
        let tests = testFiles.map(test => test.file);
        return mochaShim.runTests(this._dedupeStrings(tests), regex, null)
    }
    async runMochaTest(test, regex) {
        return mochaShim.runTests([test.file], `^${escapeRegExp(test.fullName)}$`, null)
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


module.exports = matyProvider; 