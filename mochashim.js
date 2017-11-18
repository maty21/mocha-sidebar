'use strict';

const
  config = require('./config'),
  fork = require('./fork'),
  path = require('path'),
  Promise = require('bluebird'),
  vscode = require('vscode'),
  _runTestsInProcess = require('./inProcess/runtestInProcess'),
  _findTestsInProcess = require('./inProcess/findtestsInProccess');

const outputChannel = vscode.window.createOutputChannel('Mocha');

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

function stripWarnings(text) { // Remove node.js warnings, which would make JSON parsing fail
  // return text.replace(/\(node:\d+\) DeprecationWarning:\s[^\n]+/g, "");
  //outputChannel.appendLine(`stripWarnings entered`)
  let newText = text.replace(/\(node:\d+\)\s[^\n]+/g, "");

  //outputChannel.appendLine(`stripWarnings:${newText}`)
  return newText
}

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
    grep
  };
  return forkWorker('../worker/runtest.js', args, rootPath);
}

function forkFindTests(rootPath) {
  const args = {
    files: {
      glob: config.files().glob,
      ignore: config.files().ignore
    }
  };
  return forkWorker('../worker/findtests.js', args, rootPath);
}

function forkRunTestInProcessTemporary(testFiles, grep, rootPath) {
  const args = {
    files: testFiles,
    grep
  };
  return forkWorker('../inProcess/runtestTemporary.js', args, rootPath);
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
  vscode.window.showErrorMessage(`Failed to run Mocha due to ${err.message}`);
  outputChannel.appendLine(err.stack);
  reject(err);
}

function appendMessagesToOutput(messages) {
  if (messages) {
    for (let message of messages) {
      outputChannel.appendLine(`${message}`);
    }
  }
}

function handleProcessExit(stderrBuffers, code, reject, resolve) {
  const stderrText = Buffer.concat(stderrBuffers).toString();

  let resultJSON;

  try {
    resultJSON = stderrText && JSON.parse(stripWarnings(stderrText));
  } catch (ex) {
    code = 1;
  }

  if (code) {
    outputChannel.show();
    outputChannel.append(stderrText);
    console.error(stderrText);
    reject(new Error('unknown error'));
  } else {
    resolve(resultJSON);
  }
}

function runTests(testFiles, grep, messages) {
  // Allow the user to choose a different subfolder
  const rootPath = applySubdirectory(vscode.workspace.rootPath);
  logTestArg(testFiles, grep, rootPath);
  return forkRunTest(testFiles, grep, rootPath)
    .then(process => new Promise((resolve, reject) => {

      outputChannel.show();
      // outputChannel.clear();

      outputChannel.appendLine(`Running Mocha with Node.js at ${process.spawnfile}\n`);

      appendMessagesToOutput(messages);

      const stderrBuffers = [];

      process.stderr.on('data', data => {
        stderrBuffers.push(data);
      });

      process.stdout.on('data', data => {
        outputChannel.append(data.toString().replace(/\r/g, ''));
      });

      process
        .on('error', err => handleError(err, reject))
        .on('exit', code => {
          handleProcessExit(stderrBuffers, code, reject, resolve);
        });
    }));
}

function findTests(rootPath) {
  // Allow the user to choose a different subfolder
  rootPath = applySubdirectory(rootPath);

  return forkFindTests(rootPath)
    .then(process => new Promise((resolve, reject) => {

      outputChannel.appendLine(`Finding tests with Mocha on Node.js at ${process.spawnfile}\n`);

      const
        stdoutBuffers = [],
        stderrBuffers = [];

      process.stderr.on('data', data => {
        stderrBuffers.push(data);
      });

      process.stdout.on('data', data => {
        stdoutBuffers.push(data);
      });

      process
        .on('error', err => handleError(err, reject))
        .on('exit', code => {
          console.log(Buffer.concat(stdoutBuffers).toString());
          handleProcessExit(stderrBuffers, code, reject, resolve);
        });
    }));
}


async function findTestsProcess(rootPath) {
  // Allow the user to choose a different subfolder
  //vscode.window.showWarningMessage(`entering findTestsProcess in mochasim ${rootPath}`)

  rootPath = applySubdirectory(rootPath);
  // vscode.window.showWarningMessage(`passing applySubdirectory in mochasim ${rootPath}`)
  let options = {
    options: config.options(),
    files: {
      glob: config.files().glob,
      ignore: config.files().ignore
    },
    requires: config.requires(),
    rootPath
  }
  //  vscode.window.showWarningMessage(`passing options in mochasim ${JSON.stringify(options)}`)
  return _findTestsInProcess(options);

}



// async function runTestsInProcess(testFiles, grep, messages) {
//    let rootPath = applySubdirectory(vscode.workspace.rootPath);
//   let options ={
//     files: testFiles,
//     options: config.options(),
//     grep,
//     requires: config.requires(),
//     rootPath
//   }
//   return _runTestsInProcess(options);

// }




//Just a workaround for dirty fix 
function runTestsInProcess(testFiles, grep, messages) {
  // Allow the user to choose a different subfolder
  const rootPath = applySubdirectory(vscode.workspace.rootPath);

  return forkRunTestInProcess(testFiles, grep, rootPath)
    .then(process => new Promise((resolve, reject) => {

      outputChannel.show();
      outputChannel.clear();

      outputChannel.appendLine(`Running Mocha with Node.js at ${process.spawnfile}\n`);

      appendMessagesToOutput(messages);

      const stderrBuffers = [];

      process.stderr.on('data', data => {
        stderrBuffers.push(data);
      });

      process.stdout.on('data', data => {
        outputChannel.append(data.toString().replace(/\r/g, ''));
      });

      process
        .on('error', err => handleError(err, reject))
        .on('exit', code => {
          handleProcessExit(stderrBuffers, code, reject, resolve);
        });
    }));
}



module.exports.runTests = runTests;
module.exports.runTestsInProcess = runTestsInProcess;

module.exports.findTests = findTests;
module.exports.findTestsProcess = findTestsProcess;

module.exports.outputChannel = outputChannel;
