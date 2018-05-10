
// const {config,cover} = require('istanbul-api');
const { resolve, join } = require('path');
const outputDir = resolve(__dirname, 'coverage');
const lcovParse = require('lcov-parse');
const { spawn } = require('child_process')
const { platform } = require('os');
// var wrap = require('spawn-wrap')
const vscode = require('vscode');
const config = require('../config.js');
const fs = require('fs');

class codeCoverage {
  constructor(workDir = vscode.workspace.rootPath) {
    this._workDir = config.subdirectory() ? config.subdirectory() : vscode.workspace.rootPath;
    this._exclude = ''//|| `--exclude=config` // if config.exclude path
    this._pathToNyc = join(__dirname, '../node_modules/.bin/nyc');// or configuration 
    this._command = (platform() === 'win32' ? 'cmd.exe' : 'sh');
    this._args = (platform() === 'win32' ? ['/s', '/c'] : ['-c']);
    this._cmd = this._commandBuilder();
    this._coveragePath = join(this._workDir, './coverage')
    this.coverageResult = {};
    const {getRatio,RATIO,HIT_TYPE}= require('./hit-ratio')
    const updateDecoration = require('./coverage-update-decoration');;
  }
  getResultByPath(path){
    return this.coverageResult[path];
  }

  updateDecorationByFile(editor){
    this.getResultByPath(editor.document.fileName).lines.details.forEach(l=>{
        const ratio = getRatio(l.hit);
        updateDecoration.setDecoration(ratio,l.line,l.hit,editor.document.fileName);

    })
  }
  _commandBuilder() {
    const mochaBin = config.mochaPath();
    const cmd = `${this._pathToNyc} --all --reporter=html ${this._exclude} --reporter=text --reporter=lcov ${mochaBin} --exit`
    return cmd;


  }
  _spawnCoverage() {
    const cp = spawn(this._command, this._args.concat([this._cmd]), {
      cwd: this._workDir
      // stdio: 'inherit',
    });

    cp.on('close', (code) => {
      process.exit(code);
    });
    cp.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    cp.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    cp.on('exit', () => {
        console.log();
        console.log('You can see more detail in coverage/index.html');
        console.log();
        this.coverageResult = {};
        lcovParse(`${this._workDir}/coverage/lcov.info`, (err, data) => {
          console.log(data);
          data.forEach(result=>this.coverageResult[result.file] =  result)
        })
    });


  }
  run() {
    if (config.coverage().enable) {
      if (!fs.existsSync(this._coveragePath)) {
        try {
          fs.mkdirSync(this._coveragePath);
        } catch (error) {
          console.log(`it impossible to create coverage path at ${this._coveragePath}`);
        }
      }
      this._spawnCoverage();
    }

  }
}



module.exports = new codeCoverage();
// ls.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });

//   ls.stderr.on('data', (data) => {
//     console.log(`stderr: ${data}`);
//   });

//   ls.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });
//sw.runMain()
// let bla = _nyc.report()
// lcovParse(`${codeRoot}/coverage/lcov.info`,(err,data)=>{
//     console.log(data);
// })
 //console.log(bla);