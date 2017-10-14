
const vscode = require('vscode');

class changesNotification {
    constructor(mochaProvider) {
        
        this._mochaProvider = mochaProvider;
        this._activeEditor = vscode.window.activeTextEditor;
        
        vscode.window.onDidChangeActiveTextEditor(editor => {
            console.log(`onDidChangeActiveTextEditor: ${editor}`)
        })
        vscode.workspace.onDidSaveTextDocument(editor => {
            this._mochaProvider.runAllTests(this._mochaProvider.item);
            console.log(`onDidSaveTextDocument: ${editor}`)
        })
        vscode.workspace.onDidChangeTextDocument(editor => {
            console.log(`onDidChangeTextDocument: ${editor}`)
        })

    }
}

module.exports = changesNotification;