const runTest = require('./runtestInProcess');
var lineNumber = require('line-number');
const fs = require('fs');
let stub = {
files: ["/home/matyz/dev/raf-producer-consumer/test/test.js"],
options: { "args": ["--colors"] },
grep: "^Test Stress CreateJob should create job multiple times and set of results$",
requires: [],
rootPath: "/home/mat's/dev/raf-producer-consumer"
}
//var re = /Jon[^,]+/g;
var re = /should create job multiple times and set of results+/g;

var fixture = fs.readFileSync(stub.files[0], 'utf8');
let line = lineNumber(fixture, re);
console.log(line);
//let obj = JSON.parse(stub)

runTest(stub)



