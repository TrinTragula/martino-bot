const MongoClient = require('mongodb').MongoClient;
var _db;
module.exports = {
    connectToServer: function (callback) {
        MongoClient.connect(process.env.MONGO_URL, function (err, db) {
            _db = db;
            return callback(err);
        });
    },
    getDb: function () {
        return _db;
    },
    insert: function (obj) {
        MongoClient.connect(process.env.MONGO_URL, function (err, db) {
            db.db().collection('comandi').insertOne(obj);
            db.close();
        });
    }
};