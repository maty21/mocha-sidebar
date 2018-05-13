const vscode = require('vscode');
const decorationType = require('./coverage-decoration');
const config = require('../config');
const stacktraceParser = require('stacktrace-parser')
const {HIT_TYPE} = require('./hit-ratio')

let pushStyle = [];
let currentFile = null;
let decoratorAndStyle = []
const setDecoration = (resStatus,line,hit,fileName) => {
        let style = getStyle(resStatus);
        pushStyle.push(style);
        console.log(`test file in decorations: consts${fileName}, name:${line}`);
        if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName == fileName) {
            let decorators = {
                range: new vscode.Range(line - 1, 0, line - 1, 1e3),
                hoverMessage: new vscode.MarkdownString(`X${hit}`),
                //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
            }
            vscode.window.activeTextEditor.setDecorations(style, [decorators])
   /*          try {
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
            } catch (error) {
                console.log(error);
            } */
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
        case HIT_TYPE.GREEN:
            return decorationType.greenHit()
            break;
        case HIT_TYPE.YELLOW:
            return decorationType.yellowHit()
            break;
        default:
            return decorationType.redHit()
    }
}

module.exports = { updateDecorationStyle, setDecorationOnUpdateResults, clearData, setCurrentWorkspaceFile,setDecoration };
