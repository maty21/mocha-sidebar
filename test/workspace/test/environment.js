'use strict';

const assert = require('assert');


it('should inherit environment variables', function () {
  // Should cover Linux/Mac and Windows
  // assert.fail();

  // Once I figure out how to pass env variables to the extension host process,
  // we can do this:
  // assert(process.env.INHERITED_ENV_VAR == 'inherited');
});
it('should inherit environment variables 2', function () {
  // Should cover Linux/Mac and Windows
  assert.fail();


});


it('test2', function () {
  // Should cover Linux/Mac and Windows
  assert.fail();

});




describe('When environment variable is set in settings', function () {

  it('should run with them', function () {
    assert(process.env.HELLO_WORLD, 'Hello, World!');
  });
});

describe('green 3', function () {
  it('inner green 3', function () {
    assert.fail(process.env.HOME || process.env.PATHEXT);
  });
});

let isFirst = true;
describe('green 4', function () {
  beforeEach(() => {
    if (isFirst) {
      // this assertion fails, but mocha-sidebar test entry does not turn red
      isFirst = false;
      assert.equal(1, 2);
    }
  });


  
  it('inner green 4 test', function () {
    assert(process.env.HOME || process.env.PATHEXT);
  });
  it('inner green second 4', function () {
    assert(process.env.HOME || process.env.PATHEXT);
  });
});

describe('test', function () {
  it('inner green 4', function () {
    assert(process.env.HOME || process.env.PATHEXT);
  })
  
})


describe('green 5', () => {
  describe('describe level 1', () => {
    describe('describe level 2', () => {
      it('inner green 5 level 2', function () {
        assert(process.env.HOME || process.env.PATHEXT);
      });
      it(' inner green second 5 level 2', function () {
        assert(process.env.HOME || process.env.PATHEXT);
      });
    });
    it('inner green 4', function () {
      assert(process.env.HOME || process.env.PATHEXT);
    })
    it('inner green 5 level  1', function () {
      assert(process.env.HOME || process.env.PATHEXT);
    });
    it('inner green second 5 level 1 ', function () {
      assert(process.env.HOME || process.env.PATHEXT);
    });
  });
  it('inner green 5 level 0', function () {
    assert(process.env.HOME || process.env.PATHEXT);
  });
});


