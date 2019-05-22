const assert = require("assert");
describe("same name test", () => {
  it("test1", () => {
    assert.fail("Fail!");
  });
});

describe("same name 2", () => {
  it("test2", () => {
    assert.ok("OK");
  });
});
