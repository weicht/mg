# mg

This is a quick test setup to examine mongoose memory usage just by creating a connection, making a model, and closing
the connection.

1. open index.js and update the following settings:
    - NUM_ATTEMPTS
    - config.user
    - config.pass
    - config.auth.authdb
    - config.host
    - config.port
    - config.database
2. npm install
3. npm run hannibal
4. Note the heap growth in the console output


