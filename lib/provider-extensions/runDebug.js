const vscode = require("vscode");
const escapeStringRegexp = require("escape-string-regexp");
const path = require("path");
const config = require("../config");
let mochaPath = require.resolve(config.mochaPath());
//dirty fix for an issue where path is set
const env = config.env();
const clone = require("clone");
if (!config.mochaPath().includes("/lib/mocha.js")) {
  mochaPath = path.dirname(mochaPath);
  mochaPath = path.join(mochaPath, "bin", "_mocha");
}

class debuggerProvider {
  constructor() {
    this.currentElement = null;
    this._provider = null;
    this.callFunctionOnTerminate = null;
    this.results = [];
    this.defaultDebugOption = {
      name: "Mocha Tests",
      type: "node",
      request: "launch",
      stopOnEntry: false,
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
  async _debug(grep) {
    return new Promise(async (resolve, reject) => {
      this.results = [];

      //  callFunctionOnTerminate = functionOnTerminate.bind(_provider);
      //  this.currentElement = element;
      let glob = config.files().glob || "./test/**/*.js";
      const mochaTest = clone(this.defaultDebugOption);
      mochaTest.args = [glob, "--grep", grep];
      mochaTest.args = this.addRequires(mochaTest.args);
      mochaTest.args = this.addOptions(mochaTest.args);
      mochaTest.cwd = this.applySubdirectory(vscode.workspace.rootPath);
      mochaTest.env = config.env();
      //  let reg = new RegExp(`^${element.item.test.fullName}$`)
      vscode.debug.onDidTerminateDebugSession(ev => {
        resolve();
      });
      const res = await vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest);
      if (!res) {
        reject();
      }
    });
  }
}

module.exports = new debuggerProvider();
