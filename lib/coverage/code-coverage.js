
// const {config,cover} = require('istanbul-api');
const { resolve, join } = require('path');
const outputDir = resolve(__dirname, 'coverage');
const lcovParse = require('lcov-parse');
const { spawn,fork } = require('child_process')
const { platform } = require('os');
// var wrap = require('spawn-wrap')
const vscode = require('vscode');
const config = require('../../config.js');
const fs = require('fs');
const { getRatio, RATIO, HIT_TYPE, getStatusBarRatioColor } = require('./hit-ratio')
const { setDecoration, clearData } = require('./coverage-update-decoration');




class codeCoverage {
  constructor(workDir = vscode.workspace.rootPath) {
    this.outputChannelCoverage = vscode.window.createOutputChannel('sideBar-coverage');
    this._workDir = config.subdirectory() ? config.subdirectory() : vscode.workspace.rootPath;
    this._exclude = ''//|| `--exclude=config` // if config.exclude path
    this._pathToNyc = join(__dirname, '../../node_modules/nyc/bin/nyc.js');// or configuration 
    this._command = (platform() === 'win32' ? 'cmd.exe' : 'sh');
    this._args = (platform() === 'win32' ? ['/s', '/c'] : ['-c']);
    this._cmd = this._commandBuilder();
    this._coveragePath = join(this._workDir, './coverage')
    this.coverageResult = {};
    this._toggleCoverage = false;
    this.statusBar = null;
    this.resultStatusBar = null;
    this.createStatusBar();

  }

  updateViaInterval() {
   
      setTimeout(async () => {
        if (config.coverage().enable&&config.coverage().runWithInterval){
          await this.runViaRequest();
          this.updateViaInterval();
        }
      }, config.coverage().autoUpdateInterval);
  }

  getResultByPath(path) {
    return this.coverageResult[path.toLowerCase()];
  }

  updateDecorationByFile() {
    clearData();
    // var CURSOR_FOREGROUND1 = new vscode.ThemeColor('editor.background')
    const { fileName } = vscode.window.activeTextEditor.document;
    if (this._toggleCoverage) {
      const resForFileName = this.getResultByPath(fileName);
      if (resForFileName) {
        const { hit, found, details } = resForFileName.lines;
        details.forEach(l => this.updateDecorationForLine(fileName, l))
        const percentCalc = ((hit / found) * 100).toFixed(2);
        this.resultStatusBar.text = `${percentCalc}%(${hit}/${found})`
        this.resultStatusBar.color = getStatusBarRatioColor(percentCalc);
      }
    }
  }
  updateDecorationAfterNotification(fileName, line) {
    const l = this.getResultByPath(fileName).lines.details.find(l => l.line == line);
    this.updateDecorationForLine(fileName, l)
  }
  updateDecorationForLine(fileName, l) {
    const ratio = getRatio(l.hit);
    const isBreakpoint = this._breakpointUpdate(fileName, l.line);
    setDecoration(ratio, l.line, l.hit, fileName, isBreakpoint);
  }
  _breakpointUpdate(fileName, line) {
    // console.log(vscode.debug.breakpoints);
    let breakpointAmount = vscode.debug.breakpoints.filter(bp => bp.enabled == true && bp.location.uri.path == fileName && bp.location.range._start._line == line - 1);
    if (breakpointAmount.length == 0) {
      return false;
    }
    return true;
  }

  _fork(){
    return new Promise(async (resolve, reject) => {
      this._cmd = this._commandBuilder();
     
      const cp = fork(this._pathToNyc, this._cmd, {
        cwd: this._workDir,
        silent: true 
        // stdio: 'inherit',
      });
      cp.on('message', (m) => {
        console.log('CHILD got message:', m);
      });
      cp.on('close', (code) => {
        process.exit(code);
      });
      cp.stdout.on('data', (data) => {
        this.outputChannelCoverage.appendLine(data);
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on('data', (data) => {
       // reject(data);
        this.outputChannelCoverage.appendLine(data);
        console.log(`stderr: ${data}`);
      });
      cp.on('exit', () => {
        console.log('You can see more detail in coverage/index.html');
        resolve();


      });
      
    })
    }

   _spawnCoverage() {
    
    return new Promise(async (resolve, reject) => {
    let   path = null;
      try {
        path=  await this.nodeJSPath();
        
      } catch (error) {
        console.log(errors);
        
      }
      this._cmd = this._commandBuilder();
      const cp = spawn(path,config.node_options().concat([this._cmd]), {
        cwd: this._workDir
        // stdio: 'inherit',
      });

      cp.on('close', (code) => {
        process.exit(code);
      });
      cp.stdout.on('data', (data) => {
        this.outputChannelCoverage.appendLine(data);
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on('data', (data) => {
       // reject(data);
        this.outputChannelCoverage.appendLine(data);
        console.log(`stderr: ${data}`);
      });
      cp.on('exit', () => {
        console.log('You can see more detail in coverage/index.html');
        resolve();


      });
    });


  }
  _commandBuilder() {
    const reporters = '';
    config.coverageReporters().forEach(r => reporters = reporters + ` --reporter=${r}`);
    const baseMochaFolder =join(__dirname,'../../node_modules/mocha');
    const mochaSuffix = '/bin/mocha'
    //ugly workaround 
    const mochaNodeModulesPath =  config.mochaNodeModulesPath().split('/')[0]==".."?config.mochaNodeModulesPath().slice(1):config.mochaNodeModulesPath();

    const mochaBin = mochaNodeModulesPath == '' ?`${baseMochaFolder}${mochaSuffix}`:`${mochaNodeModulesPath}${mochaSuffix}`
    const extraMochaOptions = this._buildMochaCommandArgs();
   let  tempCmd = ` --all ${this._exclude} --reporter=html --reporter=text --reporter=lcov ${reporters} ${mochaBin} ${extraMochaOptions} ${config.files().glob} --exit`
   let cmd = null;
   if(platform() === 'win32'){
      cmd =[];
      tempCmd.split(" ").forEach(i=>i!=""?cmd.push(i):null);     
    }else{
      cmd = this._pathToNyc.concat(tempCmd);
    }
  
    if(config.logVerbose()){
      this.outputChannelCoverage.appendLine(`coverage running the following command ${cmd}`)
    }
    return cmd;


  } 
  _buildMochaCommandArgs() {
    let mochaOptions = '';
    /*
     
     glob: config.files().glob,
      ignore: config.files().ignore
      files: ${JSON.stringify(testFiles)},
      options: ${JSON.stringify(config.options())},
      grep:${JSON.stringify(grep)},
      requires: ${JSON.stringify(config.requires())},
      rootpath: ${JSON.stringify(rootPath)}  */

    if (config.requires().length != 0) {
      config.requires().forEach(req => { mochaOptions = mochaOptions + `--require ${req} ` })
    }

    return mochaOptions
  }
  toggleCoverage(status = !this._toggleCoverage) {
    this._toggleCoverage = status;
    if (this._toggleCoverage) {
      this.updateDecorationByFile();
    }
    else {
      clearData();
    }
    this.updateStatusBar();
  }
  _spawnCoverage() {

    return new Promise((resolve, reject) => {
      this._cmd = this._commandBuilder();
      const cp = spawn(this._command, this._args.concat([this._cmd]), {
        cwd: this._workDir
        // stdio: 'inherit',
      });

      cp.on('close', (code) => {
        process.exit(code);
      });
      cp.stdout.on('data', (data) => {
        this.outputChannelCoverage.appendLine(data);
        console.log(`stdout: ${data}`);
      });

      cp.stderr.on('data', (data) => {
       // reject(data);
        this.outputChannelCoverage.appendLine(data);
        console.log(`stderr: ${data}`);
      });
      cp.on('exit', () => {
        console.log('You can see more detail in coverage/index.html');
        resolve();


      });
    });


  }
  async _updateCoverageResultObject() {
    return new Promise((resolve, reject) => {
      this.coverageResult = {};
      lcovParse(`${this._coveragePath}/lcov.info`, (err, data) => {
        if (err) {
          reject(err)
        }
        else {
          data.forEach(result => this.coverageResult[result.file.toLowerCase()] = result)
          resolve();
        }
      })
    });
  }


  async runViaRequest() {
    const { enable, activeOnStart } = config.coverage();
    this.statusBar.text = 'coverage: progress'
    this.statusBar.color = 'white'
    this.resultStatusBar.text = ``
    try {
      if(platform() === 'win32'){
        try {
          await this._fork();
          
        } catch (error) {
          console.log(error);
          
        }
      }
      else{
        await this._spawnCoverage();

      }
     // clearData();
      await this._updateCoverageResultObject();
      if (activeOnStart) {
        this.toggleCoverage(true);
      }
    } catch (error) {

      console.log(error);
    }
  }

  async run() {
    const { enable, activeOnStart } = config.coverage();
    if (enable) {
      if (!fs.existsSync(join(this._coveragePath, 'lcov.info'))) {
        try {
          fs.mkdirSync(this._coveragePath);
        } catch (error) {
          console.log(`it impossible to create coverage path at ${this._coveragePath}`);
        }
        //should decide if running each time 
        if(platform() === 'win32'){
          await this._fork();
        }
        else{
          await this._spawnCoverage();
  
        }
        //    this.statusBar.show();
      }
      try {
        await this._updateCoverageResultObject();
        if (activeOnStart) {
          this.toggleCoverage(true);
        }
        this.updateViaInterval();
      } catch (error) {

        console.log(error);
      }

    }
  }

  updateStatusBar() {
    this.statusBar.text = this._toggleCoverage ? 'coverage: enabled' : 'coverage: disabled';
    this.statusBar.color = this._toggleCoverage ? '#00FF00' : 'yellow'
  }
  createStatusBar() {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100111);
    this.statusBar.text = 'coverage: progress'
    // this.statusBar.color = this._toggleCoverage ?'#00FF00':'grey'
    // status.command = 'extension.selectedLines';
    //const statusTemplate = (passed,failed)=>` bla  fsdfds `;
    //  this.updateStatusBar();

    this.statusBar.command = 'mocha-maty.toggleCoverage',
      //subscriptions.push(status);
      this.statusBar.show();

    this.resultStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -100112);
    this.resultStatusBar.show();
  }
}




module.exports = new codeCoverage();
