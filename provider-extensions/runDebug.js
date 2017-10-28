const vscode = require('vscode');
const { callDone, done } = require('await-done');
const path = require('path');
let mochaPath = require.resolve('mocha');
mochaPath = path.dirname(mochaPath);
mochaPath = path.join(mochaPath,'bin','_mocha');
let mochaTest = {
    "name": "Mocha Tests",
    "type": "node",
    "request": "launch",
    "stopOnEntry": false,
    // "program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
    "program": mochaPath,
    "cwd": "${workspaceRoot}",
    //    "args": ["./test/**/*.js", '--grep', '^green 4 inner green 4$'],
    // "args": ["./test/**/*.js"],
    "runtimeExecutable": null,
    //"envFile": "${workspaceRoot}/.env"
}


// let launchConfig = {
//   "name": "FakeNode",
//   "type": "node2",
//   "request": "launch",
//   "program": "${workspaceRoot}/test/environment",
//   "cwd": "${workspaceRoot}",
//   "stopOnEntry": true, 
//   "protocol": "inspector"
// };

//   let attach = {
//     "name": "Attach child",
//     "type": "node",
//     "request": "attach",
//     "port": 5859,
//     "address": "localhost",
//     "restart": false,
//     "sourceMaps": false,
//     "outFiles": [],
//     "localRoot": "${workspaceRoot}",
//     "remoteRoot": null
// }
//   let launchConfig = {
//     "name": "FakeNode",
//     "type": "node2",
//     "request": "launch",
//     "program": "c:/dev/mocha-sidebar/worker/runtest",
//     "cwd": "${workspaceRoot}",
//     "stopOnEntry": true,
//     "protocol": "inspector",
//     "args": ["./test/**/*.js", '--grep', '^green 4 inner green 4$'],
//   };

let currentElement = null;
let callFunctionOnTerminate = null;
let _provider = null;
let results = [];
const debugAll = (element, functionOnTerminate) => {
    results = [];
    currentElement = element;
    callFunctionOnTerminate = functionOnTerminate.bind(_provider);
    mochaTest.args = ["./test/**/*.js"]
    vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
        console.log(`debug status:${data}`);
    })
}
const debugLevel = async (element, functionOnTerminate) => {
    // results = [];
    _provider.clearResults();
    callFunctionOnTerminate = functionOnTerminate.bind(_provider);
    let tests = [];
    _provider._findObjectByLabel(element, 'test', tests);
    // let n = tests[0].fullName.replace(` ${tests[0].name}`, '')

    for (let t of tests) {
        currentElement = t;
        mochaTest.args = ["./test/**/*.js", '--grep', `^${t.fullName}$`]
        vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
            console.log(`debug status:${data}`);
        })
        await done({ doneAmount: 1 })
        console.log('done called');
    }

}
const debugItem = (element, functionOnTerminate) => {
    results = [];

    callFunctionOnTerminate = functionOnTerminate.bind(_provider);
    currentElement = element;
    mochaTest.args = ["./test/**/*.js", '--grep', `^${element.item.test.fullName}$`]
    //  let reg = new RegExp(`^${element.item.test.fullName}$`)
    vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], mochaTest).then(data => {
        console.log(`debug status:${data}`);
    })
}
const debugInit = provider => _provider = provider;


// vscode.commands.executeCommand('vscode.startDebug', launchConfig).then(data=>{
//   console.log(data)
// })

// vscode.debug.onDidStartDebugSession(data => {
//   console.log('wow');
// })



vscode.debug.onDidTerminateDebugSession(ev => {
    callDone()
    // if (callFunctionOnTerminate === _provider.runTestWithoutElement) {
    callFunctionOnTerminate(currentElement);
    //  }
})

module.exports = {
    debugAll,
    debugItem,
    debugLevel,
    debugInit

};