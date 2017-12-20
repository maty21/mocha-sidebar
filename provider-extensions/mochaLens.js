const vscode = require('vscode');
const { files } = require('../config');

const abstractCodeLens = require('./abstractCodeLens')
const mochaLensTestItem = require('./mochaLensTestItem');
const mochaDebugLensTestItem = require('./mochaDebugLensTestItem');
const mochaLensDescriberItem = require('./mochaLensDescriberItem');
const mochaLensDebugDescriberItem = require('./mochaLensDebugDescriberItem');
const config = require('../config');
const TYPE = {
    test: 'test',
    debug: 'debug'
}
class mochaLens extends abstractCodeLens {
    constructor(context, mochaProvider) {
        super();
        this._context = context;
        this._mochaTreeProvider = mochaProvider
        this.item = null;
        this.lastDocument = null;
        this.listOfSpecificFileItems = {};
        this._counterOfItemsThatAlreadySet = {
            test: {},
            debug: {}
        };
    }

    get selector() {
        return {
            language: 'javascript',
            scheme: 'file',
            // pattern: files().glob,
            //group: ['tags', 'statuses'],
        }
    }
    raiseEventOnUpdate() {
        this.reload();
    }
    async provideCodeLenses(document, token) {
      //  console.log(vscode.workspace.getConfiguration('mocha'));
        if (config.sideBarOptions().lens) {
            this.item = await this._dirtyCheck();
            this._counterOfItemsThatAlreadySet = {
                test: {},
                debug: {}
            };
            this.lastDocument = document.fileName;
            this.listOfSpecificFileItems = this._getRelevantItems();
            console.log(document);
            this.lens = [];
            this.createLensFromTree(this.listOfSpecificFileItems, this.lens)
            //let lens = this.lensTestCreator(this.item.item['test'], document, selector, "item")
            return this.lens;
        }

    }
    resolveCodeLens(lens, token) {
        return lens
    }
    //its dirty but thats the only way without testing it again
    //should be change in the near future
    async _dirtyCheck() {
        return new Promise((resolve, reject) => {
            this._dirtyCheckTimer(resolve);
        });

    }
    _dirtyCheckTimer(resolve) {
        setTimeout(() => {
            if (this._mochaTreeProvider.item) {
                resolve(this._mochaTreeProvider.item);
            }
            return this._dirtyCheckTimer(resolve);
        }, 1000)
    }


    _returnRelevantItemCounter(item, type) {
        let name = item.meta[0].match;
        if (this._counterOfItemsThatAlreadySet[type][name] != null) {
            this._counterOfItemsThatAlreadySet[type][name] = this._counterOfItemsThatAlreadySet[type][name] + 1;
            //     console.log(name);
        }
        else {
            this._counterOfItemsThatAlreadySet[type][name] = 0;
            //      console.log(name);
        }

        return this._counterOfItemsThatAlreadySet[type][name]
    }

    lensTestCreator(item) {
        let itemPlace = this._returnRelevantItemCounter(item, TYPE.test);
        let range = new vscode.Range(item.meta[itemPlace].number - 1, 0, item.meta[itemPlace].number - 1, 10);
        return new mochaLensTestItem(range, item);
    }
    lensTestDebugCreator(item) {
        let length = 'Debug Item'.length
        let itemPlace = this._returnRelevantItemCounter(item, TYPE.debug);
        let range = new vscode.Range(item.meta[itemPlace].number - 1, 0, item.meta[itemPlace].number - 1, 20);
        return new mochaDebugLensTestItem(range, item);
    }
    lensDescribeCreator(item) {
        let itemPlace = this._returnRelevantItemCounter(item, TYPE.test);
        let range = new vscode.Range(item.meta[itemPlace].number - 1, 0, item.meta[itemPlace].number - 1, 1e3);
        return new mochaLensDescriberItem(range, item);
    }
    lensDescribeDebugCreator(item) {
        let length = 'Debug Suite'.length
        let itemPlace = this._returnRelevantItemCounter(item, TYPE.debug);
        let range = new vscode.Range(item.meta[itemPlace].number - 1, 0, item.meta[itemPlace].number - 1, 20);
        return new mochaLensDebugDescriberItem(range, item);
    }



    createLensFromTree(item, lensArr = []) {
        if (!item) {
            return;
        }
        Object.keys(item).forEach(k => {
            if (k != "meta") {
                let lens = this.createLensItemFromTree(k, item);
                if (lens) {
                    lens.forEach(l => lensArr.push(l))
                    // lensArr.push(lens[0]);
                    //  lensArr.push(lens[1]);

                }
                //reach the leaves
                if (item[k].__test) {
                    return;
                }
                this.createLensFromTree(item[k], lensArr)
            }

        })


    }
    createLensItemFromTree(key, item) {
        if (key == "meta") {
            return;
        }
        if (item[key].__test) {
            let debug = this.lensTestDebugCreator(item[key]);
            let test = this.lensTestCreator(item[key])
            return [test, debug]
            // return debug;
        }
        return [this.lensDescribeCreator(item[key]), this.lensDescribeDebugCreator(item[key])]

    }

    _getRelevantItems() {
        let listOfItems = {};
        let { item } = this.item;
        Object.keys(item).forEach(k => {
            if (!item[k]) {
                return;
            }
            let path = this._getFirstTestItemPath(item[k]);
            if (path == this.lastDocument) {
                listOfItems[k] = item[k];
            }
        })
        return listOfItems;
    }
    _getFirstTestItemPath(item) {
        let it = Object.keys(item).find(i => i == "__test");
        if (it) {
            return item.__test.file;
        }
        return this._getFirstTestItemPath(item[Object.keys(item)[1]])
    }


}

module.exports = mochaLens;