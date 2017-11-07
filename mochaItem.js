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
            this.line = navigateEditorItem(this.item.__test.file, this.item.__test.name);
            this.command = {
                command: 'mocha-maty.itemSelection',
                title: 'item selection',
                arguments: [{ __test: this.item.__test, line: this.line }]
            }
        }
        else if (this.contextValue == "testDescriber") {
            let testItem = null;
            testItem = this._getFirstTestItem(this.item);
            this.line = navigateEditorItem(testItem.file,this.label);
        
            


            

        }

    }

    _getFirstTestItem(item) {
        let it = Object.keys(item).find(i => i == "__test");
        if (it) {
            return item.__test;
        }
        return this._getFirstTestItem(item[Object.keys(item)[1]])
    }
}

module.exports = mochaItem;