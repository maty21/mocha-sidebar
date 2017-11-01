const vscode = require('vscode');
const decorationType = require('./decorationType');
const consts = require('./consts');
const setDecoration = (resStatus, test) => {

    let style = getStyle(resStatus);
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


    // return blocks.map(it => {
    //     return {
    //       // VS Code is indexed starting at 0
    //       // jest-editor-support is indexed starting at 1
    //       range: new vscode.Range(it.start.line - 1, it.start.column - 1, it.start.line - 1, it.start.column + 1),
    //       hoverMessage: nameForState(it.name, state),
    //     }
    //   })


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

module.exports = setDecoration;
