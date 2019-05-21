const expect = require("chai").expect;

describe("use --requires", () => {
  console.log();

  it("it() should have global var", () => {
    expect(global.REQ).to.eql("this is required!");
    expect(global.REQ).to.eql("this is required!");

    expect(global.REQ2).to.eql("this is required too!");
  });
});
