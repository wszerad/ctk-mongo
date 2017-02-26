const MongoClient = require('mongodb').MongoClient;
const BasicCollection = require('./src/Collection');

let connection = null;

function db(collection) {
	return connection.collection(collection);
}

db.open = function (url) {
	return new Promise((resolve, reject) => {
		MongoClient.connect(url, function (err, handler) {
			if (err)
				return reject(err);

			connection = handler;
			resolve(db);
		});
	});
};

db.close = function () {
	connection.close();
	return db;
};

db.connection = function () {
	return connection;
};

db.prepare = function (collection) {
	collection.db = db;
	let coll = new Collection(collection);

	return coll
		.prepare()
		.then(() => {
			return db;
		});
};

class Collection extends BasicCollection {
	constructor(collectionOptions) {
		collectionOptions.db = db;
		super(collectionOptions);
	}
}


db.Collection = Collection;

module.exports = db;