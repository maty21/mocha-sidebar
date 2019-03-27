'use strict';

const babylon = require('babylon');
const fs = require('fs');

if(!RegExp.escape)
  RegExp.escape = s => String(s).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');

function isValidTest(token){
  const expression = token.expression;

  return token.type === "ExpressionStatement" && expression.type === "CallExpression" // This is a function call
    && ["describe", "it"].includes(expression.callee.name) && expression.arguments.length > 1 // This is a valid mocha test context
    // It has two arguments, a string and function
    && expression.arguments.length === 2
    && ["TemplateLiteral", "StringLiteral"].includes(expression.arguments[0].type)
    && ["FunctionExpression", "ArrowFunctionExpression"].includes(expression.arguments[1].type);
}

function formatTestName(argument){
  if(argument.type === "StringLiteral")
    return RegExp.escape(argument.value);
  else if(argument.type !== "TemplateLiteral")
    return "(.+)";

  let tokens = [];

  for(let token of argument.expressions)
    tokens.push({start: token.start, value: '(.+)'});

  for(let token of argument.quasis)
    tokens.push({start: token.start, value: RegExp.escape(token.value.raw)});

  return tokens.sort((a, b) => a.start - b.start).map(t => t.value).join('');
}

function outSideCursor(position, cursor){
  const start = position.start;
  const end = position.end;

  const afterCursor = start.line > cursor.row || (start.line === cursor.row && start.column > cursor.column);
  const beforeCursor = end.line < cursor.row || (end.line == cursor.row && end.column < cursor.column);
  return afterCursor || beforeCursor;
}

function detectTests(body, path, tests, cursor){
  if(body.type === "BlockStatement") // For blocks, fetch the list of statements
    body = body.body;

  for(let token of body){ // For all statements
    const expression = token.expression;
    const position = token.loc;

    // The definition is outside cursor position, ignore it
    if(outSideCursor(position, cursor))
      continue;

    if(isValidTest(token)){ // This is a valid mocha test context
      const newPath = Array.from(path).concat(formatTestName(token.expression.arguments[0])); // Add the new definition to the path
      tests.push({depth: newPath.length, label: `^(${newPath.join(" ")})`, start: position.start.line, end: position.end.line}); // Add the test

      if(expression.callee.name === "describe") // Since this defines a new suite, visit the block
        detectTests(expression.arguments[1].body, newPath, tests, cursor);
    }else if(token.body) // This is a block statement, visit the block without changing the path
      detectTests(token.body, path, tests, cursor);
  }
}

module.exports.getTests = function getTests(text, selection){
  const cursor = {row: selection.line + 1, column: selection.character};
  const ast = babylon.parse(text, {sourceType: "import", allowReturnOutsideFunction: true, allowImportExportEverywhere: true});

  fs.writeFileSync("/tmp/ast.json", JSON.stringify(ast, null, 2));
  let tests = [];
  // Start a depth-first visit of the tree

  try{
    detectTests(ast.program.body, [], tests, cursor);
    return tests;
  }catch(e){
    console.error(e);
    return [];
  }
}

module.exports.getTestAtCursor = function getTestAtCursor(text, selection){
  // Now order tests by depth and then line - The cursor is
  const sortedTests = module.exports.getTests(text, selection).sort((a, b) => {
    if(b.depth !== a.depth) // Sort by descending depth in order to correct recognize nested positions
      return b.depth - a.depth;

    // Upon same depth, sort by start line
    return b.start - a.start;
  });

  return sortedTests[0];
}