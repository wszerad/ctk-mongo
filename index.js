const MongoClient = require('mongodb').MongoClient;
const BasicCollection = require('./src/Collection');

let connection = null;

function db(collection) {
	if(!connection) throw new Error('Setup database connection first!');

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
	if(!connection) throw new Error('Setup database connection first!');

	connection.close();
	return db;
};

db.connection = function () {
	if(!connection) throw new Error('Setup database connection first!');

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