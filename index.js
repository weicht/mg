const mongoose = require('mongoose');
const memwatch = require('@dmfenton/node-memwatch');
const ConnectionState = require('mongoose/lib/connectionstate');
const Schema = require('mongoose/lib/schema');

const NUM_ATTEMPTS = 10;

const FakeSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  resource: {
    type: String,
    default: 'Fake',
  },
});

const config = {
  user: 'mlab',
  pass: 'mlab2019',
  auth: {
    authdb: 'heroku_0zjh8fcf',
  },
  host: 'ds211268.mlab.com',
  port: '11268',
  database: 'heroku_0zjh8fcf',  options: {
    poolSize: 10, // default=5
    promiseLibrary: global.Promise,
    useNewUrlParser: true,
    useCreateIndex: true,
  },
};

const murl = `mongodb://${encodeURIComponent(config.user)}:${encodeURIComponent(config.pass)}@${config.host}:${config.port}/${config.database}`;

const beginning = new Date();
function msFromBeginning() {
  return new Date() - beginning;
}

const HEAP_SIZES = [];
// according to memwatch, a "leak" is defined as:
//   ‘A leak event will be emitted when your heap usage has
//    increased for five consecutive garbage collections.’
memwatch.on('leak', (info) => {
  console.log(`leak detected: ${JSON.stringify(info)}`);
  // process.exit(1);
});
memwatch.on('stats', (stats) => {
  // console.log('# post GC: ', msFromBeginning(), stats.current_base);
  HEAP_SIZES.push(stats.current_base);
});

// // garbage collector (every second)
// setInterval(() => {
//   try { global.gc(); } catch (gcerr) { }
// }, 1000);

const main = async () => {
  for (let i = 0; i < NUM_ATTEMPTS; i += 1) {
    const hd = new memwatch.HeapDiff();

    console.log('opening connection');
    const connection = await mongoose.createConnection(murl, config.options)
      .then((conn) => {
        /* istanbul ignore next */
        if (conn.readyState !== ConnectionState.connected) {
          throw 'Mongoose could not establish connection';
        }
        conn.on('disconnected', () => {
          console.log('mongoose connection: disconnected');
        });
        conn.on('close', () => {
          console.log('mongoose connection: closed');
        });
        return conn;
      })
      .catch((err) => {
        throw err;
      });

    console.log('creating model');
    const FakeModel = await connection.model('FakeModel', FakeSchema);

    Object.keys(connection.models).forEach((model) => {
      delete connection.models[model];
    });
    Object.keys(connection.collections).forEach((collection) => {
      delete connection.collections[collection];
    });
    Object.keys(connection.base.modelSchemas).forEach((modelSchema) => {
      delete connection.base.modelSchemas[modelSchema];
    });

    console.log('closing connection');
    await connection.close();

    console.log('forcing garbage collection');
    await global.gc();

    const diff = hd.end();
    //      console.log(`heapdiff:  ${JSON.stringify(diff, null, 2)}`);
    console.log(`=> Heap total:  ${diff.after.size}\n=> Heap change:  ${diff.change.size}\n####`);
  }

  for( let i = 0; i < HEAP_SIZES.length; i += 1 ){
    console.log(`${HEAP_SIZES[i] / 1000000} MB  -> growth ${i > 0 ? (HEAP_SIZES[i]-HEAP_SIZES[i-1])/1000000 : 0}`);
  }
};


main();
