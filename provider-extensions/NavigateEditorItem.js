const vscode = require('vscode');
const fs = require('fs');
//const lineNumber = require('line-number');
const splitLines = require('split-lines');
const navigateEditorItem = (file, name) => {
    // let re = new RegExp(`/${name}+/g`);
    let re = new RegExp(`${name}+`);

    let fixture = fs.readFileSync(file, 'utf8');
    let line = _lineNo(fixture, re);
    if (line.length == 0) {
        line.push({ line: "", number: 0, match: "" })
    }
    let fixedLine = line.filter(l => {
        let t = l.line.split('(')[1].split(',')[0].replace(/'/gi, "").replace(/"/gi, "").replace(/`/gi, "");
        return t == name;
    })
    // console.log(line);
    if (fixedLine.length == 0) {
        fixedLine.push(line[0])
    }

    return fixedLine;

}



let _lineNo = (str, re) => {
    return splitLines(str).map((line, i) => {
        if (re.test(line)) {
            return {
                line: line,
                number: i + 1,
                match: line.match(re)[0]
            };
        }
    }).filter(Boolean);
};

module.exports = navigateEditorItem;