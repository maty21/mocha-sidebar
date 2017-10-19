const vscode = require('vscode');
const fs = require('fs');
const lineNumber = require('line-number');
const navigateEditorItem = (file, name) => {
    // let re = new RegExp(`/${name}+/g`);
    let re = new RegExp(`${name}+`);

    let fixture = fs.readFileSync(file, 'utf8');
    let line = lineNumber(fixture, re);
   // console.log(line);
    if (line.length == 0) {
        line.push({ line: "", number: 0, match: "" })
    }

    return line;
   
}

module.exports = navigateEditorItem;