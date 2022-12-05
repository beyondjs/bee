const fetch = require('node-fetch');
const {join} = require('path');
const Compiler = require('./compiler');
const BeeError = require('../error');

module.exports = class {
    #bee;
    #compiler;

    #resource;
    /**
     * The resource identifier of the bundle (ex: @beyond-js/kernel/core)
     * @return {string}
     */
    get resource() {
        return this.#resource;
    }

    #version;
    get version() {
        return this.#version;
    }

    #is; // Can be 'bundle' or 'transversal'
    get is() {
        return this.#is;
    }

    #uri;
    /**
     * If the bundle is not contained in the project, the uri resolves into the node_modules folder
     * If transversal, the uri is just its name (ex: start.js)
     *
     * @return {string}
     */
    get uri() {
        return this.#uri;
    }

    get exports() {
        return this.#compiler?.exports;
    }

    /**
     * Bundle constructor
     *
     * @param bee {object} The BEE instance
     * @param resource {string} The resource identifier of the bundle
     * @param version {number=} The version required by hmr to update a bundle's processor
     */
    constructor(bee, resource, version) {
        this.#bee = bee;
        this.#resource = resource;
        this.#version = version;
        this.#compiler = new Compiler(bee, this);
    }

    #promise;
    #resolve;
    #reject;

    async import() {
        if (this.#promise) return await this.#promise;

        this.#promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        }).catch(() => void 0);

        /**
         * Resolve the url considering if the resource is a transversal or a bundle.
         * If it is a bundle contained in an imported library, add the 'packages/' dir to the url.
         * If it is a bundle contained in the current project, extract the package name.
         * @type {string}
         */
        const url = (() => {
            const {host, project} = this.#bee;
            const version = this.#version;
            let [resource, qs] = this.#resource.split('?');
            qs = qs ? `?${qs}` : '';

            const done = r => r + (version ? `?version=${version}` : '');

            // Transversals must be requested as an absolute resource (ex: /start)
            if (resource.startsWith('/')) return done(`${host}${resource}.json`);

            const {specifier} = project;
            const url = resource.startsWith(`${specifier}/`) ? resource.slice(specifier.length + 1) : `packages/${resource}`;
            return done(`${host}/${url}.json${qs}`);
        })();

        let fetched;
        try {
            (fetched = await fetch(url));
        }
        catch (err) {
            const error = new BeeError(`Resource "${this.#resource}" is invalid.` +
                `Error: "${err.message}".\n` +
                `URL: "${url}"`);
            // this.#reject(error);
            // throw error;

            this.#reject(error.message);
            console.log(error.message);
            return;
        }

        const {status, body} = fetched;
        if (status === 500) {
            const message = body.read();
            const error = new BeeError(`Resource "${this.#resource}" status 500 received.\n` +
                `Error: ${message}\n` +
                `For more information check the following link: "${url}?info"\n`);

            this.#reject(error.message);
            console.log(error.message);
            return;
        }

        let is, script, errors, dependencies;
        try {
            ({is, script, errors, dependencies} = (await fetched.json()));
            dependencies = dependencies ? dependencies : [];
        }
        catch (err) {
            const error = new Error(`Resource "${this.#resource}" is invalid: "${err.message}".\n` +
                `URL: "${url}"`);

            this.#reject(error.message);
            console.log(error.message);
            return;
        }

        if (errors?.length) {
            const error = new Error(`Errors found importing "${this.#resource}".\n` +
                `Errors: ${JSON.stringify(errors)}.\n` +
                `URL: "${url}"`);
            this.#reject(error.message);
            console.log(error.message);
            return;
        }

        // Import the dependencies before compiling the bundle
        const promises = [];
        dependencies.forEach(({resource, kind}) => {
            if (resource === this.#resource) return;
            if (['bundle', 'transversal', 'external', 'beyond.reserved'].includes(kind)) {
                promises.push(this.#bee.import(resource));
            }
        });

        try {
            await Promise.all(promises);
        }
        catch (err) {
            const error = new Error(`Error importing "${this.#resource}":\n` +
                `Dependency error: ${err.message}.\n` +
                `URL: "${url}"`);
            this.#reject(error.message);
            console.log(error.message);
            return;
        }

        this.#is = is;

        this.#uri = (() => {
            const {project} = this.#bee;
            const {specifier} = project;
            const resource = this.#resource;

            const done = uri => join(process.cwd(), `${uri}.js`);

            // If transversal, the uri is just its name (ex: start.js)
            if (is === 'transversal') return done(resource);

            // If the bundle is not contained in the project, the uri resolves into the node_modules folder
            const root = resource.startsWith(`${specifier}/`) ? resource.slice(specifier.length) : `node_modules/${resource}`;
            return done(root);
        })();

        try {
            this.#compiler.compile(script);
        }
        catch (err) {
            const error = new BeeError(`Error compiling bundle "${this.#resource}".\n` +
                `Error: ${err.message}.\n` +
                `For more information check the following link: "${url}"\n`);
            this.#reject(error.message);
            console.log(error.message);
            return;
        }

        this.#resolve(this.#compiler.exports);
        return this.#compiler.exports;
    }
}
