// 'use strict';
const assert = require('assert');
const expect = require('chai').expect;
// it('should inherit environment variables', function () {
// });

// describe('test___', () => {
//   it('should inherit environment variables 2', function () {
//    // assert.fail();
//    expect(1).to.equal(1);
//     expect(1).to.equal(1);
//   });
  
// });

// it('test2', function () {
//   assert.fail();
// });

// //asdad

// describe('When environment variable is set in settings', function () {
//   it('should run with them', function () {
//     expect(1).to.equal(1);
//     expect(1).to.equal(1);
//     expect(process.env.HELLO_WORLD).to.equal('Hello, World!');
//   });
// });



// describe('green 3', function () {
//   it('inner green 3 test', function () {
//     assert.fail(process.env.HOME || process.env.PATHEXT);
//   });
// });

let isFirst = true;
describe('green 4', function () {
  // beforeEach(() => {
  //   if (isFirst) {
  //     // this assertion fails, but mocha-sidebar test entry does not turn red
  //     isFirst = false;
  //     assert.equal(1, 2);
  //   }
  // });
  it('inner green 4 test', function (done) {
    setTimeout(() => {
      expect(1).to.equal(1);
      //assert(process.env.HOME || process.env.PATHEXT);
      console.log(`waiting`);
        done();
    }, 5000);
  });

  it('inner green second 4', function () {
    assert(process.env.HOME || process.env.PATHEXT);
  });

});

// describe('test', function () {
//   it('inner green 4', function () {
//     assert(process.env.HOME || process.env.PATHEXT);
    
//   })
  
// })

// describe('green 5', () => {
//   describe('describe level 1', () => {
//     describe('describe level 2', () => {
//       it('inner green 5 level 2', function () {
//         assert(process.env.HOME || process.env.PATHEXT);
//       });
//       it(' inner green second 5 level 2', function () {
//         assert(process.env.HOME || process.env.PATHEXT);
//       });
//     });
//     it('inner green 4', function () {
//       assert(process.env.HOME || process.env.PATHEXT);
//     })

//     it('inner green 5 level  1', function () {
//       assert(process.env.HOME || process.env.PATHEXT);
//     });
//     it('inner green second 5 level 1 ', function () {
//       assert(process.env.HOME || process.env.PATHEXT);
//     });
//   });
//   it('inner green 5 level 0', function () {
//     assert(process.env.HOME || process.env.PATHEXT);
//   });
//   it('long timeout', function (done) {
//     setTimeout(done,10000);
//   });
// });


