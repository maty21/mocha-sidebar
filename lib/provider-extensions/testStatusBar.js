const vscode = require("vscode");
const core = require("../core");

class testsStatusBar {
  init() {
    this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);
    this.status.text = this.statusTemplate(0, 0);
    this.status.show();
    core.on(core.events.FINISH_RESULTS, ({ results }) => (this.status.text = this.statusTemplate(results.passed.length, results.failed.length)));
  }
  statusTemplate(passed, failed) {
    return ` Tests  $(check) ${passed}   $(x) ${failed} `;
  }
}

module.exports = testsStatusBar;
