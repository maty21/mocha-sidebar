/* eslint-disable no-console */
const vscode = require("vscode");
class messages {
  constructor() {
    this.channelName = {
      COVERAGE: "sideBar-coverage",
      TEST: "sideBar-test"
    };

    this.messageType = {
      INFO: "info",
      WARNING: "warning",
      ERROR: "error"
    };
    this.init();
  }

  init() {
    this.channels = {
      [this.channelName.COVERAGE]: vscode.window.createOutputChannel(this.channelName.COVERAGE),
      [this.channelName.TEST]: vscode.window.createOutputChannel(this.channelName.TEST)
    };
    this.popUp = {
      [this.messageType.WARNING]: vscode.window.showWarningMessage,
      [this.messageType.ERROR]: vscode.window.showErrorMessage,
      [this.messageType.INFO]: vscode.window.showInformationMessage
    };
  }
  sendPopUpMessage(message, type = this.messageType.WARNING) {
    this.popUp[type](`side-bar: ${message}`);
  }
  send(channelName, message) {
    if (message === null) {
      return {
        send: innerMessage => {
          this.channels[channelName].appendLine(innerMessage);
          console.log(`user message ${innerMessage}`);
        },
        show: () => this.show(channelName),
        clear: () => this.clear(channelName)
      };
    } else {
      this.channels[channelName].appendLine(message);
      console.log(`user message ${message}`);
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
