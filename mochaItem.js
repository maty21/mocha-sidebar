const vscode = require('vscode');
const navigateEditorItem = require('./provider-extensions/NavigateEditorItem.js');
class mochaItem extends vscode.TreeItem {
    constructor(label, collapsibleState, contextValue, iconPath, item, hierarchyLevel = 0) {
        super(label, collapsibleState);
        this.contextValue = contextValue;
        this.iconPath = iconPath;
        this.item = item;
        this.hierarchyLevel = hierarchyLevel;
        if (this.contextValue == "testItem") {
            this.line = navigateEditorItem(this.item.test.file,this.item.test.name);
            this.command = {
                command: 'mocha-maty.itemSelection',
                title: 'item selection',
                arguments: [{test:this.item.test,line:this.line}]
            }
        }

    }
}

module.exports = mochaItem;