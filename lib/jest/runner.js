const { Runner, TestReconciler, JestTotalResults, TestFileAssertionStatus } = require('jest-editor-support');
const { files } = require('../../config')

class JestRunner {
    constructor() {
        this.runner = null;
        this.rootPath = vscode.workspace.rootPath
        this.jestPath = 'jest'
        this.testFileNamePattern = files().glob;
    }

    init() {
        this.runner = new Runner(
            {
                rootPath: this.rootPath,
                pathToJest: this.jestPath,
                // localJestMajorVersion: this.localJestMajorVersion,
                pathToConfig: getConfigFilePath(this.rootPath)
            },
            {
                testFileNamePattern,
                //   testNamePattern,
                createProcess
            }
        )

        this.runner.start();
        this.runner.on('debuggerProcessExit', _ => console.log('bla'));
    }


}



module.exports = new jestRunner();