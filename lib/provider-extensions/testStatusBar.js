const vscode = require("vscode");
const core = require("../core");

class testsStatusBar {
  constructor() {
    this.status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);
    this.status.text = this.statusTemplate(0, 0);
    this.status.show();
    core.on(core.events.FINISH_RESULTS, res => console.log(res));
  }
  statusTemplate(passed, failed) {
    return ` Tests  $(check) ${passed}   $(x) ${failed} `;
  }
}

module.exports = new testsStatusBar();
