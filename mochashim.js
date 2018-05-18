'use strict';

const
  config = require('./config'),
  fork = require('./fork'),
  path = require('path'),
  Promise = require('bluebird'),
  vscode = require('vscode'),
  _runTestsInProcess = require('./inProcess/runtestInProcess'),
  _findTestsInProcess = require('./inProcess/findtestsInProccess');

const verboseLog = require('./provider-extensions/constLog');
const outputChannel = vscode.window.createOutputChannel('Mocha');

const {message,TYPES} = require('./worker/process-communication');

function envWithNodePath(rootPath) {
  return Object.assign({}, process.env, {
    NODE_PATH: `${rootPath}${path.sep}node_modules`
  }, config.env());
}

function applySubdirectory(rootPath) {
  const subdirectory = config.subdirectory()

  if (subdirectory)
    rootPath = path.resolve(rootPath, subdirectory);

  return rootPath;
}

// function stripWarnings(text) { // Remove node.js warnings, which would make JSON parsing fail

//   let newText = text.replace(/\(node:\d+\)\s[^\n]+/g, "");

//   return newText
// }

function logTestArg(testFiles, grep, rootPath) {
  console.log(`test arg: ${JSON.stringify({
    files: testFiles,
    options: config.options(),
    grep,
    requires: config.requires(),
    rootPath
  })}`);
}

function forkRunTest(testFiles, grep, rootPath) {
  const args = {
    files: testFiles,
    grep,
    mochaPath: config.mochaPath()

  };
  if(config.logVerbose()){
    outputChannel.appendLine(`
test runs with those args:

  files: ${JSON.stringify(testFiles)},
  options: ${JSON.stringify(config.options())},
  grep:${JSON.stringify(grep)},
  requires: ${JSON.stringify(config.requires())},
  rootpath: ${JSON.stringify(rootPath)}
  `)

  }
  //outputChannel.appendLine(`mocha path : ${config.mochaPath()}`);
  return forkWorker('../worker/runtest.js', args, rootPath);
}

function forkFindTests(rootPath) {
  const args = {
    files: {
      glob: config.files().glob,
      ignore: config.files().ignore
    },
    mochaPath: config.mochaPath()
  };
  findingTestLogs();
  if(config.logVerbose()){
    // outputChannel.show();

  }
  return forkWorker('../worker/findtests.js', args, rootPath);

}

function findingTestLogs(){
  outputChannel.clear();
  outputChannel.appendLine(`____________________________________________________________________________`);
  outputChannel.appendLine(`trying to searching for tests using these settings: `);
  outputChannel.appendLine(`
    mocha path: ${config.mochaPath()}
    test files location: ${config.files().glob}
    files to ignore: ${config.files().ignore}
    environmets: ${ JSON.stringify(config.env())}
    requires: ${JSON.stringify(config.requires())}
    options:  ${JSON.stringify(config.options())}

`);
outputChannel.appendLine(`if you find anything wrong please change those default settings`)
outputChannel.appendLine(`____________________________________________________________________________`);
// vscode.window.showErrorMessage(`Failed to run Mocha due to`,'learnMorePanel').then(val=>{
//   vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://go.microsoft.com/fwlink/?linkid=864631'));
// });
}

function forkWorker(workerPath, argsObject, rootPath) {
  const jsPath = path.resolve(module.filename, workerPath);
  argsObject.options = config.options();
  argsObject.requires = config.requires();
  argsObject.rootPath = rootPath;
  const argsString = JSON.stringify(argsObject);
  const options = { env: envWithNodePath(rootPath) };
  return fork(jsPath, [argsString], options);
}

function handleError(err, reject) {
  const qa = 'Q/A';
  const gitter = 'Gitter';
  if (config.showErrorPopup) {
    vscode.window.showErrorMessage(`Failed to run Mocha due to error message:( ${err.message}) .
  error trace can be found in the ouput channel .
    for more help:`,qa,gitter).then(val=>{
    switch (val) {
      case qa:
       vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/maty21/mocha-sidebar#qa'));
        break;
        case gitter:
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://gitter.im/mocha-sidebar/Questions'));
        break;
      // default:
      // vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://github.com/maty21/mocha-sidebar'))
    }
    });
  }
  outputChannel.appendLine(err.stack);
  outputChannel.show();
  reject(err);
}

function appendMessagesToOutput(messages) {
  if (messages) {
    for (let message of messages) {
      outputChannel.appendLine(`${message}`);
    }
  }
}

function createError(errorText) {
  return new Error(`Mocha sidebar: ${errorText}. See Mocha output for more info.`);
}


const handleProcessMessages = async (process)=>{
return new Promise((resolve, reject) => {
  let msg = message(process);
  let processMessage = null;
    msg.on(TYPES.result,data=>{
      processMessage = data;
      console.log(data);
    })
    process.stdout.on('data', data => {
        if(config.logVerbose()){
          outputChannel.appendLine(data.toString())

        }
     });
    msg.on('error', err => {
     let error = JSON.parse(err);
      handleError(error, reject)})
    msg.on('exit', async code => {
        if(processMessage){
          if (code) {
            reject(createError('Process exited with code ' + code));
            return;
          }
            resolve(processMessage);
        }
        });
  });
}




async function runTests(testFiles, grep, messages) {
  // Allow the user to choose a different subfolder
  const rootPath = applySubdirectory(vscode.workspace.rootPath);
  logTestArg(testFiles, grep, rootPath);

  // outputChannel.clear();

  //outputChannel.appendLine(`Running tests in "${rootPath}"\n`);

  appendMessagesToOutput(messages);
  let process = await  forkRunTest(testFiles, grep, rootPath)
  let data = await handleProcessMessages(process)
  return data;
}

async function  findTests(rootPath) {
  // Allow the user to choose a different subfolder
  //outputChannel.appendLine(`Finding tests in "${rootPath}"\n`);
  rootPath = applySubdirectory(rootPath);
  //outputChannel.appendLine(`Finding tests in "${rootPath}"\n`);
  let process =  await forkFindTests(rootPath)

  let data = await handleProcessMessages(process)
  return data;

}


module.exports.runTests = runTests;

module.exports.findTests = findTests;

module.exports.outputChannel = outputChannel;
