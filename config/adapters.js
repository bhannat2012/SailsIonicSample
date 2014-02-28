
module.exports.adapters = {
  'default': 'mongo',

  // sails v.0.9.0
  mongo: {
    
    module   : 'sails-mongo',
    host     : 'ds027749.mongolab.com',
    port     : 27749,
    user     : 'algo',
    password : 'algo#12',
    database : 'algonode'
    // OR
    // module   : 'sails-mongo',
    // url      : 'mongodb://algo:algo#12@ds027749.mongolab.com:27749/algonode',

    // Replica Set (optional)
    // replSet: {
    //   servers: [
    //     {
    //       host: 'secondary1.localhost',
    //       port: 27017 // Will override port from default config (optional)
    //     },
    //     {
    //       host: 'secondary2.localhost',
    //       port: 27017
    //     }
    //   ],
    //   options: {} // See http://mongodb.github.io/node-mongodb-native/api-generated/replset.html (optional)
    // }
  }

  // // sails v.0.8.x
  // mongo: {
  //   module   : 'sails-mongo',
  //   url      : 'mongodb://algo:algo#12@ds027749.mongolab.com:27749/algonode',
  // }
};