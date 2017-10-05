const vscode = require('vscode');
const matyItem = require('./matyItem');
const runner = require('./runner');
const path = require('path');
const forIn = require('lodash.forin');
const isObject = require('lodash.isobject');
class matyProvider {
    constructor() {
        console.log('------------------------------------');
        console.log('constructor');
        console.log('------------------------------------');
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this._tests = null;
        this._formatedTest = null;
        this._runner = new runner();
        this._testCounter = 0;
        this._iconPath = {
            dark: path.join(__filename, '..', 'images', 'dark', 'testNotRun.svg'),
            light: path.join(__filename, '..', 'images', 'dark', 'testNotRun.svg')

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
            let item = new matyItem('Tests', vscode.TreeItemCollapsibleState.Expanded, 'rootTests', null, this._formatedTest, 0)
            nodes.push(item);
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
        nodes = Object.values(element).map(item => {
            if (item.test) {
                return new matyItem(item.test.name, vscode.TreeItemCollapsibleState.None, 'testItem', this._iconPath, item.test, 0);
            }
            else {
                let name = Object.keys(item)[0];
                return new matyItem(name, vscode.TreeItemCollapsibleState.Expanded, 'testDescriber', null, item, 0);
            }
        })
        return nodes;
    }

    // _treeItem(element, hierarchyLevel) {
    //     if (element.suitePath.length < hierarchyLevel) {
    //         return null;
    //     }
    //     if (element.suitePath.length == hierarchyLevel) {
    //         this._testCounter++;
    //         return new matyItem(element.name, vscode.TreeItemCollapsibleState.None, 'testItem', this._iconPath, element, hierarchyLevel + 1);
    //     }
    //     else {
    //         let name = this._trimLastDescriber(element, hierarchyLevel);
    //         let level = hierarchyLevel + 1;
    //         return new matyItem(name, vscode.TreeItemCollapsibleState.Expanded, 'testDescriber', null, element, level);
    //     }
    // }

    _trimLastDescriber(element, hierarchyLevel) {
        return element.suitePath[hierarchyLevel].replace(element.suitePath[hierarchyLevel - 1], "").trimLeft();
    }
    runAllTests(element) {
        let res= []
         this._findObjectByLabel(element, 'test',res);
        console.log('tests');
    }


    _findObjectByLabel(obj, label, arr = []) {
        if (!isObject(obj)) {
            return null
        }
        Object.values(obj).forEach(o => {
            if (o.hasOwnProperty(label)) {
                arr.push(o[label])
            } else {
                this._findObjectByLabel(o, label, arr);
            }
        })
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                var foundLabel = this._findObjectByLabel(obj[i], label);
                if (foundLabel) { return foundLabel; }
            }
        }
        return null;
    };
    getTreeItem(element) {
        console.log('------------------------------------');
        console.log(`getTreeItem:${element.label} expended:${element.contextValue}`);

        console.log('------------------------------------');

        return element;
    }

}


module.exports = matyProvider;