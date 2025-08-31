module.exports = class {
	#bee;
	#resource;

	constructor(bee, resource) {
		this.#bee = bee;

		// Remove the version of the package
		this.#resource = (() => {
			const split = resource.split('/');
			const scope = split[0].startsWith('@') ? split.shift() : void 0;
			const [name] = split.shift().split('@'); // Remove the version
			const subpath = split.join('/');
			return (scope ? `${scope}/${name}` : name) + (subpath ? `/${subpath}` : '');
		})();
	}

	#promise;
	#resolve;
	#reject;

	#exports;
	get exports() {
		return this.#exports;
	}

	async import() {
		if (this.#promise) return await this.#promise;

		this.#promise = new Promise((resolve, reject) => {
			this.#resolve = resolve;
			this.#reject = reject;
		}).catch(() => void 0);

		let exports;
		try {
			const { path } = this.#bee.project;
			let resolved = require.resolve(this.#resource, { paths: [path] });
			exports = require(resolved);
		} catch (err) {
			const error = new Error(`Error importing "${this.#resource}". ${err.message}`);
			this.#reject(error);
			throw error;
		}

		this.#exports = exports;
		this.#resolve(exports);
		return exports;
	}
};
