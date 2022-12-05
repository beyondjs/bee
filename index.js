const Bundle = require('./bundle');
const External = require('./external');
const Project = require('./project');
const Bridges = require('./bridges');
const http = require('http');

/**
 * The collection of BeyondJS bundles imported by the project
 */
module.exports = (host, {inspect}) => new class extends Map {
    #host;
    get host() {
        return this.#host;
    }

    #project;
    get project() {
        return this.#project;
    }

    // The bundle @beyond-js/kernel/bundle
    #bkb;
    get bkb() {
        return this.#bkb;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #resolve;
    #ready = new Promise(resolve => this.#resolve = resolve);
    get ready() {
        return this.#ready;
    }

    constructor() {
        super();
        this.#host = host;
        this.#project = new Project(host);

        require('./bimport')(this);

        const bridges = new Bridges(this);
        Object.defineProperty(global, '__bridges', {get: () => bridges});

        this.#initialise().catch(err => console.log(err));
    }

    #initialised = false;

    async #initialise() {
        if (this.#initialised) throw new Error('Object already initialised');
        this.#initialised = true;

        const check = await (() => new Promise(resolve =>
            http.get(this.#host, r => resolve(true)).on('error', e => resolve(false))
        ))();
        if (!check) {
            console.error(`Could not connect to the BeyondJS dev server: "${this.#host}".\n` +
                `Verify that beyond is running in the project folder.`);
            return;
        }

        await this.#project.fetch();
        if (this.#project.error) return;

        const {specifier, vspecifier, version} = this.#project;
        Object.defineProperty(globalThis, '__app_package', {get: () => ({specifier, vspecifier, version})});

        // Import @beyond-js/kernel/bundle as it is required by brequire
        this.#bkb = await this.import('@beyond-js/kernel/bundle');
        if (inspect) {
            const {local} = await this.import('@beyond-js/local/main');
            local.register(inspect);
        }

        this.#resolve();
    }

    /**
     * Import a BeyondJS bundle
     *
     * @param resource {string} The resource identifier of the bundle
     * @param version {number=} The version required by hmr to update a bundle's processor
     * @return {Promise<*>}
     */
    async import(resource, version) {
        if (!resource) throw new Error('bimport() requires a specifier');
        if (typeof resource !== 'string') throw new Error(`bimport "${typeof resource}" specifier is invalid`);

        const qs = (() => {
            if (!version) return '';
            return (resource.includes('?') ? '&' : '?') + `version=${version}`;
        })();
        const key = resource + qs;

        const bundle = (() => {
            if (this.has(key)) return this.get(key);

            const {project} = this;
            const {transversals} = project;

            // Check for transversals and config.js
            if (resource.startsWith('/')) {
                const transversal = resource.slice(1);
                if (resource !== '/config' && !transversals.includes(transversal)) {
                    throw new Error(`Cannot find resource "${resource}"`);
                }
                return new Bundle(this, resource);
            }

            const split = resource.split('/');
            const scope = split[0].startsWith('@') ? split.shift() : void 0;
            const [name, version] = split.shift().split('@');
            const pkg = scope ? `${scope}/${name}` : name;
            const subpath = split.join('/');
            const module = subpath ? `${pkg}/${subpath}` : pkg;

            return (pkg === project.specifier || project.libraries.includes(pkg)) ?
                   new Bundle(this, module, version) : new External(this, resource);
        })();

        this.set(key, bundle);

        try {
            await bundle.import();
        }
        catch (err) {
            console.log(err.stack);
            throw new Error(err.message);
        }

        return bundle.exports;
    }
}
