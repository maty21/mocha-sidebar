
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
