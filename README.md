# Mocha Side Bar 
[![Version](https://vsmarketplacebadge.apphb.com/version/maty.vscode-mocha-sidebar.svg)](https://marketplace.visualstudio.com/items?itemName=maty.vscode-mocha-sidebar)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/maty.vscode-mocha-sidebar.svg)](https://marketplace.visualstudio.com/items?itemName=maty.vscode-mocha-sidebar)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/maty.vscode-mocha-sidebar.svg)](https://marketplace.visualstudio.com/items?itemName=maty.vscode-mocha-sidebar)
[![Github Stars](https://img.shields.io/github/stars/maty21/mocha-sidebar.svg?style=flat-sqaure&label=Stars)](https://github.com/maty21/mocha-sidebar)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/mocha-sidebar/Questions)



### **Sidebar** (new running in the new test view by default)
![Demo showing mocha menu operation](https://raw.githubusercontent.com/maty21/mocha-sidebar/master/tutorial.gif)

### **Expect error  messages**  (similar to wallaby implementation)
![Demo that showing expect messages](https://raw.githubusercontent.com/maty21/mocha-sidebar/master/images/intro/expect_error.gif)

### **NEW coverage**  (via istanbul) soon as independent extension also
![Demo that showing code coverage](https://raw.githubusercontent.com/maty21/mocha-sidebar/coverage/images/intro/coverage.gif)

### **run test in parallel** 
![Demo that showing parallel](https://raw.githubusercontent.com/maty21/mocha-sidebar/coverage/images/intro/parallel.gif)


#### * **Important Note for coverage feature** -  there is an open issue in vscode that its not able to select via mouse / render two different decorations at the same line. as a **workaround** try F9/ or hide show decoration by clicking on the status bar  

#### Mocha side bar is the most complete extension for mocha testing based on not maintained mocha extension and supports all of its features and much more

##### Love this extension? [Star](https://github.com/maty21/mocha-sidebar/stargazers) us and rate us!

#### Mocha Side Bar already supports these features (feel free to propose new features)
* [x] New code coverage support
* [x] see all tests in vscode side bar menu
* [x] git lens for running/debugging directly form the code
* [x] decorations which shows test status(pass/fail/not run) from code
* [x] run tests for each level hierarchy from all tests to a single test(and each describer of course) 
* [x] debug tests for each level hierarchy from all tests to a single test(and each describer of course) 
* [x] auto run tests on file save
* [x] see tests results directly on the code 
* [x] run/debug results directly from the code 
* [x] see test errors as decoration
* [x] add context menu on folders in explorer to set subdirectory (#2). 
* [x] NEW run test in parallel (#162)

#### Not supported yet
* [ ] tree view files separation hierarchy for the top level hierarchy

#### Known issues
* **Coverage**- there is an open issue in vscode that its not able to select via mouse / render two different decorations at the same line. as a **workaround** try F9/ or hide show decoration by clicking on the status bar  
* **Workspace** -   Currently not supported there is a workaround for solving it for more details [#107](https://github.com/maty21/mocha-sidebar/issues/107)





#### Contributors:
- Maty Zisserman
- Yehiyam Livneh


## Contributions
Love this extension? [Star](https://github.com/maty21/mocha-sidebar/stargazers) us and rate us!

Want to make this extension even more awesome? [Send us your wish](https://github.com/maty21/mocha-sidebar/issues/new/).

Hate how it is working? [File an issue](https://github.com/maty21/mocha-sidebar/issues/new/) and let us know.


### FAQ

**Q:** Mocha Side Bar won't run?

**A:** Try the following:
  1. Verify that there is no other mocha runner extension on your machine.
  2. In case you're using test view option verify that the test view is already selected 
  3. Make sure that `mocha.logVerbose` is set to `true` and Check logs in the output menu.
  4. Verify that the glob pattern is OK. The default is `test/**/*.js`
  5. Verify that you're not running with an old node version. 6.* should work.
  6. Try reinstall your VC Code instance  
  7. Ask for our support on gitter [![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/mocha-sidebar/Questions)

---

**Q:** I can't run TypeScript (ts-node compiler)

**A:** Try the following
  1. Try installing `typescript` and `ts-node` package locally (not with -g option)
  2. Verify that you're using `ts-node` that support `import`. Version `7.0.0` should work.
  3. Verify that your configuration is correct 
  ```js
  "mocha.requires": [
      "ts-node/register"
  ],
  ```
  4. If you're still having problems you can try running TypeScript test [typeScript-test](https://github.com/maty21/mocha-sidebar/tree/master/test/typeScript-test) on your machine.

---

**Q:** I can't run babel-register compiler

**A:** Verify that your configuration is correct
```js
"mocha.requires": [
    "babel-register"
]
``` 

---

**Q:** I can't check breakpoints when coverage is running.

**A:** Try the following:
1. Try F9 - That is an vscode issue that its not able to select/render two different decoration in the same place.
2. You can enable disable coverage decoration by clicking on the status bar so you can open it only if its matter.

---
     
**Q:** `Run all tests` not working.

**A:** Verify that there is no describe or test with the name "test" (should be fix soon)

---

**Q:** Mocha Sidebar is not working on Windows with WSL (Error: Cannot find Node.js installation from environment variable)

**A:** Update your PATH in ~/.profile to `PATH="$HOME/bin:$HOME/.local/bin:/usr/bin:$PATH"` + restart VS Code (read more about this here: https://stackoverflow.com/a/44450219/1782659)

If for some reason something is not working for you can [file an issue](https://github.com/maty21/mocha-sidebar/issues/new/).

---





## Fit yourself
No one shoe could fit everyone. You may need to turn some switches on to fit your project. Please 
[file us](https://github.com/maty21/mocha-sidebar/issues/new/) an issue if you think there is a better way to fit you and the others.


### Mocha options

| Config | description | default |
|--------|-------------|---------|
| `mocha.showInExplorer` | mocha view is now shown in the new test view as default it possible to switch it back to the explorer view with this setting | ``` "mocha.showInExplorer":false ``` |
| `mocha.options` |   Options to run Mocha |`{}` |
| `mocha.files.glob` |  Globs to use when searching for test files|`test/**/*.js`
| `mocha.files.ignore` |  Globs to ignore when searching for test files |``` "mocha.files.ignore": [  "**/.git/**/*",  "**/node_modules/**/*" ], ``` |
| `mocha.env` | Environment variables to run your tests | `"false"`|
| `mocha.path` |set other mocha path then the built-in one only path to mocha package ../node_modules/mocha |`"../node_modules/mocha"`|
| `mocha.logVerbose` |set mocha side bar log verbose for seeing in the output there are to different output sidebar-mocha for seeing mocha output and sidebar-coverage for seeing coverage output  |`true`|
| `mocha.parallelTests` |run mocha tests in parallel   |`1`|

### SideBar options

#### template
``` js
"mocha.sideBarOptions": {
            "lens": true, 
            "decoration": true,
            "autoUpdateTime": 2000,
            "showDebugTestStatus": true 
        }
```

| Config | description | default |
|--------|-------------|---------|
| `lens` | enable/disable lens - (the option to run/debug tests inside the code) by selecting true ro false  |`true`|
| `decoration` |enable/disable decoration(the option to see test result status inside the code  )  by selecting true ro false|`true`|
| `autoUpdateTime` | set timeout (in milliseconds) between each decorations and lens updates during test writing by selecting true ro false  |`2000`|
| `showDebugTestStatus` | an option to disable running mocha twice in order to see status on the sidebar  |`true`|


### Coverage options  (soon will be independent package for this)

#### template
``` js
  "mocha.coverage": {
        
            "enable": true,
            "decoration": true,
            "runWithInterval": false,
            "autoUpdateInterval": 20000,
            "activeOnStart": true,
            "runAfterTest": false,
            "reporters": []
          },
     
```


| Config | description | default |
|--------|-------------|---------|
| `enable` | enable/disable coverage feature by selecting true ro false  |`true`|
| `decoration` |enable/disable decoration(the option to see coverage result status inside the code  )  |`true`|
| `runWithInterval` | auto coverage running   |`false`|
| `autoUpdateInterval` | incase `runWithInterval`  is enable that option allows you to decide on each interval coverage will run  |`20000`|
| `runAfterTest` |allows you to update coverage status after test running   |`false`|
| `runCoverageAfterFileSave` | allows you to update coverage status after file save|`false`|
| `reporters` | allows you to add more reporters other than the default html text lcov |`[]`|



### Configuring Mocha options
Under File > Preferences > Workspace Settings, you can configure [Mocha options](https://github.com/mochajs/mocha/blob/master/lib/mocha.js), e.g. run in "tdd" mode, detect/ignore leaks, etc.





## Usage via command Palette
To run Mocha tests:
* Bring up Command Palette (`F1`, or `Ctrl+Shift+P` on Windows and Linux, or `Shift+CMD+P` on OSX)
* Type or select "Mocha: Run all tests"
You can run tests by:
* All tests in the workspace
* All or failed tests in last run
* Tests that match a Regular Expression
* Tests that the current cursor position (or the current file)
* One test that you pick from a list

![Demo showing Mocha test result](https://raw.githubusercontent.com/maty21/mocha-sidebar/master/demo.png)
  


### Setting a keyboard shortcut

To quickly run tests, you can create a keyboard shortcut under File > Preferences > Keyboard Shortcuts. For example, the following JSON will run all tests with `CTRL+K` followed by `R` key.
```
{
  "key": "ctrl+k r",
  "command": "mocha.runAllTests"
}
```

Following commands are also supported:

| Command                   | Title                                                                            |
| ------------------------- | -------------------------------------------------------------------------------- |
| `mocha.runAllTests`       | Mocha: Run all tests                                                             |
| `mocha.runFailedTests`    | Mocha: Run failed tests                                                          |
| `mocha.runLastSetAgain`   | Mocha: Run last set again                                                        |
| `mocha.runTestAtCursor`   | Mocha: Run tests matching the current cursor position or the current active file |
| `mocha.runTestsByPattern` | Mocha: Run tests matching a pattern                                              |
| `mocha.selectAndRunTest`  | Mocha: Select and run a test                                                     |


### How it works
By default, this extensions will discover tests by searching for `test/**/*.js` under your workspace.

Because your tests may requires a newer version of Node.js than the one powering Visual Studio Code, thus, this extension will attempt to find your installed Node.js and use it for your tests. It will search for the installed Node.js as indicated by environmental variable `PATH`. You can find the logic [here](https://github.com/maty21/mocha-sidebar/blob/master/fork.js).

When the test is being run, we will add `NODE_PATH` to point to your workspace `node_modules` folder to help [resolving external modules](https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders).

When you ask to run the test under cursor position, the extension will parse the current file and look for matching tests or suites.
If the file contains tests or suites defined using template strings or via dynamic generation, the regular expression `(.+)` will be used as a placeholder in order to have a better matching without having to evaluate the file twice.
This implies that more tests than expected might be run.
