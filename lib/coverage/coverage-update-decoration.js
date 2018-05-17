const vscode = require('vscode');
const decorationType = require('./coverage-decoration');
const config = require('../../config');
const stacktraceParser = require('stacktrace-parser')
const { HIT_TYPE,HIT_TYPE_BREAKPOINT } = require('./hit-ratio')

let pushStyle = [];
let currentFile = null;
let decoratorAndStyle = []
const setDecoration = (resStatus, line, hit, fileName,isBreakpoint) => {
    let style = getStyle(resStatus,isBreakpoint);
    pushStyle.push(style);
    //console.log(`test file in decorations: consts${fileName}, name:${line}`);
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName == fileName) {
        let decorators = {
            range: new vscode.Range(line - 1, 0, line - 1, 1e3),
            hoverMessage: new vscode.MarkdownString(`X${hit}`),
            //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
        }
        vscode.window.activeTextEditor.setDecorations(style, [decorators])
    }



}

const setCurrentWorkspaceFile = (cFile) => {
    currentFile = cFile;
}
const setDecorationOnUpdateResults = (resStatus, test) => {
    decoratorAndStyle.push({ resStatus, test });
    setDecoration(resStatus, test)
}

const breakpointDecoration = () => {
    console.log(` breakpoints : ${vscode.debug.breakpoints}`)
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
const getStyle = (status,isBreakpoint) => {
    let decorationStyle = null
     const style  = isBreakpoint? HIT_TYPE_BREAKPOINT[status]:HIT_TYPE[status]
    return decorationType.getStyle(style)
   /*  if(isBreakpoint){
        switch (status) {
            case HIT_TYPE.GREEN:
                return decorationType.greenHitBreakpoint()
                break;
            case HIT_TYPE.YELLOW:
                return decorationType.yellowHit()
                break;
            default:
                return decorationType.redHit()
        }
    }
    else{
        switch (status) {
            case HIT_TYPE.GREEN:
                return decorationType.greenHitBreakpoint()
                break;
            case HIT_TYPE.YELLOW:
                return decorationType.yellowHit()
                break;
            default:
                return decorationType.redHit()
        }
        
    } */
}

module.exports = { updateDecorationStyle, setDecorationOnUpdateResults, clearData, setCurrentWorkspaceFile, setDecoration };
