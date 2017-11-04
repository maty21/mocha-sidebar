const vscode = require('vscode');
const { files } = require('../config');

const abstractCodeLens = require('./abstractCodeLens')
const mochaLensTestItem = require('./mochaLensTestItem');
const mochaLensDescriberItem = require('./mochaLensDescriberItem');
class mochaLens extends abstractCodeLens {
    constructor(context, mochaProvider) {
        super();
        this._context = context;
        this._mochaTreeProvider = mochaProvider
        this.item = null;
        this.lastDocument = null;
        this.listOfSpecificFileItems = {};
    }

    get selector() {
        return {
            language: 'javascript',
            scheme: 'file',
            // pattern: files().glob,
            //group: ['tags', 'statuses'],
        }
    }
    async provideCodeLenses(document, token) {
        this.item = await this._dirtyCheck();
        this.lastDocument = document.fileName;
        this.listOfSpecificFileItems = this._getRelevantItems();
        console.log(document);
        this.lens = [];
        this.createLensFromTree(this.listOfSpecificFileItems, this.lens)
        //let lens = this.lensTestCreator(this.item.item['test'], document, selector, "item")
        return this.lens;

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


    lensTestCreator(item) {
        let range = new vscode.Range(item.meta[0].number - 1, 0, item.meta[0].number - 1, 1e3);
        return new mochaLensTestItem(range, item);
    }
    lensDescribeCreator(item) {
        let range = new vscode.Range(item.meta[0].number - 1, 0, item.meta[0].number - 1, 1e3);
        return new mochaLensDescriberItem(range, item);
    }
    createLensFromTree(item, lensArr = []) {
        if (!item) {
            return;
        }
        Object.keys(item).forEach(k => {
            if (k != "meta") {
                let lens = this.createLensItemFromTree(k, item);
                if (lens) {
                    lensArr.push(lens);
                }
                //reach the leaves
                if (item[k].test) {
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
        if (item[key].test) {
            return this.lensTestCreator(item[key])
        }
        return this.lensDescribeCreator(item[key])

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
        let it = Object.keys(item).find(i => i == "test");
        if (it) {
            return item.test.file;
        }
        return this._getFirstTestItemPath(item[Object.keys(item)[1]])
    }


}

module.exports = mochaLens;