const vscode = require('vscode');
const decorationType = require('./decorationType');
const consts = require('./consts');
let pushStyle = [];
let currentFile = null;
let decoratorAndStyle = []
const setDecoration = (resStatus, test) => {
    let style = getStyle(resStatus);
    pushStyle.push(style);
    console.log(`test file in decorations: ${test.item.test.file}, name:${test.item.test.name}`);
    if (vscode.window.activeTextEditor.document.fileName == test.item.test.file) {
        let decorators = {
            range: new vscode.Range(test.line[0].number - 1, 0, test.line[0].number - 1, 1e3),
            hoverMessage: resStatus,
            //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
        }
        try {
            vscode.window.activeTextEditor.setDecorations(style, [decorators])
        } catch (error) {
            console.log(error);
        }
    }



}

const setCurrentWorkspaceFile = (cFile) => {
    currentFile = cFile;
}
const setDecorationOnUpdateResults = (resStatus, test) => {
    decoratorAndStyle.push({ resStatus, test });
    setDecoration(resStatus, test)
}

const clearData = () => {
    removeStyle();
    pushStyle = [];
    decoratorAndStyle = [];
}
const removeStyle = () => {
    pushStyle.forEach(s => s.dispose());
}
const updateDecorationStyle = () => {
    removeStyle();
    decoratorAndStyle.forEach(s => setDecoration(s.resStatus, s.test))
}
const getStyle = (status) => {
    let decorationStyle = null;
    switch (status) {
        case consts.PASSED:
            return decorationType.pass()
            break;
        case consts.FAILED:
            return decorationType.fail()
            break;
        default:
            return decorationType.notRun()
    }
}

module.exports = { updateDecorationStyle, setDecorationOnUpdateResults, clearData, setCurrentWorkspaceFile };
