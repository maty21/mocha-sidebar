
const vscode = require('vscode');
const { runTestsOnSave } = require('./config');
class changesNotification {
    constructor(mochaProvider) {
        this._autoPlayOnSave = (runTestsOnSave() == 'true');
        this._mochaProvider = mochaProvider;
        this._activeEditor = vscode.window.activeTextEditor;

        vscode.window.onDidChangeActiveTextEditor(editor => {
            console.log(`onDidChangeActiveTextEditor: ${editor}`)
            this._mochaProvider.updateDecorations();
        })
        vscode.workspace.onDidSaveTextDocument(editor => {
            if (this._autoPlayOnSave) {
                this._mochaProvider.runAllTests(this._mochaProvider.item);
            }
            console.log(`onDidSaveTextDocument: ${editor}`)
        })
        vscode.workspace.onDidChangeTextDocument(editor => {
            console.log(`onDidChangeTextDocument: ${editor}`)
        })
    }
    start() {
        this._autoPlayOnSave = true;
    }
    pause() {
        this._autoPlayOnSave = false;
    }
}

module.exports = changesNotification;