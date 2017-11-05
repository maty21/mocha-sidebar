const { CodeLens, Range } = require('vscode');
class MochaLensDebugDescriberItem extends CodeLens {
    constructor(commandRange, item, selector, name) {
        super(commandRange)
        // this._item = item;
        this.title = "title"
        this.command = {
            command: 'mocha-maty.debugLevel',
            title: 'Debug Suite',
            arguments: [item]
        }
    }


}

module.exports = MochaLensDebugDescriberItem;