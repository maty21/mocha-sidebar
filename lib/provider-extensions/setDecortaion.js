const vscode = require("vscode");
const stacktraceParser = require("stacktrace-parser");
const decorationType = require("./decorationType");
const consts = require("./consts");
const config = require("../config");
const core = require("../core");

class decorationProvider {
  constructor() {
    this.pushStyle = [];
    this.currentFile = null;
    this.decoratorAndStyle = [];
  }
  init() {
    //core.on(core.events.INIT_RESULTS, () => this.removeStyle())
    core.on(core.events.TESTS, tests => this.updateDecorationStyle(tests));
    //  core.on(core.events.FINISH_RESULTS,results=>this.updateDecorationStyle(results))
    core.on(core.events.UPDATE_RESULT, result => this.setDecorationOnUpdateResults(result));
  }
  updateDecorationStyle(tests) {
    this.removeStyle();
    tests.forEach(test => this.setDecoration(consts.NOT_RUN, test));
  }

  setDecoration(status, test) {
    if (config.sideBarOptions().decoration) {
      let style = this.getStyle(status);
      //    console.log(`test file in decorations: ${test.item.__test.file}, name:${test.item.__test.name}`);
      if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName == test.file) {
        let decorators = {
          range: new vscode.Range(test.meta[0].number - 1, 0, test.meta[0].number - 1, 1e3),
          hoverMessage: new vscode.MarkdownString("#### " + status)
          //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
        };
        try {
          //stub
          if (status == consts.FAILED) {
            const stacktrace = stacktraceParser.parse(status.error.raw.stack);
            if (stacktrace && stacktrace[0] && stacktrace[0].lineNumber) {
              let errorMessageDecorator = {
                range: new vscode.Range(stacktrace[0].lineNumber - 1, 0, stacktrace[0].lineNumber - 1, 1e3),
                hoverMessage: new vscode.MarkdownString(`#### Test Error
                                \`\`\`javascript
                                ${resStatus.error.raw.stack}
                                \`\`\`
                                `)
                //'# ' + resStatus.status+"  \`\`\`javascript\n"+resStatus.error.raw.stack+"\n\`\`\`"
                //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
              };
              let errorMessageStyle = decorationType.expectErrorMessage(resStatus.error.raw.message);
              this.pushStyle.push(errorMessageStyle);
              vscode.window.activeTextEditor.setDecorations(errorMessageStyle, [errorMessageDecorator]);
            }
          }
          this.removeSpecificStyle(test.fullName);
          this.pushStyle.push({ fullName: test.fullName, style });
          vscode.window.activeTextEditor.setDecorations(style, [decorators]);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  setCurrentWorkspaceFile(cFile) {
    this.currentFile = cFile;
  }
  setDecorationOnUpdateResults({ item, status }) {
    this.decoratorAndStyle.push({ status, test: item });
    this.setDecoration(status, item);
  }

  clearData() {
    this.removeStyle();
    pushStyle = [];
    decoratorAndStyle = [];
  }
  removeSpecificStyle(fullname) {
    const styles = this.pushStyle.filter(s => s.fullName === fullname);
    styles.forEach(s => s.style.dispose());
  }
  removeStyle() {
    this.pushStyle.forEach(s => s.style.dispose());
  }

  getStyle(status) {
    let decorationStyle = null;
    switch (status) {
      case consts.PASSED:
        return decorationType.pass();
      case consts.FAILED:
        return decorationType.fail();
      case consts.RUNNING:
        return decorationType.running();
      default:
        return decorationType.notRun();
    }
  }
}

module.exports = decorationProvider;
