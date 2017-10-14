'use strict';

const
  config = require('./config'),
  fork = require('./fork'),
  path = require('path'),
  Promise = require('bluebird'),
  vscode = require('vscode'),
  _runTestsInProcess = require('./inProcess/runtestInProcess'),
  _findTestsInProcess = require('./inProcess/findtestsInProccess');

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
  return text.replace(/\(node:\d+\) DeprecationWarning:\s[^\n]+/g, "");
}

function runTests(testFiles, grep, messages) {
  // Allow the user to choose a different subfolder
  const rootPath = applySubdirectory(vscode.workspace.rootPath);

  return fork(
    path.resolve(module.filename, '../worker/runtest.js'),
    [
      JSON.stringify({
        files: testFiles,
        options: config.options(),
        grep,
        requires: config.requires(),
        rootPath
      })
    ],
    {
      env: envWithNodePath(rootPath)
    }
  ).then(process => new Promise((resolve, reject) => {
    const outputChannel = vscode.window.createOutputChannel('Mocha');

    outputChannel.show();
    outputChannel.clear();

    outputChannel.appendLine(`Running Mocha with Node.js at ${process.spawnfile}\n`);

    if (messages) {
      for (let message of messages) {
        outputChannel.append(`${message}\n`);
      }
    }

    const stderrBuffers = [];

    process.stderr.on('data', data => {
      stderrBuffers.push(data);
    });

    process.stdout.on('data', data => {
      outputChannel.append(data.toString().replace(/\r/g, ''));
    });

    process
      .on('error', err => {
        vscode.window.showErrorMessage(`Failed to run Mocha due to ${err.message}`);
        outputChannel.append(err.stack);
        reject(err);
      })
      .on('exit', code => {
        const stderrText = Buffer.concat(stderrBuffers).toString();
        let resultJSON;

        try {
          resultJSON = stderrText && JSON.parse(stripWarnings(stderrText));
        } catch (ex) {
          code = 1;
        }

        if (code) {
          outputChannel.append(stderrText);
          console.error(stderrText);

          reject(new Error('unknown error'));
        } else {
          resolve(resultJSON);
        }
      });
  }));
}

function findTests(rootPath) {
  // Allow the user to choose a different subfolder
  rootPath = applySubdirectory(rootPath);

  return fork(
    path.resolve(module.filename, '../worker/findtests.js'),
    [
      JSON.stringify({
        options: config.options(),
        files: {
          glob: config.files().glob,
          ignore: config.files().ignore
        },
        requires: config.requires(),
        rootPath
      })
    ],
    {
      env: envWithNodePath(rootPath)
    }
  ).then(process => new Promise((resolve, reject) => {
    const
      stdoutBuffers = [],
      resultJSONBuffers = [];

    process.stderr.on('data', data => {
      resultJSONBuffers.push(data);
    });

    process.stdout.on('data', data => {
      stdoutBuffers.push(data);
    });

    process
      .on('error', err => {
        vscode.window.showErrorMessage(`Failed to run Mocha due to ${err.message}`);
        reject(err);
      })
      .on('exit', code => {
        console.log(Buffer.concat(stdoutBuffers).toString());

        const stderrText = Buffer.concat(resultJSONBuffers).toString();
        let resultJSON;

        try {
          resultJSON = stderrText && JSON.parse(stripWarnings(stderrText));
        } catch (ex) {
          code = 1;
        }

        if (code) {
          const outputChannel = vscode.window.createOutputChannel('Mocha');

          outputChannel.show();
          outputChannel.append(stderrText);
          console.error(stderrText);

          reject(new Error('unknown error'));
        } else {
          resolve(resultJSON);
        }
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

  return fork(
    path.resolve(module.filename, '../inProcess/runtestTemporary.js'),
    [
      JSON.stringify({
        files: testFiles,
        options: config.options(),
        grep,
        requires: config.requires(),
        rootPath
      })
    ],
    {
      env: envWithNodePath(rootPath)
    }
  ).then(process => new Promise((resolve, reject) => {
    const outputChannel = vscode.window.createOutputChannel('Mocha');

    outputChannel.show();
    outputChannel.clear();

    outputChannel.appendLine(`Running Mocha with Node.js at ${process.spawnfile}\n`);

    if (messages) {
      for (let message of messages) {
        outputChannel.append(`${message}\n`);
      }
    }

    const stderrBuffers = [];

    process.stderr.on('data', data => {
      stderrBuffers.push(data);
    });

    process.stdout.on('data', data => {
      outputChannel.append(data.toString().replace(/\r/g, ''));
    });

    process
      .on('error', err => {
        vscode.window.showErrorMessage(`Failed to run Mocha due to ${err.message}`);
        outputChannel.append(err.stack);
        reject(err);
      })
      .on('exit', code => {
        const stderrText = Buffer.concat(stderrBuffers).toString();
        let resultJSON;

        try {
          resultJSON = stderrText && JSON.parse(stripWarnings(stderrText));
        } catch (ex) {
          code = 1;
        }

        if (code) {
          outputChannel.append(stderrText);
          console.error(stderrText);

          reject(new Error('unknown error'));
        } else {
          resolve(resultJSON);
        }
      });
  }));
}



module.exports.runTests = runTests;
module.exports.runTestsInProcess = runTestsInProcess;

module.exports.findTests = findTests;
module.exports.findTestsProcess = findTestsProcess;
