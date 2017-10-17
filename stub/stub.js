const suite = {
    name: 'suite1',
    suites: [
        {
            name: 'suite2',
            suites: [
                {
                    name: 'suite3',
                    suites: [


                    ],
                    tests: [{ name: 'test4' }, { name: 'test5' }]
                },
                {
                    name: 'suite4',
                    suites: [


                    ],
                    tests: [{ name: 'test6' }, { name: 'test7' }]
                }

            ],
            tests: [{ name: 'test3' }]
        }
    ],
    tests: [{ name: 'test1' }, { name: 'test2' }]
}


module.exports = suite;