module.exports = class {
	#bee;

	constructor(bee) {
		this.#bee = bee;
	}

	async get(module) {
		const { host, project } = this.#bee;
		const { specifier } = project;

		let url = module.startsWith(`${specifier}/`) ? module.slice(specifier.length + 1) : `packages/${module}`;
		url = `${host}/${url}.json?bridges`;

		const fetched = await fetch(url);
		return await fetched.json();
	}
};
