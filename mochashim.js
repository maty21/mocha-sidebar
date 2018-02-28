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

function stripWarnings(text) { // Remove node.js warnings, which would make JSON parsing fail

  let newText = text.replace(/\(node:\d+\)\s[^\n]+/g, "");

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
      console.log(data.toString());
    });
    msg.on('error', err => {
     // let error = JSON.parse(err);
      handleError(err, reject)})
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
  outputChannel.show();
  // outputChannel.clear();

  outputChannel.appendLine(`Running tests in "${rootPath}"\n`);

  appendMessagesToOutput(messages);
  let process = await  forkRunTest(testFiles, grep, rootPath)
  let data = await handleProcessMessages(process)
  return data;
}

async function  findTests(rootPath) {
  // Allow the user to choose a different subfolder
  outputChannel.appendLine(`Finding tests in "${rootPath}"\n`);
  rootPath = applySubdirectory(rootPath);
  outputChannel.appendLine(`Finding tests in "${rootPath}"\n`);
  let process =  await forkFindTests(rootPath)

  let data = await handleProcessMessages(process)
  return data;


    // .then(process => new Promise((resolve, reject) => {
    //   let msg = message(process);

    //   // const         stderrBuffers = [];
    //   let processMessage;

    //   // process.stderr.on('data', data => {
    //   //   console.error(data.toString());
    //   //   stderrBuffers.push(data);
    //   // });

    //   msg.on(TYPES.result,data=>{
    //     processMessage = data;
    //     console.log(data);
    //   })
    //   // process.on('message', data => {
    //   //   processMessage = data;
    //   // })
    //   process.stdout.on('data', data => {
    //     console.log(data.toString());
    //   });

    //   msg.on('error', err => {
    //     let error = JSON.parse(err);
    //     handleError(error, reject)})
    //   msg.on('exit', code => {
    //     if(processMessage){
    //       handleProcessExit(processMessage, code, reject, resolve);
    //     }
    //     });
    // }));
}


// async function findTestsProcess(rootPath) {
//   // Allow the user to choose a different subfolder
//   //vscode.window.showWarningMessage(`entering findTestsProcess in mochasim ${rootPath}`)

//   rootPath = applySubdirectory(rootPath);
//   // vscode.window.showWarningMessage(`passing applySubdirectory in mochasim ${rootPath}`)
//   let options = {
//     options: config.options(),
//     files: {
//       glob: config.files().glob,
//       ignore: config.files().ignore
//     },
//     requires: config.requires(),
//     rootPath
//   }
//   //  vscode.window.showWarningMessage(`passing options in mochasim ${JSON.stringify(options)}`)
//   return _findTestsInProcess(options);

// }



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








module.exports.runTests = runTests;

module.exports.findTests = findTests;

module.exports.outputChannel = outputChannel;
