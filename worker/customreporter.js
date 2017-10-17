'use strict';

const Mocha = require('mocha');
const reporters = Mocha.reporters;
const { Base, Spec } = reporters;
const { trimArray } = require('../utils');
const utils = Mocha.utils;
let counter = 0;

// class Reporter extends Base {
//   constructor(runner) {
//     super();
//     this._spec = new Spec(runner);
//     this.passed = [];
//     this.suitePath = [];
//     this.failed = [];
//     this._runner = runner;

//     this._runner.on('suite', suite => {
//       this.suitePath.push(suite.fullTitle());
//       // calcSuite(suite)
//       console.log(`####test counter: ${counter}`);
//     })
//     this._runner.on('suite end', () => {
//       suitePath.pop();
//     })
//     this._runner.on('pass', test => {
//       this.passed.push(this.toJS(test));
//       // checkIfAllTestCompleted(passed, failed, counter);
//     })
//     this._runner.on('fail', test => {
//       this.failed.push(this.toJS(test));
//       //checkIfAllTestCompleted(passed, failed, counter);
//     })
//     this._runner.on('end', () => {
//       console.error(JSON.stringify({ passed: this.passed, failed: this.failed }, null, 2));
//       console.log('###end');
//     });
//   }

//   toJS(test) {
//     const name = test.title;

//     return {
//       name,
//       fullName: this.suitePath[this.suitePath.length - 1].concat(' ').concat([name]),
//       suitePath: this.suitePath.slice(),
//       file: test.file
//     };
//   }

//   checkIfAllTestCompleted(passed, failed, counter) {
//     counter = counter - 1;
//     if (counter == 0) {
//       console.error(JSON.stringify({ passed, failed }, null, 2));
//     }

//   }
//   calcSuite(suite) {
//     console.log('enter to calcSuite');
//     console.log(`counter:${counter} tests:${suite.tests.length} suites:${suite.suites.length}`);

//     counter = counter + suite.tests.length;
//     // console.log(suite.suites.length)
//     console.log(`counter1:${counter} tests:${suite.tests.length} suites:${suite.suites.length}`);
//     if (suite.suites.length == 0) {
//       console.log(`suites.inner tests:${suite.tests.length} `)
//       return;
//     }
//     suite.suites.forEach(s => {
//       console.log(`suites:${s.suites.length}`)
//       console.log(`tests:${s.tests.length} `)
//       console.log(`a before:${counter}`)
//       calcSuite(s)
//       //  counter = counter +  s.tests.length
//       console.log(`a after:${counter}`)
//     })

//   }

// }

const failed = [];
const passed = [];
// const getPassedFailed = (_passed, _failed) => {
//   passed = _passed;
//   failed = _failed;
// }

function Reporter(runner) {
  this._spec = new Spec(runner);

  const suitePath = [];

  runner
    .on('suite', suite => {
      suitePath.push(suite.fullTitle());
      //   calcSuite(suite)
   //   console.log(`#### title:${suite.fullTitle()} length start:${suitePath.length} `);
    })
    .on('suite end', () => {
      const poped = suitePath.pop();

   //   console.log(`#### title:${poped} length end:${suitePath.length} `);
      if (suitePath.length == 0) {
        console.error(JSON.stringify({ passed, failed }, null, 2));
      }
    })
    .on('pass', test => {
      passed.push(toJS(suitePath, test));
      //   checkIfAllTestCompleted(passed, failed, counter);
    })
    .on('fail', test => {
      failed.push(toJS(suitePath, test));
      //   checkIfAllTestCompleted(passed, failed, counter);
    })
    .on('end', () => {
      //console.error(JSON.stringify({ passed, failed }, null, 2));
      console.log('###end');
    });
}

function toJS(suitePath, test) {
  const name = test.title;

  return {
    name,
    fullName: suitePath[suitePath.length - 1].concat(' ').concat([name]),
    suitePath: suitePath.slice(),
    file: test.file
  };
}

// const checkIfAllTestCompleted = (passed, failed, counter) => {
//   counter = counter - 1;
//   if (counter == 0) {
//     console.error(JSON.stringify({ passed, failed }, null, 2));
//   }

// }
// const calcSuite = (suite) => {
//   console.log('enter to calcSuite');
//   console.log(`counter:${counter} tests:${suite.tests.length} suites:${suite.suites.length}`);

//   counter = counter + suite.tests.length;
//   // console.log(suite.suites.length)
//   console.log(`counter1:${counter} tests:${suite.tests.length} suites:${suite.suites.length}`);
//   if (suite.suites.length == 0) {
//     console.log(`suites.inner tests:${suite.tests.length} `)
//     return;
//   }
//   suite.suites.forEach(s => {
//     console.log(`suites:${s.suites.length}`)
//     console.log(`tests:${s.tests.length} `)
//     console.log(`a before:${counter}`)
//     calcSuite(s)
//     //  counter = counter +  s.tests.length
//     console.log(`a after:${counter}`)
//   })

//}


utils.inherits(Reporter, Base);

module.exports = Reporter;
