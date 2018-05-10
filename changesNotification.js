
const vscode = require('vscode');
const Glob = require('glob').Glob;
const path = require('path');
const { runTestsOnSave, files, sideBarOptions,coverage } = require('./config');
const codeCoverage = require('./lib/code-coverage');
class changesNotification {
    constructor(mochaProvider, lensProvider) {
        this._autoPlayOnSave = (runTestsOnSave() == 'true');
        this._mochaProvider = mochaProvider;
        this._activeEditor = vscode.window.activeTextEditor;
        this._lensProvider = lensProvider;
        this.onChangeTimeOutActive = false;
        this.ON_CHANGE_TIME_OUT = 2000;

        vscode.window.onDidChangeActiveTextEditor(editor => {
            console.log(`onDidChangeActiveTextEditor: ${editor}`)
            this._updatePathOnTestChange(editor, 1000)
            if(coverage().enable){
                codeCoverage.updateDecorationByFile(editor);
            }
            //    this._mochaProvider.updateDecorations(editor.document.fileName);
        })
        vscode.workspace.onDidSaveTextDocument(editor => {
            if (this._autoPlayOnSave) {
                this._mochaProvider.runAllTests(this._mochaProvider.item);
            }
            console.log(`onDidSaveTextDocument: ${editor}`)
        })
        vscode.workspace.onDidChangeTextDocument(editor => {
            //just a simple semaphore for avoiding multiple calls
            if (!this.onChangeTimeOutActive) {
                this.onChangeTimeOutActive = true;
                setTimeout(() => {
                    console.log(`onDidChangeTextDocument: ${editor}`)
                    this._updatePathOnTestChange(editor, sideBarOptions().autoUpdateTime)
                    this.onChangeTimeOutActive = false;
                }, this.ON_CHANGE_TIME_OUT);

            }
        })
    }
    //avoiding extra time out
    _calcAutoUpdateTime() {
        if (this.ON_CHANGE_TIME_OUT > sideBarOptions().autoUpdateTime) {
            return 100;
        }
        return sideBarOptions.autoUpdateTime - this.ON_CHANGE_TIME_OUT;
    }
    start() {
        this._autoPlayOnSave = true;
    }
    pause() {
        this._autoPlayOnSave = false;
    }
    _updatePathOnTestChange(editor, timeOut) {
        let { ignore, glob } = files();
        this.isTimeOutActive = false;
        new Glob(files().glob, { cwd: vscode.workspace.rootPath, ignore },
            (err, files) => {
                if (err) {
                    return err;
                }
                else if (!editor) {
                    console.warn(`notification:editor is not defined therefore tests will not updates 
                     please refresh it manually via side bar `);
                    return;
                }
                else {
                    files.forEach(f => {
                        if (path.normalize(`${vscode.workspace.rootPath}/${f}`) == editor.document.fileName) {
                            console.log(`true`);
                            if (!this.isTimeOutActive) {
                                this.isTimeOutActive = true;
                                console.log(`notification: changes detected update will start in ${timeOut} seconds`);
                                setTimeout(() => {
                                    console.log(`notification: timeout reached activating and set time out to active again`);
                                    this._mochaProvider.refreshExplorer();
                                    this._mochaProvider.updateDecorations(vscode.workspace.rootPath);
                                    this._lensProvider.raiseEventOnUpdate();
                                    this.isTimeOutActive = false;
                                }, this._calcAutoUpdateTime());
                            }
                            else {
                                console.log(`notification: ignore changes timeout active`)
                            }

                        }
                    })
                }
            })
    }
}

module.exports = changesNotification;