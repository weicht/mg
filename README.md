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

---
####
opening connection
creating model
closing connection
mongoose connection: disconnected
mongoose connection: closed
forcing garbage collection
=> Heap total:  31.15 mb
=> Heap change:  46.15 kb
####
14.004752 MB  -> growth 0
14.03152 MB  -> growth 0.026768
14.081568 MB  -> growth 0.050048
14.132392 MB  -> growth 0.050824
14.181568 MB  -> growth 0.049176
14.2176 MB  -> growth 0.036032
14.260488 MB  -> growth 0.042888
14.30736 MB  -> growth 0.046872
14.35424 MB  -> growth 0.04688
leak detected: {"growth":183536,"reason":"heap growth over 5 consecutive GCs (6s) - 105.02 mb/hr"}
