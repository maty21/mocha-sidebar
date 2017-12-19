const vscode = require('vscode');
const fs = require('fs');
//const lineNumber = require('line-number');
const splitLines = require('split-lines');
const navigateEditorItem = (file, name) => {
    let fixture = fs.readFileSync(file, 'utf8');
    let line = _lineNo(fixture, name);
    if (line.length == 0) {
        line.push({ line: "", number: 0, match: "" })
    }
    let fixedLine = line.filter(l => {
        try {
            let t = l.line.split('(')[1].split(',')[0].replace(/'/gi, "").replace(/"/gi, "").replace(/`/gi, "");
            return t == name;
            
        } catch (error) {
            console.log(`split error:${error}`);
        }
    })
    // console.log(line);
    if (fixedLine.length == 0) {
        fixedLine.push(line[0])
    }

    return fixedLine;

}



let _lineNo = (str, name) => {
    return splitLines(str).map((line, i) => {
        if (line.includes(name)) {
            return {
                line: line,
                number: i + 1,
                match: name
            };
        }
    }).filter(Boolean);
};

module.exports = navigateEditorItem;