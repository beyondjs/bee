/**
 * bimport overrides the bimport function exposed in @beyond-js/kernel/bundle
 */
module.exports = bee => {
    require('./brequire')(bee);

    async function bimport(resource, version) {
        await bee.ready;

        // Check if resource is already imported or if it is an internal node module (ex: 'http', 'url', etc)
        const brequired = globalThis.brequire(resource);
        if (brequired) return brequired;

        return await bee.import(resource, version);
    }

    async function breload(resource, version) {
        return await bimport(resource, version);
    }

    Object.defineProperty(global, 'bimport', {get: () => bimport});
    Object.defineProperty(global, 'breload', {get: () => breload});
}
