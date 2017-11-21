'use strict';

const ChildProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const trimArray = require('./utils').trimArray;
const vscode = require('vscode');
//const emptyPort = require('empty-port');
const config = require('./config');
const access = Promise.promisify(fs.access);
const debug = typeof v8debug === 'object' || /--debug|--inspect/.test(process.execArgv.join(' '));



function fork(jsPath, args, options) {
  // Make sure mocha is executed in the right folder
  options.cwd = path.dirname(options.env.NODE_PATH);
  options.stdio = ['pipe','pipe','pipe','ipc'];



  return nodeJSPath().then(
    execPath => new Promise((resolve, reject) => {
      // if (debug) {
      //   console.log('running in debug mode');
      //   //emptyPort({ startPort: 2000, maxPort: 60000 }, (err, port) => {
      //     resolve(ChildProcess.spawn(
      //       execPath,
      //       [`--inspect-brk=5859`, ...config.node_options().concat([jsPath]).concat(args)],
      //       options
      //     ))
      //   //})
      // }
      // else {
      resolve(ChildProcess.spawn(
        execPath,
        config.node_options().concat([jsPath]).concat(args),
        options
      ))
 //       }

    }),
    err => {
      if (err.code === 'ENOENT') {
        vscode.window.showErrorMessage('Cannot find Node.js installation from environment variable');
      } else {
        vscode.window.showErrorMessage(`Failed to find Node.js installation due to ${err.message}`);
      }

      throw err;
    }
  );
}

function nodeJSPath() {
  return new Promise((resolve, reject) => {
    const paths = process.env.PATH.split(path.delimiter);

    const pathExts = process.platform === 'win32' ? process.env.PATHEXT.split(path.delimiter) : [''];
    const searchPaths = paths.reduce((a, p) => (
      a.concat(pathExts.map(ext => path.resolve(p, 'node' + ext)))
    ), []);

    Promise.all(searchPaths.map(p => access(p, fs.X_OK).then(() => p, err => false)))
      .then(
      results => {
        results = trimArray(results);

        if (results.length) {
          resolve(results[0]);
        } else {
          const err = new Error('cannot find nodejs');

          err.code = 'ENOENT';

          reject(err);
        }
      },
      err => reject(err)
      );
  });
}

module.exports = fork;
module.exports.nodeJSPath = nodeJSPath;
