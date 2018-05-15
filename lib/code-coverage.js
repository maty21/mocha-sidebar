
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
const { getRatio, RATIO, HIT_TYPE } = require('./hit-ratio')
const { setDecoration, clearData } = require('./coverage-update-decoration');;

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
    this._toggleCoverage = false;

  }
  getResultByPath(path) {
    return this.coverageResult[path];
  }
  updateDecorationByFile() {
     clearData();
    const { fileName } = vscode.window.activeTextEditor.document;
    if (this._toggleCoverage) {
      if (this.getResultByPath(fileName)) {
        this.getResultByPath(fileName).lines.details.forEach(l =>  this.updateDecorationForLine(fileName,l))
      }
    }
  }
  updateDecorationAfterNotification(fileName,line){
    const l = this.getResultByPath(fileName).lines.details.find(l=>l.line==line);
    this.updateDecorationForLine(fileName,l)
  }
  updateDecorationForLine(fileName,l){
    const ratio = getRatio(l.hit);
    const isBreakpoint = this._breakpointUpdate(fileName, l.line);
    setDecoration(ratio, l.line, l.hit, fileName,isBreakpoint);
  }
  _breakpointUpdate(fileName, line) {
   // console.log(vscode.debug.breakpoints);
   let breakpointAmount=  vscode.debug.breakpoints.filter(bp => bp.enabled == true && bp.location.uri.path == fileName && bp.location.range._start._line == line-1);
   if(breakpointAmount.length ==0){
     return false;
   }
   return true;
  }
  _commandBuilder() {
    const mochaBin = config.mochaPath();
    const cmd = `${this._pathToNyc} --all --reporter=html ${this._exclude} --reporter=text --reporter=lcov ${mochaBin} --exit`
    return cmd;


  }
  toggleCoverage() {
    this._toggleCoverage = !this._toggleCoverage;
    if (this._toggleCoverage) {
      this.updateDecorationByFile();
    }
    else {
      clearData();
      this.updateStatusBar();
    }
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
      this._updateCoverageResultObject();a
    });


  }
  _updateCoverageResultObject(){
    this.coverageResult = {};
    lcovParse(`${this._workDir}/coverage/lcov.info`, (err, data) => {
      console.log(data);
      data.forEach(result => this.coverageResult[result.file] = result)
    })
    this.createStatusBar();
  }


  run() {
    if (config.coverage().enable) {
      if (!fs.existsSync(this._coveragePath)) {
        try {
          fs.mkdirSync(this._coveragePath);
        } catch (error) {
          console.log(`it impossible to create coverage path at ${this._coveragePath}`);
        }
        //should decide if running each time 
        this._spawnCoverage();
      }
      else {
        this._updateCoverageResultObject();
      }
    }

  }
  updateStatusBar() {
    this.statusBar.text = this._toggleCoverage ? 'coverage enable' : 'coverage disable';
  }
  createStatusBar() {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100111);
    // status.command = 'extension.selectedLines';
    //const statusTemplate = (passed,failed)=>` bla  fsdfds `;
    this.statusBar.text = 'coverage disable';
    this.statusBar.command = 'mocha-maty.toggleCoverage',
      //subscriptions.push(status);
      this.statusBar.show();


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