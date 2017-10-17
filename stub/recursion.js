const suite = require('./stub');


let counter = 0
const calcSuite = (suite) => {
    counter = counter + suite.tests.length;
    console.log(suite.suites.length)
    if (suite.suites.length == 0) {
        console.log(`suites.inner tests:${suite.tests.length} name: ${suite.tests[0].name}`)
        return;
    }
    suite.suites.forEach(s => {
        console.log(`suites:${s.suites.length}`)
        console.log(`tests:${s.tests.length} name: ${suite.tests[0].name}`)
        console.log(`a before:${counter}`)
        calcSuite(s)
        //  counter = counter +  s.tests.length
        console.log(`a after:${counter}`)
    })

}

calcSuite(suite)

console.log(`counter: ${counter}`);