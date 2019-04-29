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

  //   debugAll(element, functionOnTerminate) {
  //     results = [];

  //     currentElement = element;
  //     callFunctionOnTerminate = functionOnTerminate.bind(_provider);

  //     mochaTest.args = config.files().glob || ["./test/**/*.js"];
  //     mochaTest.args = addRequires(mochaTest.args);
  //     mochaTest.args = addOptions(mochaTest.args);
  //     mochaTest.cwd = applySubdirectory(vscode.workspace.rootPath);
  //     mochaTest.env = config.env();
  //     vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
  //       console.log(`debug status:${data}`);
  //     });
  //   }
  //   async debugLevel(element, functionOnTerminate) {
  //     // results = [];
  //     _provider.clearResults();
  //     callFunctionOnTerminate = functionOnTerminate.bind(_provider);
  //     let tests = [];
  //     _provider._findObjectByLabel(element, "__test", tests);
  //     // let n = tests[0].fullName.replace(` ${tests[0].name}`, '')

  //     for (let t of tests) {
  //       await this.debug(t);
  //     }
  //   }
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

// let mochaTest = {
//     "name": "Mocha Tests",
//     "type": "node",
//     "request": "launch",
//     "stopOnEntry": false,
//     // "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
//    "program": mochaPath,
//     "cwd": "${workspaceRoot}",
//     //    "args": ["./test/**/*.js", '--grep', '^green 4 inner green 4$'],
//     // "args": ["./test/**/*.js"],
//     "runtimeExecutable": null,
//     "env":env

//     //"envFile": "${workspaceRoot}/.env"
// }

// // let launchConfig = {
// //   "name": "FakeNode",
// //   "type": "node2",
// //   "request": "launch",
// //   "program": "${workspaceRoot}/test/environment",
// //   "cwd": "${workspaceRoot}",
// //   "stopOnEntry": true,
// //   "protocol": "inspector"
// // };

// //   let attach = {
// //     "name": "Attach child",
// //     "type": "node",
// //     "request": "attach",
// //     "port": 5859,
// //     "address": "localhost",
// //     "restart": false,
// //     "sourceMaps": false,
// //     "outFiles": [],
// //     "localRoot": "${workspaceRoot}",
// //     "remoteRoot": null
// // }
// //   let launchConfig = {
// //     "name": "FakeNode",
// //     "type": "node2",
// //     "request": "launch",
// //     "program": "c:/dev/mocha-sidebar/worker/runtest",
// //     "cwd": "${workspaceRoot}",
// //     "stopOnEntry": true,
// //     "protocol": "inspector",
// //     "args": ["./test/**/*.js", '--grep', '^green 4 inner green 4$'],
// //   };

// let currentElement = null;
// let callFunctionOnTerminate = null;
// let _provider = null;
// let results = [];
// const addRequires = (args) => {
//     const requires = config.requires();
//     if (!requires || requires.length === 0) {
//         return args;
//     }
//     const argsArray = Array.isArray(args) ? args : [args];
//     requires.forEach(r => {
//         argsArray.push('-r');
//         argsArray.push(r);
//     });
//     return argsArray;
//     // return [...argsArray, '-r', ...requires]
// }
// const addOptions = (args) => {
//     const options = config.options();
//     const optionsArray = Object.entries(options);
//     if (!optionsArray || optionsArray.length === 0) {
//         return args;
//     }
//     const argsArray = Array.isArray(args) ? args : [args];
//     optionsArray.forEach(([key, value]) => {
//         argsArray.push(`--${key}`);
//         argsArray.push(`${value}`);
//     });
//     return argsArray;
//     // return [...argsArray, '-r', ...requires]
// }

// const applySubdirectory = (rootPath) => {
//     const subdirectory = config.subdirectory()

//     if (subdirectory)
//         rootPath = path.resolve(rootPath, subdirectory);

//     return rootPath;
// }

// const debugAll = (element, functionOnTerminate) => {
//     results = [];

//     currentElement = element;
//     callFunctionOnTerminate = functionOnTerminate.bind(_provider);
//     mochaTest.args = config.files().glob || ["./test/**/*.js"]
//     mochaTest.args = addRequires(mochaTest.args);
//     mochaTest.args = addOptions(mochaTest.args);
//     mochaTest.cwd = applySubdirectory(vscode.workspace.rootPath);
//     mochaTest.env = config.env();
//     vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
//         console.log(`debug status:${data}`);
//     })
// }
// const debugLevel = async (element, functionOnTerminate) => {
//     // results = [];
//     _provider.clearResults();
//     callFunctionOnTerminate = functionOnTerminate.bind(_provider);
//     let tests = [];
//     _provider._findObjectByLabel(element, '__test', tests);
//     // let n = tests[0].fullName.replace(` ${tests[0].name}`, '')

//     for (let t of tests) {
//         currentElement = t;
//         let glob = config.files().glob || "./test/**/*.js";
//         mochaTest.args = [glob, '--grep', `^${escapeStringRegexp(t.fullName)}$`]
//         mochaTest.args = addRequires(mochaTest.args);
//         mochaTest.args = addOptions(mochaTest.args);
//         mochaTest.cwd = applySubdirectory(vscode.workspace.rootPath);
//         mochaTest.env = config.env();
//         vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
//             console.log(`debug status:${data}`);
//         })
//         await done({ doneAmount: 1 })
//         console.log('done called');
//     }

// }
// const debugItem = async (element, functionOnTerminate) => {
//     results = [];

//   //  callFunctionOnTerminate = functionOnTerminate.bind(_provider);
//     currentElement = element;
//     let glob = config.files().glob || "./test/**/*.js";
//     mochaTest.args = [glob, '--grep', `^${escapeStringRegexp(element.__test.fullName)}$`]
//     mochaTest.args = addRequires(mochaTest.args);
//     mochaTest.args = addOptions(mochaTest.args);
//     mochaTest.cwd = applySubdirectory(vscode.workspace.rootPath);
//     mochaTest.env = config.env();
//     //  let reg = new RegExp(`^${element.item.test.fullName}$`)
//     vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
//         console.log(`debug status:${data}`);
//     })
//     await done({ doneAmount: 1 })
// }
// const debugInit = provider => _provider = provider;

// // vscode.commands.executeCommand('vscode.startDebug', launchConfig).then(data=>{
// //   console.log(data)
// // })

// vscode.debug.onDidStartDebugSession(session=> {
//   console.log(`debug session ${session}`);
//   session.customRequest('evaluate', { expression: 'process.pid' }).then(reply =>     {
//         console.log(reply)
//         // const terminals = vscode.debug.activeDebugConsole

//     });
// })

// vscode.debug.onDidTerminateDebugSession(ev => {
//     // const terminals = vscode.window.terminals;
//     // const terminals2 = vscode.debug.activeDebugConsole
//     // vscode.debug.
//     callDone()
//     // if (callFunctionOnTerminate === _provider.runTestWithoutElement) {
//    // callFunctionOnTerminate(currentElement);
//     //  }
// })

// // module.exports = {
// //     debugAll,
// //     debugItem,
// //     debugLevel,
// //     debugInit

// // };

module.exports = new debuggerProvider();
