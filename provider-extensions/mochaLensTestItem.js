const { CodeLens, Range } = require('vscode');
class mochaLensTestItem extends CodeLens {
    constructor(commandRange, item, selector, name) {
        super(commandRange)
        // this._item = item;
        this.title = "title"
        this.command = {
            command: 'mocha-maty.runTest',
            title: 'Run Item',
            arguments: [{ label: item.test.name, item }]
        }
    }


}

module.exports = mochaLensTestItem;