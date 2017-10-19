const consts = require('./consts');
const setItemResultStatus = (res, name) => {
    if (res.passed.find(r => r.fullName == name)) {
        return consts.PASSED;
    }
    if (res.failed.find(r => r.fullName == name)) {
        return consts.FAILED;
    }
    return consts.NOT_RUN;


}

module.exports = setItemResultStatus;