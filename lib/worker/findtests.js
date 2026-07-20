'use strict';

const
  Glob = require('glob').Glob,

  path = require('path'),
  fs = require('fs'),
  Promise = require('bluebird'),
  trimArray = require('../utils').trimArray;

const { TYPES, message } = require('./process-communication')

let msg = message(process);
const args = JSON.parse(process.argv[process.argv.length - 1]);
const Mocha = require(args.mochaPath);
module.paths.push(args.rootPath, path.join(args.rootPath, 'node_modules'));
for (let file of args.requires) {
  let abs = fs.existsSync(file) || fs.existsSync(file + '.js');
  if (abs) {
    file = path.resolve(file);
  }
  try {
    require(file);
  } catch (err) {
    console.warn(`[mocha-sidebar] Warning: could not require '${file}': ${err.message}. Skipping.`);
  }
}
createMocha(args.rootPath, args.options, args.files.glob, args.files.ignore)
  .then(mocha => crawlTests(mocha.suite))
  .then(tests => {
    setTimeout(() => {
      console.error('timeout sending to parent process. Exiting');
      process.exit(-1);
    }, 5000)

    msg.emit(TYPES.result, tests, error => {
      if (error) {
        console.error('error sending to parent process.', error);
        process.exit(-1);
      }
      console.log('data send to parent. Exiting.')
      setTimeout(() => {
        process.exit(0);
      }, 10);
    })



    // process.send(tests,(error)=>{
    //   if (error){
    //     console.error('error sending to parent process.',error);
    //     process.exit(-1);
    //   }
    //   console.log('data send to parent. Exiting.')
    //   process.exit(0);
    // })
  })
  .catch(err => {
    console.error('Error:', err.stack);
    msg.emit(TYPES.error, JSON.stringify(err, Object.getOwnPropertyNames(err)), error => {
      if (error) {
        console.error('error sending to parent process.', error);
        process.exit(-1);
      }
      console.log('data send to parent. Exiting.')
    })

    process.exit(-1);
  });

function createMocha(rootPath, options, glob, ignore) {
  return new Promise((resolve, reject) => {

    // Normalize ignore to array — config may pass comma-separated string
    let ignoreArray;
    if (Array.isArray(ignore)) {
      ignoreArray = ignore;
    } else if (typeof ignore === 'string' && ignore.length > 0) {
      ignoreArray = ignore.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      ignoreArray = [];
    }

    new Glob(glob, { cwd: rootPath, ignore: ignoreArray }, (err, files) => {
      if (err) { return reject(err); }

      const mocha = new Mocha(options);
      files.forEach(file => mocha.addFile(path.resolve(rootPath, file)));
      try {
        mocha.loadFiles();
      } catch (ex) {
        // loadFiles may throw on files with broken imports (e.g. missing dependencies)
        // Log warning but continue — mocha will report individual file errors at run time
        console.warn(`[mocha-sidebar] Warning: some files could not be loaded: ${ex.message}`);
      }
      resolve(mocha);
    });
  });
}

function crawlTests(suite) {
  let suites = [{ suite, path: [suite.fullTitle()] }];
  let tests = [];
  while (suites.length) {
    const
      entry = suites.shift(),
      suite = entry.suite;

    tests = tests.concat(
      (suite.tests || []).map(test => {
        const name = test.title;

        return {
          name,
          //fullName: trimArray(entry.path).concat([ name ]).join(' '),
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
