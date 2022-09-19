const fetch = require('node-fetch');

module.exports = class {
    #bee;

    constructor(bee) {
        this.#bee = bee;
    }

    async get(module) {
        const {host, project} = this.#bee;
        const {pkg} = project;

        let url = module.startsWith(`${pkg}/`) ? module.slice(pkg.length + 1) : `packages/${module}`;
        url = `${host}/${url}.json?bridges`;

        const fetched = await fetch(url);
        return await fetched.json();
    }
}
