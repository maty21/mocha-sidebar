const vscode = require('vscode');
const { files } = require('../config')
const abstractCodeLens = require('./abstractCodeLens')

class mochaLens extends abstractCodeLens {
    constructor(context) {
        super();
        this._context = context;
    }

    get selector() {
        return {
            language: 'javascript',
            scheme: 'file',
             pattern: files().glob,
            //group: ['tags', 'statuses'],
        }
    }
    provideCodeLenses(document, token) {
        console.log(document);

    }
    resolveCodeLens(lens, token) {

    }

}

module.exports = mochaLens;