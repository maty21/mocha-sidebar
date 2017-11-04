const { CodeLens, Range } = require('vscode');
class MochaLensDescriberItem extends CodeLens {
    constructor(commandRange, document, selector, name) {
        super(commandRange)
        // this._item = item;
        this.title = "title"
        this.command = {
            command: 'mocha-maty.itemSelection',
            title: 'Run Suite',
            arguments: [{ test: document, line: name }]
        }
    }


}

module.exports = MochaLensDescriberItem;