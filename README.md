# @beyond-js/bee

This package enhances the development experience in Node.js by allowing you to interact with the BeyondJS DevServer instead of searching for packages on disk. This allows you to program with HMR (Hot Module Replacement) functionality in a natural and simple way. It also provides support for working with http imports in earlier versions of Node.js.

BeyondJS uses the bee package internally for node projects, and you can adjust it in the project's configuration.

You can instantiate the bee in code created outside of BeyondJS as well and work against the devServer in independent node projects with code similar to the following:

````js
import bee from "@beyond-js/bee";
(async () => {
    try {
        bee("http://localhost:6500", { inspect: 4000 });
    } catch (e) {
        console.error(e);
    }
})();
````

## Contributing

We welcome contributions to `@beyond-js/bee`. If you'd like to contribute, please read
the [Contribution Guidelines](https://beyondjs.com/docs/contributing).

## License

`@beyond-js/bee` is [MIT licensed](LICENSE).

````
# License

The @beyond-js/bee package is licensed under the MIT license. Please see the LICENSE file for more information.
