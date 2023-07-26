const NodeModule = require('module');

module.exports = class {
	#bee;
	#bundle;
	#compiled;

	get exports() {
		return this.#compiled?.exports;
	}

	constructor(bee, bundle) {
		this.#bee = bee;
		this.#bundle = bundle;
	}

	#require = resource => {
		try {
			return brequire(resource);
		} catch (exc) {
			throw new Error(exc.message + ` from "${this.#bundle.resource}"`);
		}
	};

	compile(code) {
		const module = new NodeModule(this.#bundle.uri);
		module.require = this.#require;

		module._compile(code, this.#bundle.uri);
		this.#compiled = module;
	}
};
