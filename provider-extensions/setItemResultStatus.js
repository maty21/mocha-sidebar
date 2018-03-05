const consts = require('./consts');
const setItemResultStatus = (res, name, suitePath) => {
    let status = consts.NOT_RUN;
    let error = null;
    if (res.passed.find(r => r.fullName == name)) {
        status=  consts.PASSED;
    }
   else if (res.failed.find(r => r.fullName.trimLeft() == name )) {
        let r = res.failed.find(r => r.fullName.trimLeft() == name )
        status =  consts.FAILED;
        error = r.error
    }

    else if (res.ranTests && res.ranTests.find(t=>t.fullName == name) && res.failed.find(r=>arraysEqual(r.suitePath, suitePath))){
        status =  consts.FAILED;
        error = r.error
    }
        
    return {
        status,
        error
    };


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