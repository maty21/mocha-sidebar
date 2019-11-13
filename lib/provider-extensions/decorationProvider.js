const vscode = require("vscode");
const stacktraceParser = require("stacktrace-parser");
const decorationType = require("./decorationType");
const consts = require("./consts");
const config = require("../config");
const core = require("../core");
//const notification = require("../notificationsProvider");

class decorationProvider {
  constructor() {
    this.pushStyle = [];
    this.currentFile = null;
    this.decoratorAndStyle = [];
    this.currentResults = null;
  }
  async init(notification) {
    const tests = await core.getTests();
    this.initDecorationStyle(tests);
    //core.on(core.events.INIT_RESULTS, () => this.removeStyle())
    notification.on(notification.events.FILE_CHANGED, editor => {
      if (editor) {
        this.reloadStyleByPath(editor.document.fileName);
      }
    });
    // maybe could cause over rendring issue fixing
    notification.on(notification.events.CONTENT_CHANGED, editor => {
      if (editor) {
        this.reloadStyleByPath(editor.document.fileName);
      }
    });
    //core.on(core.events.TESTS, tests => this.updateDecorationStyle(tests));
    core.on(core.events.FINISH_RESULTS_AGGREGATED, results => (this.currentResults = results));
    core.on(core.events.UPDATE_RESULT, result => this.setDecorationOnUpdateResults(result));
    if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
      this.reloadStyleByPath(vscode.window.activeTextEditor.document.fileName);
    }
  }
  initDecorationStyle(tests) {
    this.removeStyle();
    this.currentResults = { notRunTests: tests };
  }

  setDecoration(status, test) {
    if (config.sideBarOptions().decoration) {
      let style = this.getStyle(status);
      //    console.log(`test file in decorations: ${test.item.__test.file}, name:${test.item.__test.name}`);
      if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName == test.file) {
        let decorators = {
          range: new vscode.Range(test.meta.number - 1, 0, test.meta.number - 1, 1e3),
          hoverMessage: new vscode.MarkdownString("#### " + status)
          //range: new vscode.Range(line[0].number - 1, it.start.column - 1,  line[0].number - 1, it.start.column + 1)
        };
        try {
          //stub
          if (status == consts.FAILED) {
            const stacktrace = stacktraceParser.parse(test.error.raw.stack);
            if (stacktrace && stacktrace[0] && stacktrace[0].lineNumber) {
              let errorMessageDecorator = {
                range: new vscode.Range(stacktrace[0].lineNumber - 1, 0, stacktrace[0].lineNumber - 1, 1e3),
                hoverMessage: new vscode.MarkdownString(`#### Stack trace
\`\`\`javascript 
        ${test.error.raw.stack}


        
    \`\`\` `)
              };
              let errorMessageStyle = decorationType.expectErrorMessage(test.error.raw.message);
              this.pushStyle.push(errorMessageStyle);
              vscode.window.activeTextEditor.setDecorations(errorMessageStyle, [errorMessageDecorator]);
            }
          }
          this.removeSpecificStyle(test.fullName);
          this.pushStyle.push({ fullName: test.fullName, path: test.file, style });
          vscode.window.activeTextEditor.setDecorations(style, [decorators]);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      }
    }
  }

  setCurrentWorkspaceFile(cFile) {
    this.currentFile = cFile;
  }
  setDecorationOnUpdateResults({ item, status, result }) {
    this.removeSpecificStyle(item.fullName);
    this.decoratorAndStyle.push({ status, test: item });
    this.setDecoration(status, item, result);
  }

  clearData() {
    this.removeStyle();
    this.pushStyle = [];
    this.decoratorAndStyle = [];
  }
  removeSpecificStyle(fullname) {
    const styles = this.pushStyle.filter(s => s.fullName === fullname);
    styles.forEach(s => s.style.dispose());
  }

  reloadStyleByPath(file) {
    if (this.currentResults) {
      if (this.currentResults.results) {
        this.currentResults.results.passed.filter(p => p.file === file).forEach(r => this.reloadDecorationByName(consts.PASSED, r));
        this.currentResults.results.failed.filter(p => p.file === file).forEach(r => this.reloadDecorationByName(consts.FAILED, r));
      }
      if (this.currentResults.notRunTests) {
        this.currentResults.notRunTests.filter(p => p.file === file).forEach(t => this.reloadDecorationByName(consts.NOT_RUN, t));
      }
      // resultsForPath.forEach(r => this.removeSpecificStyle(r.fullName));
    }
  }
  removeStyle() {
    this.pushStyle.forEach(s => s.style.dispose());
  }
  reloadDecorationByName(status, test) {
    this.removeSpecificStyle(test.fullName);
    this.setDecoration(status, test);
  }
  getStyle(status) {
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
