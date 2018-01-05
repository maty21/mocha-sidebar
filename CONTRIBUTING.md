# Contribution instructions

- `git clone ...`
- `npm install`
- Open with **vscode**
- Disable **Mocha sidebar** extension in this workspace
- Choose `Launch Extension` debug configuration
- Launch debug
- A new vscode window should open using the test workspace folder
- Run `npm install`
- Open **Explorer** in sidebar
- Expand the Mocha explorer at the bottom of Explorer
- Open `./test/environment.js`
- You should see tests load in **Mocha sidebar**
- In Mocha sidebar, right click **Tests** and click **Run All Tests**
- Some should pass and some should fail
- Make changes to the extensions in the extension project
- Restart extension debugging
- Make sure tests still load and run


### debug fork proccess

 in mocha side bar mocha process running in fork for using the current installed node and not the VScode one

 in order to debug it you have to do the follows

 1. set your launch.json wit this params on your   debuging configuration
    ```js
     "env": {
                "MOCHA_DEBUG":"true"

            }
    ```
    

2. add this configuration to your launch.json
    ```js
      {
            "name": "Attach child",
            "type": "node",
            "request": "attach",
            "port": 5859,
            "address": "localhost",
            "restart": false,
            "sourceMaps": false,
            "outFiles": [],
            "localRoot": "${workspaceRoot}",
            "remoteRoot": null,
            "protocol": "inspector"
        },
    ```
3. run your code and then run the  "Attach child" option 


    
    