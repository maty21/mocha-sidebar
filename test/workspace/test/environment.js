/* eslint-disable no-console */
/* eslint-disable no-undef */
// 'use strict';
const assert = require("assert");
const expect = require("chai").expect;
let isFirst = true;

describe("green 4", function() {
  it("inner green 4 test", function(done) {
    setTimeout(() => {
      expect(1).to.equal(1);
      //assert(process.env.HOME || process.env.PATHEXT);
      console.log(`waiting`);
      done();
    }, 5000);
  });

  it("inner green second 4", function() {
    assert(process.env.HOME || process.env.PATHEXT);
  });
});

describe("test", function() {
  it("inner green 4", function() {
    assert(process.env.HOME || process.env.PATHEXT);
  });
});

describe("outer", () => {
  describe("inner", () => {
    it("inner-test", () => {
      expect(1).to.be.equal(1);
    });
  });
  it("outer-test", () => {
    expect(1).to.be.equal(1);
  });
});
describe("green 5", () => {
  describe("describe level 1", () => {
    describe("describe level 2", () => {
      it("inner green 5 level 2", function() {
        assert(process.env.HOME || process.env.PATHEXT);
      });
      it(" inner green second 5 level 2", function() {
        assert(process.env.HOME || process.env.PATHEXT);
      });
    });
    it("inner green 4", function() {
      assert(process.env.HOME || process.env.PATHEXT);
    });

    it("inner green 5 level  1", function() {
      assert(process.env.HOME || process.env.PATHEXT);
    });
    it("inner green second 5 level 1 ", function() {
      assert(process.env.HOME || process.env.PATHEXT);
    });
  });
  it("inner green 5 level 0", function() {
    assert(process.env.HOME || process.env.PATHEXT);
  });
  it("long timeout", function(done) {
    setTimeout(done, 10000);
  });
});
