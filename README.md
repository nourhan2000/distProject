# Prerequisites to run locally
<!-- UL -->
Please use the following links to install prequisits for the project to run locally:

* Install mongoDB using steps in the following link: 

    https://www.mongodb.com/docs/manual/administration/install-community/

* Install redis for windows easily from the following link: 

    https://github.com/microsoftarchive/redis/releases

* Run the following commands in the server folder:
    <!-- Code Blocks -->
    ```bash
    npm i socket.io
    npm i --save-dev nodeman
    npm i mongoose
    npm install redis
    npm install async-mutex
    ```

* Run The following commands in the client folder:
    <!-- Code Blocks -->
    ```bash
    npm i quill
    npm i socket.io-client
    npm i react-router-dom
    npm i uuid
    ```


# Run the project
To start the project please run the following commands in:
<!-- UL -->
* The client/my-app folder:
    <!-- Code Blocks -->
    ```bash
    npm start
    ```
* The server folder:
    <!-- Code Blocks -->
    ```bash
    npm run devStart
    ```

# If you just want to use the editor 

    Click on the following link it just that simple as that : https://disttexteditorproject.netlify.app/
