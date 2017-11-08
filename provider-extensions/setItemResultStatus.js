const consts = require('./consts');
const setItemResultStatus = (res, name, suitePath) => {
    if (res.passed.find(r => r.fullName == name)) {
        return consts.PASSED;
    }
    if (res.failed.find(r => (r.fullName == name ||
        arraysEqual(r.suitePath, suitePath)))) {
        return consts.FAILED;
    }

    return consts.NOT_RUN;


}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
module.exports = setItemResultStatus;