const { CodeLens, Range } = require('vscode');
class mochaLensDebugItem extends CodeLens {
    constructor(commandRange, item, selector, name) {
        super(commandRange)
        // this._item = item;
        this.title = "title"
        this.command = {
            command: 'mocha-maty.debugItem',
            title: 'Debug Item',
            arguments: [{ label: item.name, item }]
        }
    }


}

module.exports = mochaLensDebugItem;