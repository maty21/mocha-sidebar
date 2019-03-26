'use strict';
const config = require('./config');
const fork = require('./fork');
const path = require('path');
const Promise = require('bluebird');
const vscode = require('vscode');
const _runTestsInProcess = require('./inProcess/runtestInProcess');
const _findTestsInProcess = require('./inProcess/findtestsInProccess');
const verboseLog = require('./provider-extensions/constLog');
const outputChannel = vscode.window.createOutputChannel('sideBar-Mocha');
const coverage = require('./lib/coverage/code-coverage');
const {
  message,
  TYPES
} = require('./worker/process-communication');
// will notify once on error 
let IsErrorShown = false;
const resolve = require('path').resolve;

const envWithNodePath = (rootPath) => {
  return Object.assign({}, process.env, {
    NODE_PATH: `${rootPath}${path.sep}node_modules`
  }, config.env());
}

function mochaPath(rootPath) {
  const mochaPath = resolve(rootPath + "/" + config.mochaPath());
  return mochaPath || config.mochaPath();
}

const applySubdirectory = (rootPath) => {
  const subdirectory = config.subdirectory()

  if (subdirectory)
    rootPath = path.resolve(rootPath, subdirectory);

  return rootPath;
}


const logTestArg = (testFiles, grep, rootPath) => {
  console.log(`test arg: ${JSON.stringify({
    files: testFiles,
    options: config.options(),
    grep,
    requires: config.requires(),
    rootPath
  })}`);
}

const forkRunTest = (testFiles, grep, rootPath) => {
  const args = {
    files: testFiles,
    grep,
    mochaPath: mochaPath(rootPath)
  };
  if (config.logVerbose()) {
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

const forkFindTests = (rootPath) => {
  const args = {
    files: {
      glob: config.files().glob,
      ignore: config.files().ignore
    },
    mochaPath: mochaPath(rootPath)
  };

  if (config.logVerbose()) {
    findingTestLogs(rootPath, args);
  }
  return forkWorker('../worker/findtests.js', args, rootPath);
}

const findingTestLogs = (rootPath, args) => {
  outputChannel.clear();
  outputChannel.appendLine(`____________________________________________________________________________`);
  outputChannel.appendLine(`trying to searching for tests using these settings: `);
  outputChannel.appendLine(`
  find tests with these args:
    options: ${JSON.stringify(config.options())},
    rootpath: ${JSON.stringify(rootPath)}
    mochaPath: ${JSON.stringify(args.mochaPath)}
    test files location: ${config.files().glob}
    files to ignore: ${config.files().ignore}
    environmets: ${ JSON.stringify(config.env())}
    requires: ${JSON.stringify(config.requires())}
  `);
  outputChannel.appendLine(`if you find anything wrong please change those default settings`)
  outputChannel.appendLine(`____________________________________________________________________________`);
  // vscode.window.showErrorMessage(`Failed to run Mocha due to`,'learnMorePanel').then(val=>{
  //   vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://go.microsoft.com/fwlink/?linkid=864631'));
  // });
}

const forkWorker = (workerPath, argsObject, rootPath) => {
  const jsPath = path.resolve(module.filename, workerPath);
  argsObject.options = config.options();
  argsObject.requires = config.requires();
  argsObject.rootPath = rootPath;
  const argsString = JSON.stringify(argsObject);
  const options = { env: envWithNodePath(rootPath) };
  return fork(jsPath, [argsString], options);
}

const handleError = (err, reject) => {
  const qa = 'Q/A';
  const gitter = 'Gitter';
  //const showErrorPopup = config.showErrorPopup();
  outputChannel.appendLine(err.stack);


  if (!IsErrorShown) {
    IsErrorShown = true;
    vscode.window.showErrorMessage(`Failed to run Mocha due to error message:               
    "   ${err.message}  " 
  error trace can be found in the ouput channel .
    for more help:`, qa, gitter).then(val => {
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
    outputChannel.show();
    reject(err);
  }
}

const appendMessagesToOutput = (messages) => {
  if (messages) {
    for (let message of messages) {
      outputChannel.appendLine(`${message}`);
    }
  }
}

const createError = (errorText) => {
  return new Error(`Mocha sidebar: ${errorText}. See Mocha output for more info.`);
}


const handleProcessMessages = async (process) => {
  return new Promise((resolve, reject) => {
    let msg = message(process);
    let processMessage = null;
    msg.on(TYPES.result, data => {
      processMessage = data;
      console.log(data);
    })
    process.stdout.on('data', data => {
      if (config.logVerbose()) {
        outputChannel.appendLine(data.toString())

      }
    });
    msg.on('error', err => {
      let error = JSON.parse(err);
      handleError(error, reject)
    })
    msg.on('exit', async code => {
   //   if (processMessage) {
        if (code!=0) {
          reject(createError('Process exited with code ' + code));
          return;
        }
        else {
          resolve(processMessage);
        }
    //  }
    });
  });
}




const runTests = async (testFiles, grep, messages) => {
  // Allow the user to choose a different subfolder
  const rootPath = applySubdirectory(vscode.workspace.rootPath);
  logTestArg(testFiles, grep, rootPath);
  if (config.coverage().enable && config.coverage().runAfterTest) {
    coverage.runViaRequest();
  }
  // outputChannel.clear();

  //outputChannel.appendLine(`Running tests in "${rootPath}"\n`);

  appendMessagesToOutput(messages);
  let process = await forkRunTest(testFiles, grep, rootPath)
  let data = await handleProcessMessages(process)
  return data;
}

const findTests = async (rootPath) => {
  // Allow the user to choose a different subfolder
  //outputChannel.appendLine(`Finding tests in "${rootPath}"\n`);
  rootPath = applySubdirectory(rootPath);
  //outputChannel.appendLine(`Finding tests in "${rootPath}"\n`);
  let process = await forkFindTests(rootPath)

  let data = await handleProcessMessages(process)
  return data;

}


module.exports = {
  runTests,
  findTests,
  outputChannel,
} 
