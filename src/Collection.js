class Collection {
	constructor(collectionOptions) {
		this.name = collectionOptions.name;
		this.schema = collectionOptions.schema || null;
		this.defaults = collectionOptions.defaults || {};
		this.indexes = collectionOptions.indexes || null;
		this.stub = collectionOptions.stub || null;
		this.db = collectionOptions.db;
	}

	cleanCollection() {
		return this.db
			.connection()
			.listCollections()
			.toArray()
			.then((collections) => {
				let has = !!collections.find((col) => {
					return col.name === this.name;
				});

				if (has) {
					return this
						.db(this.name)
						.drop()
				}
			})
			.then(() => {
				return this.db
					.connection()
					.createCollection(this.name);
			});
	}

	createIndexes() {
		let indexes = (typeof this.indexes === 'function') ? this.indexes() : this.indexes || [];

		return Promise
			.resolve(indexes)
			.then((indexes) => {
				return Promise.all(indexes.map((index) => {
					let props = Object.assign({
						w: 1
					}, index);

					return this.db(this.name).createIndex(index.field, props);
				}));
			});
	}

	generateStub() {
		let stub = (typeof this.stub === 'function') ? this.stub() : this.stub || [];

		return Promise
			.resolve(stub)
			.then((stub) => {
				return this.db(this.name).insertMany(stub, {j: true});
			});
	}

	prepare() {
		return this
			.cleanCollection()
			.then(() => {
				return this.generateStub();
			})
			.then(() => {
				return this.createIndexes();
			});
	}

	getDefaults() {
		let defaults = (typeof this.defaults === 'function') ? this.defaults() : this.defaults || {};

		return Promise.resolve(defaults);
	}
}

module.exports = Collection;