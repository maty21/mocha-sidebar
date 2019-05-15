const vscode = require("vscode");
class messages {
  constructor() {
    this.channelName = {
      COVERAGE: "sideBar-coverage",
      TEST: "sideBar-test"
    };
    this.init();
  }

  init() {
    this.channels = {
      [this.channelName.COVERAGE]: vscode.window.createOutputChannel(this.channelName.COVERAGE),
      [this.channelName.TEST]: vscode.window.createOutputChannel(this.channelName.TEST)
    };
  }
  send(channelName, message) {
    if (message === null) {
      return {
        send: innerMessage => this.channels[channelName].appendLine(innerMessage),
        show: () => this.show(channelName),
        clear: () => this.clear(channelName)
      };
    } else {
      this.channels[channelName].appendLine(message);
    }
  }
  show(channelName) {
    this.channels[channelName].show();
  }
  clear(channelName) {
    this.channels[channelName].clear();
  }
}

module.exports = new messages();
