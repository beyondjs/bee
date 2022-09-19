const fetch = require('node-fetch');

module.exports = class {
    #host;
    #data;

    get specifier() {
        return this.#data?.specifier;
    }

    get vspecifier() {
        return this.#data?.vspecifier;
    }

    get version() {
        return this.#data?.version;
    }

    get path() {
        return this.#data?.path;
    }

    get libraries() {
        return this.#data?.libraries;
    }

    get transversals() {
        return this.#data?.transversals;
    }

    #error;
    get error() {
        return this.#error;
    }

    async fetch() {
        const url = `${this.#host}/project.json`;

        try {
            const fetched = await fetch(url);
            this.#data = await fetched.json();
        }
        catch (exc) {
            console.log(`Error requesting project metadata: ${exc.message}.\n` +
                `URL: ${url}`);
            this.#error = exc.message;
        }
    }

    constructor(host) {
        this.#host = host;
    }
}