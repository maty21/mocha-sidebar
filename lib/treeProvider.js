const vscode = require('vscode');
var clone = require('clone');
const mochaItem = require('./mochaItem');
const runner = require('./runner');
const path = require('path');
const forIn = require('lodash.forin');
const isObject = require('lodash.isobject');
const assign = require('lodash.assign');
var remove = require('lodash.remove');
const mochaShim = require('./mochashim');
const escapeRegExp = require('escape-regexp')
const navigateEditorItem = require('./provider-extensions/NavigateEditorItem.js');
const consts = require('./provider-extensions/consts');
const { promisify } = require('util')
const {setItemResultStatus,getRelevantStatusFromResults} = require('./provider-extensions/setItemResultStatus');
const core = require('./core');
const {
    updateDecorationStyle,
    setDecorationOnUpdateResults,
    clearData,
    setCurrentWorkspaceFile
} = require('./provider-extensions/setDecortaion');
const asynclib = require('async');
const mapLimit = promisify(asynclib.mapLimit);
const config = require('./config');

const RESULT = {
    FAIL: 'fail',
    PASS: 'pass',
    NOT_EXECUTE: 'notExecute'
}
class treeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._formatedTest = null;
        this._testCounter = 0;
        this.incomingResultsStatus = {results:[],ranTests:null};
        this.currentResultWithItem = [];
        this.rootElement = null;
        this._iconPath = {
            dark: path.join(__filename, '..', '..', 'images', 'light', 'testNotRun.svg'),
            light: path.join(__filename, '..', '..', 'images', 'light', 'testNotRun.svg')

        };
        this._hierarchyLevel = 0;
        core.on(core.events.TESTS, (data) => {
            this.incomingResultsStatus = {results:[],ranTests:null}
            this._tests = clone(data);
            this._formatedTest = this._createTreeFromArray();
            this._onDidChangeTreeData.fire();
        })
        core.on(core.events.INIT_RESULTS, () => this.incomingResultsStatus = {results:[],ranTests:null});
        core.on(core.events.UPDATE_RESULT, (result) => {
         try {
            if(!result){
                console.log(`not result `);
            }
           const item =  remove(this.incomingResultsStatus.results,test=>test.item.fullName===result.item.fullName);
           
            this.incomingResultsStatus.results.push(result);
            const element = []
            this._findElementByTest(this.rootElement.item, result.item.fullName, element);
            if(element){
                this._onDidChangeTreeData.fire();
            }
            else{
                console.warn(`failed to find test with path ${result.item.fullName}`);
                
            }
         } catch (error) {
            console.log(`not result ${error}`);
         }
           
        })
        core.on(core.events.FINISH_RESULTS, ({results,ranTests}) => {
         //   this.incomingResultsStatus.results = results;
            this.incomingResultsStatus.ranTests = ranTests;
          //  this._onDidChangeTreeData.fire();
        })
    }


    async loadAndFormatTests() {
        try {
            this._tests = await core.getTests();
            this._formatedTest = this._createTreeFromArray();
        } catch (error) {
            console.log(`failed on getting tests ${error}`);
        }

    }

    async getChildren(element) {
        try {
        
            if (!element) {
                let nodes = [];
                // await this.loadAndFormatTests();
                this.item = new mochaItem('Tests', vscode.TreeItemCollapsibleState.Expanded, 'rootTests', null, this._formatedTest[""], 0)
                this.rootElement = this.item;
                nodes.push(this.item);
                return nodes;
    
            } else {
                return this._newLevelRunning(element.item)
            }
        } catch (error) {
            console.log(`failed on running tests ${error}`);
        }
        //   console.log(`get Children: ${this._hierarchyLevel}`);
      
    }
    getRootElement() {
        return this.rootElement;
    }


    async refreshExplorer() {
        if (this.item) {
            await this.loadAndFormatTests();
        }
        this._onDidChangeTreeData.fire(this.item);
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
                if (this.incomingResultsStatus.results.length) {
                  //  status = setItemResultStatus(this.results, item[1].__test.fullName, item[1].__test.suitePath);
                  status = getRelevantStatusFromResults(item[1].__test.fullName,this.incomingResultsStatus.results);
                  iconPath = this._setPassOrFailIcon(status);
                } else {
                    status = consts.NOT_RUN;
                }
           //     console.log(`name:${item[1].__test.name},file:${item[1].__test.file}`);
                let mItem = new mochaItem(item[1].__test.name, vscode.TreeItemCollapsibleState.None, 'testItem', iconPath, item[1], 0);
                item[1].__test.mItem = mItem;
               // setDecorationOnUpdateResults(status, mItem);

                this.currentResultWithItem.push({
                    status,
                    test: item[1].__test,
                    type: "test"
                })
                return nodes.push(mItem);
            } else {
                let name = item[0];
                let i = new mochaItem(name, vscode.TreeItemCollapsibleState.Expanded, 'testDescriber', null, item[1], 0);
            
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
                    dark: path.join(__filename, '..', '..', 'images', 'dark', 'testPass.svg'),
                    light: path.join(__filename, '..', '..', 'images', 'light', 'testPass.svg')
                }
                break;
            case consts.FAILED:
                icon = {
                    dark: path.join(__filename, '..', '..', 'images', 'dark', 'testFail.svg'),
                    light: path.join(__filename, '..', '..', 'images', 'light', 'testFail.svg')
                }
                break;
            case consts.RUNNING:
                icon = {
                    dark: path.join(__filename, '..', '..', 'images', 'dark', 'refresh.svg'),
                    light: path.join(__filename, '..', '..', 'images', 'light', 'refresh.svg')
                };
                break;
            default:
                icon = {
                    dark: path.join(__filename, '..', '..', 'images', 'dark', 'testNotRun.svg'),
                    light: path.join(__filename, '..', '..', 'images', 'light', 'testNotRun.svg')
                };
        }

        return icon;
    }


    _trimLastDescriber(element, hierarchyLevel) {
        return element.suitePath[hierarchyLevel].replace(element.suitePath[hierarchyLevel - 1], "").trimLeft();
    }
    // async runAllTests(element) {
    //     // since describer level runs things in parallel
    //     return await this.runDescriberLevelTest(element);
    // }
    hookResultsFromCommands(results) {
        this.results = results;
        this._onDidChangeTreeData.fire(this.item);
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

    // async runDescriberLevelTest(element) {
    //     clearData();
    //     let tests = [];
    //     let results = [];
    //     mochaShim.outputChannel.clear();
    //     this._findObjectByLabel(element, '__test', tests);

    //     const status = await mapLimit(tests, config.parallelTests(), async (test) => {
    //         test.mItem.iconPath = this._setPassOrFailIcon(consts.RUNNING);
    //         this._onDidChangeTreeData.fire(test.mItem);
    //         const result = await this.runMochaTests([test], `^${escapeRegExp(test.fullName)}$`);
    //         results.push(result);
    //         let status = consts.NOT_RUN;
    //         if (result.passed.length) {
    //             status = consts.PASSED;
    //         } else if (result.failed.length) {
    //             status = consts.FAILED;
    //         }
    //         test.mItem.iconPath = this._setPassOrFailIcon(status);
    //         this._onDidChangeTreeData.fire(test.mItem);
    //         return status;
    //     });

    //     this.results = this._combinedResults(results);
    //     this.results.ranTests = tests;
    //     //this._onDidChangeTreeData.fire(this.item);
    // }

   
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
    _findElementByTest(element, testName, arr = []) {
        if (!element) {
            return;
        }
        else if (element.hasOwnProperty("__test")) {
            if (element["__test"].fullName===testName) {
                arr.push(element);
            }
            return;
        }

        else {
            Object.entries(element).filter(([k, v]) => k !== "meta").forEach(([k, v]) => this._findElementByTest(v, testName, arr))
        }
    }



    _dedupeStrings(array) {
        const keys = {};

        array.forEach(key => { keys[key] = 0; });

        return Object.keys(keys);
    }
    getTreeItem(element) {
     //   console.log(`getTreeItem:${element.label} expended:${element.contextValue}`);
        return element;
    }

}


module.exports = treeProvider; 