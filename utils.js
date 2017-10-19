'use strict';

exports.trimArray = function trimArray(array) {
  return array.reduce((trimmed, item) => {
    item && trimmed.push(item);

    return trimmed;
  }, []);
};

exports.linenumber=function lineNo(str, re) {
  return str.split(/[\n]/).map(function (line, i) {
    if (re.test(line)) {
      return {
        line: line,
        number: i + 1,
        match: line.match(re)[0]
      };
    }
  }).filter(Boolean);
};
