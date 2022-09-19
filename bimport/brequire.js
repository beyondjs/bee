const {builtinModules: builtin} = require('module');

/**
 * Require a previously loaded bundle synchronously:
 * (can be a project bundle or library bundle, or an external bundle).
 *
 * It is used internally by:
 * . The ims require function (look at @beyond-js/kernel/bundle)
 * . The require function of the BEE compiled bundles (look at the @beyond-js/bee => bundle/compiler)
 *
 * Find more on @beyond-js/kernel/bundle
 */
module.exports = bee => {
    function brequire(resource) {
        // Check if resource is '@beyond-js/kernel/bundle'
        if (resource === '@beyond-js/kernel/bundle') return bee.bkb;

        // Check if it is a previously imported resource
        if (bee.has(resource)) return bee.get(resource).exports;

        // Check if it is a node builtin module (ex: 'url', 'http', etc);
        if (builtin.includes(resource)) return require(resource);
    }

    Object.defineProperty(global, 'brequire', {get: () => brequire});
}
