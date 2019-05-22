const vscode = require("vscode");
const escapeStringRegexp = require("escape-string-regexp");
const path = require("path");
const config = require("../config");
//dirty fix for an issue where path is set
const env = config.env();
const clone = require("clone");
const messages = require("../output/messages");

class debuggerProvider {
  constructor() {
    this.currentElement = null;
    this._provider = null;
    this.callFunctionOnTerminate = null;
    this.results = [];
  }

  _setDebugOption() {
    let mochaPath = config.mochaPath().binary;
    try {
      if (mochaPath === "mocha") {
        mochaPath = require.resolve(mochaPath);
        mochaPath = path.dirname(mochaPath);
        mochaPath = path.join(mochaPath, "bin", "_mocha");
      }
    } catch (error) {
      messages.send(messages.channelName.TEST, `unable to find mocha. Error: ${error.message}`);
      vscode.window.showErrorMessage(`sidebar: unable to find mocha. Error: ${error.message}`);
      return;
    }
    return {
      name: "Mocha Tests",
      type: "node",
      request: "launch",
      stopOnEntry: false,
      skipFiles: ["<node_internals>/**"],
      // "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
      program: mochaPath,
      cwd: "${workspaceRoot}",
      //    "args": ["./test/**/*.js", '--grep', '^green 4 inner green 4$'],
      // "args": ["./test/**/*.js"],
      runtimeExecutable: null,
      env: env

      //"envFile": "${workspaceRoot}/.env"
    };
  }
  addRequires(args) {
    const requires = config.requires();
    if (!requires || requires.length === 0) {
      return args;
    }
    const argsArray = Array.isArray(args) ? args : [args];
    requires.forEach(r => {
      argsArray.push("-r");
      argsArray.push(r);
    });
    return argsArray;
    // return [...argsArray, '-r', ...requires]
  }
  addOptions(args) {
    const options = config.options();
    const optionsArray = Object.entries(options);
    if (!optionsArray || optionsArray.length === 0) {
      return args;
    }
    const argsArray = Array.isArray(args) ? args : [args];
    optionsArray.forEach(([key, value]) => {
      argsArray.push(`--${key}`);
      argsArray.push(`${value}`);
    });
    return argsArray;
    // return [...argsArray, '-r', ...requires]
  }

  applySubdirectory(rootPath) {
    const subdirectory = config.subdirectory();

    if (subdirectory) rootPath = path.resolve(rootPath, subdirectory);

    return rootPath;
  }

  async debugSuite(name) {
    const grep = `^${escapeStringRegexp(name)}`;
    return this._debug(grep);
  }
  async debugItem(name) {
    const grep = `^${escapeStringRegexp(name)}$`;
    return this._debug(grep);
  }
  async debugAll() {
    const grep = `.*`;
    return this._debug(grep);
  }
  defaultDebuggingCongiuration() {
    const defaultDebugOption = this._setDebugOption();
    const mochaTest = clone(defaultDebugOption);
    let glob = config.files().glob || "./test/**/*.js";
    mochaTest.args = [glob];
    mochaTest.args = this.addRequires(mochaTest.args);
    mochaTest.args = this.addOptions(mochaTest.args);
    //   mochaTest.cwd = this.applySubdirectory(vscode.workspace.rootPath);
    mochaTest.env = config.env();
    return mochaTest;
  }
  getDebugFromSettings() {
    const launchArray = vscode.workspace.getConfiguration("launch", vscode.window.activeTextEditor.document.uri);
    const debugSetting = launchArray.configurations.find(s => s.name === config.debugSettingsName());
    if (!debugSetting) {
      messages.send(messages.channelName.TEST, `cant find configuration with name ${config.debugSettingsName()} running with default configuration`);
      return this.getDebugFromSettings();
    }
    return debugSetting;
  }
  async _debug(grep) {
    return new Promise(async (resolve, reject) => {
      this.results = [];
      const debugSetting = config.debugSettingsName() ? this.getDebugFromSettings() : this.defaultDebuggingCongiuration();
      //  callFunctionOnTerminate = functionOnTerminate.bind(_provider);
      //  this.currentElement = element;
      debugSetting.args = debugSetting.args ? [...debugSetting.args, "--grep", grep] : ["--grep", grep];
      debugSetting.cwd = this.applySubdirectory(vscode.workspace.rootPath);

      //  let reg = new RegExp(`^${element.item.test.fullName}$`)
      vscode.debug.onDidTerminateDebugSession(ev => {
        resolve();
      });
      const res = await vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], debugSetting);
      if (!res) {
        reject();
      }
    });
  }
}

module.exports = new debuggerProvider();
