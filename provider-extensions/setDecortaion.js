const vscode = require('vscode');
const decorationType = require('./decorationType');
const consts = require('./consts');
const config = require('../config');
const stacktraceParser = require('stacktrace-parser')

let pushStyle = [];
let currentFile = null;
let decoratorAndStyle = []
const setDecoration = (resStatus, test) => {
    if (config.sideBarOptions().decoration) {

        let style = getStyle(resStatus.status);
        pushStyle.push(style);
        console.log(`test file in decorations: ${test.item.__test.file}, name:${test.item.__test.name}`);
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName == test.item.__test.file) {
            let decorators = {
                range: new vscode.Range(test.line[0].number - 1, 0, test.line[0].number - 1, 1e3),
                hoverMessage: new vscode.MarkdownString('#### ' + resStatus.status),
                //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
            }
            try {
                //stub 
                if (resStatus.status == consts.FAILED) {
                    const stacktrace = stacktraceParser.parse(resStatus.error.raw.stack)
                    if (stacktrace && stacktrace[0] && stacktrace[0].lineNumber) {
                        let errorMessageDecorator = {

                            range: new vscode.Range(stacktrace[0].lineNumber - 1, 0, stacktrace[0].lineNumber - 1, 1e3),
                            hoverMessage: new vscode.MarkdownString(`#### Test Error
\`\`\`javascript
${resStatus.error.raw.stack}
\`\`\`
`),
                            //'# ' + resStatus.status+"  \`\`\`javascript\n"+resStatus.error.raw.stack+"\n\`\`\`"
                            //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
                        }
                        let errorMessageStyle = decorationType.expectErrorMessage(resStatus.error.raw.message);
                        pushStyle.push(errorMessageStyle);
                        vscode.window.activeTextEditor.setDecorations(errorMessageStyle, [errorMessageDecorator])
                    }

                }
                vscode.window.activeTextEditor.setDecorations(style, [decorators])
            } catch (error) {
                console.log(error);
            }
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
