'use strict';

const
  Glob = require('glob').Glob,
  Mocha = require('mocha'),
  path = require('path'),
  Promise = require('bluebird'),
  vscode = require('vscode'),
  trimArray = require('../utils').trimArray;

//const   args = JSON.parse(process.argv[process.argv.length - 1]);


function findTests(params) {
  for (let file of params.requires)
 
    require(requirePath);

  return createMocha(params.rootPath, params.options, params.files.glob, params.files.ignore)
    .then(mocha => crawlTests(mocha.suite))
    .then(tests => tests)
    .catch(err => {
      console.error(err.stack);

      //  process.exit(-1);
    });
}


function createMocha(rootPath = process.cwd(), options, glob, ignore) {

  return new Promise((resolve, reject) => {
    new Glob(glob, { cwd: rootPath, ignore }, (err, files) => {
      if (err) { return reject(`createMocha wow ${err}`); }

      try {
        const mocha = new Mocha(options);
        files.forEach(file => mocha.addFile(path.resolve(rootPath, file)));
        mocha.loadFiles();
        resolve(mocha);
      } catch (ex) {

        reject(ex);
      }
    });
  });
}

function crawlTests(suite) {
  let
    suites = [{ suite, path: [suite.fullTitle()] }],
    tests = [];

  while (suites.length) {
    const
      entry = suites.shift(),
      suite = entry.suite;

    tests = tests.concat(
      (suite.tests || []).map(test => {
        const name = test.title;

        return {
          name,
          fullName: entry.path[entry.path.length - 1].concat(' ').concat([name]),
          suitePath: entry.path,
          file: test.file
        };
      })
    );

    suites = suites.concat(
      (suite.suites || []).map(suite => {
        return {
          suite,
          path: entry.path.concat(suite.fullTitle())
        };
      })
    );
  }

  return tests;
}


module.exports = findTests;