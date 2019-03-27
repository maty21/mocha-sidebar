'use strict';

const escapeRegExp = require('escape-regexp');
const fs = require('fs');

const path = require('path');
const Promise = require('bluebird');

const args = JSON.parse(process.argv[process.argv.length - 1]);
const options = args.options;
const Mocha = require(args.mochaPath);
const CustomReporter = require('./customreporter');
 let reporter = CustomReporter.init(args.mochaPath);
module.paths.push(args.rootPath, path.join(args.rootPath, 'node_modules'));
for (let file of args.requires) {
  // let pt = `${args.rootPath}/node_modules/${file}`;
  let abs = fs.existsSync(file) || fs.existsSync(file + '.js');
  if (abs) {
    file = path.resolve(file);
  }
  require(file);
}
if (Object.keys(options || {}).length) {
  console.log(`Applying Mocha options:\n${indent(JSON.stringify(options, null, 2))}`);
} else {
  console.log(`No Mocha options are configured. You can set it under File > Preferences > Workspace Settings.`);
}

// const requireOptions = options.require || [];

// if (requireOptions) {
//   if (typeof requireOptions === 'string') {
//     global[requireOptions] = require(requireOptions);
//   } else {
//     requireOptions.forEach(name => {
//       global[name] = require(name);
//     });
//   }
// }

const mocha = new Mocha(options);

console.log();
console.log('Test file(s):');

args.files.forEach(file => {
  console.log(`  ${file}`);
  mocha.addFile(file);
});

const grep = args.grep;

if (grep) {
  console.log();
  console.log('Grep pattern:');
  console.log('  ' + grep);

  mocha.grep(new RegExp(grep, 'i'));
}


mocha.reporter(reporter);

mocha.run((failures) => {
  console.log('------------------------------------');
  console.log(`finish failure amount:${failures}`);
  console.log('------------------------------------');
  process.exit(0);
});

function indent(lines) {
  return lines.split('\n').map(line => `  ${line}`).join('\n');
}

function initReporters() {
}