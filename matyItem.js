const vscode = require('vscode');

class MatyItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue, iconPath, item, hierarchyLevel = 0) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
        this.iconPath = iconPath;
        this.item = item;
        this.hierarchyLevel = hierarchyLevel;
    }
}

module.exports = MatyItem;