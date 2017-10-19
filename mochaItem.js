const vscode = require('vscode');

class mochaItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue, iconPath, item, hierarchyLevel = 0) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
        this.iconPath = iconPath;
        this.item = item;
        this.hierarchyLevel = hierarchyLevel;
        if (this.contextValue == "testItem") {
            this.command = {
                command: 'mocha-maty.itemSelection',
                title: 'item selection',
                arguments: [this.item.test]
            }
        }

    }
}

module.exports = mochaItem;