const { CodeLens, Range } = require('vscode');
class MochaLensDescriberItem extends CodeLens {
    constructor(commandRange, item, selector, name) {
        super(commandRange)
        // this._item = item;
        this.title = "title"
        this.command = {
            command: 'mocha-maty.runDescriberLevelTest',
            title: 'Run Suite',
            arguments: [item]
        }
    }


}

module.exports = MochaLensDescriberItem;