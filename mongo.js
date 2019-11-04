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
    },
    getAnnouncement: function (versione, cb) {
        MongoClient.connect(process.env.MONGO_URL, function (err, db) {
            db.db().collection('annunci').findOneAndDelete({
                versione: versione
            }, function (err, doc) {
                cb(doc && doc.value ? doc.value : null);
            });
            db.close();
        });
    }
};