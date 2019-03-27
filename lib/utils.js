'use strict';

exports.trimArray = function trimArray(array) {
  return array.reduce((trimmed, item) => {
    item && trimmed.push(item);

    return trimmed;
  }, []);
};
