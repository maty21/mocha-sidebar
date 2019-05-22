const vscode = require("vscode");
const EventEmitter = require("events");

class notificationProvider extends EventEmitter {
  constructor() {
    super();
    this.events = {
      CONTENT_CHANGED: "CONTENT_CHANGED",
      FILE_CHANGED: "FILE_CHANGED",
      FILE_SAVED: "FILE_SAVED",
      BREAKPOINT_CHANGED: "BREAKPOINT_CHANGED"
    };
  }
  init() {
    this._windowNotifications();
    this._debugNotifications();
    this._workspaceNotifications();
  }
  _windowNotifications() {
    vscode.window.onDidChangeActiveTextEditor(editor => this.emit(this.events.FILE_CHANGED, editor));
  }

  _workspaceNotifications() {
    vscode.workspace.onDidSaveTextDocument(editor => this.emit(this.events.FILE_SAVED, editor));
    vscode.workspace.onDidChangeTextDocument(editor => this.emit(this.events.CONTENT_CHANGED, editor));
    //  vscode.workspace.onDidChangeTextDocument(editor => console.log(`event raise`));
  }

  _debugNotifications() {
    vscode.debug.onDidChangeBreakpoints(breakpoints => this.emit(this.events.BREAKPOINT_CHANGED, breakpoints));
  }
}

module.exports = notificationProvider;
