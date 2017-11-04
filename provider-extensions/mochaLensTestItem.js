const { CodeLens, Range } = require('vscode');
class mochaLensTestItem extends CodeLens {
    constructor(commandRange, document, selector, name) {
        super(commandRange)
        // this._item = item;
        this.title = "title"
        this.command = {
            command: 'mocha-maty.itemSelection',
            title: 'Run Item',
            arguments: [{ test: document, line: name }]
        }
    }


}

module.exports = mochaLensTestItem;