0.20.22 (31.10.2018)
===
 -  PR merge  #162 
 - this PR allows you to run your test in paraller theres is a new settings for it with the name `parallel test` 
 -  the default is set for run inorder to decrease ambiguty  
  thanks for @townbully for the amazing PR

0.20.20 (31.10.2018)
===
 - fix issue in case eception in parsing mocha side bar get stuck and Explorer tab stayes in waiting mode.
 -  PR merge  #150 #149 #143 #141

0.20.18 (30.8.2018)
===
 - fix debug issues
 - enviroment not passed to vscode debbuger  
 - fix issue when using realtive mocha with debug 
 - figured out what caused the stack problem with ts in later node version (ts-node should update to 7.0.1)    issue #61
 - fix commands not running  #102 #135 

0.20.17 (23.7.2018)
===
 - fix issue 120 by adding flag which shows error only once 
0.20.14 (23.7.2018)
===
 - update mocha version
 - add example test for typescript
===
0.20.12 (28.6.2018)
 - fix issue cannot show test suite name like "toString" #119
 - fix issue Unescaped regex characters in grep for test name #112, #118, #99
===

0.20.1 (18.9.2018)
 - add new feature for code coverage 
 
===

0.19.1 (04.06.18)
 - add config to disable error popup (#105)
===

0.19.0 (10.5.18)
 - add context menu on folders in explorer to set subdirectory (#2). 
 - fix debug with subdirectory set
===

0.18.2 (9.5.2018)
 - merge pr #66  #92 - change readme for the correct settings
 
===

0.18.1 (9.5.2018)
 - fix #96  - change readme to the correct settings
 - change  expect_error image to https://raw.githubusercontent.com/maty21/mocha-sidebar/master/images/intro/expect_error.gif for           supporting showing in vscode marketplace pages 
===
0.18.0 (9.5.2018)
 - fix #100 #97 PR - add support for new test view + add configuration for switching back to the explorer menu
   using config.mocha.showInExplorer=true 
 - remove showExplorer option since it's already built-in feature 
===
0.17.7 (22.4.2018)
 - fix #93 - pass mocha.options to mocha when debugging
===
0.17.6 (22.4.2018)
 - fix #94 - pass multiple require options to mocha when debugging
===
0.17.1 (28.3.2018)
===
 - show error message of failed tests. Errors are shown as decorations next to the error line
0.16.1(22.3.2018)
===
 - Show the number of passed and failed tests in the status bar

0.15.0(18.3.2018)
===
 - fix debugging tests with typescript

0.14.32(4.3.2018)
===
add gitter for asking questions


0.14.30(1.3.2018)
===
- add an option to set different mocha path the the built-in one 
- clear not needed logs
- add mocha.logVerbose option to set verbosity logs true will add logs to mocha output, default is false 
- remove output window show 

0.14.28(28.2.2018)
====
 -fix detailed error


0.14.24(28.2.2018)
====
 - add detailed error in case mocha sidebar failed to find tests

0.2.0 (2017-01-20)
=====

- Moves old changelog out of README
- Fixes #4: broken on Linux due to incorrect case in `require()` call
- Debugging this extension will automatically open `test/workspace` (for developers)
- Adds support for passing custom node CLI options (#6)
- Adds `subdirectory` option: runs mocha with user-specified cwd (#2)
- Adds `requires` option: like mocha's `--requires` CLI option (#2)
- Adds `runTestAtCursor` command: Runs only the test under the cursor. (#2)
- Fixes #1: When no workspace is open, mocha-latte shows a helpful error message. (via #2)
- Fixes #5: spawned mocha process inherits all environment variables of parent.
- Fixes #7: Allow tests outside of any containing `describe()` call.

0.1.2 (2016-10-18)
=====

- More accurate behavior on Windows to locate node executable.
Pays attention to PATHEXT environment variable.
- Fixed Mac and Linux support by correctly accessing the PATH environment variable.

0.1.1 (2016-04-27)
=====

- Feature: New settings - test files glob and ignore globs
- Feature: New settings - environment variables for discovering and running tests

0.1.0 (2016-04-26)
=====

- Feature: Run tests by grep pattern
- Feature: Rerun failed tests
- Feature: Rerun last set of tests
- Feature: Dump severe error to output channel
- Fix: When selecting tests, it did not use Mocha options in  settings

0.0.1 (2016-04-25)
=====

- First public release
