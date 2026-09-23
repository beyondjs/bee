# Testing

This repository has no assertion suite and no test runner. `test/` holds two legacy manual smoke scripts that load a module from a running development server through `@beyond-js/bee` and print what they receive; they assert nothing and no automated validation runs them. A run is a manual observation of the loader against a server started separately, not evidence of a contract.

## Levels and commands

| Level | Location | Command | Prerequisites | What a run shows |
| --- | --- | --- | --- | --- |
| Contract/unit, integration and acceptance | None in this repository | None | None | Nothing is asserted here |
| Manual smoke: widget import | `test/widget/index.js` | `node test/widget/index.js`, from a directory where `@beyond-js/bee` resolves | A development server at `http://localhost:6501` serving `@beyond-js/counter-react-widget/hello`, which this repository does not supply | The imported `message` printed to the console |
| Manual smoke: bundle loader | `test/bundle-loader/` | `beyond run` inside `test/bundle-loader/package/`, then `node --enable-source-maps ../index.js` from the same directory, as [its README](../test/bundle-loader/README.md) describes | The legacy Beyond command (Engine) and the dependencies `package/package.json` declares; the backend distribution serves bundles on port 5070 | The module `@beyond-js/playground/test` loaded and run; its deliberate exception lets a person read the stack against the source maps |

## Fixtures

| Group | Files | Used by | Expected behavior |
| --- | --- | --- | --- |
| `test/bundle-loader/package/` | `beyond.json`, `package.json` (`@beyond-js/playground`, a `backend` distribution), `modules/test/module.json`, `modules/test/index.ts`, `modules/test/tsconfig.json` | `test/bundle-loader/index.js` | `Test.run()` throws `this is a exception from DB/login` on purpose; that thrown error is the case under observation |

## Exceptions and limits

- Both scripts are legacy manual checks kept unmodified as reference. They have no runner and no assertions, depend on a server started by hand and on fixed ports, and are not validation of this package.
- The layout predates the suite convention: `test/` holds manual scripts rather than `*.test.*` files, and the served package sits in `test/bundle-loader/package/` rather than in a `fixtures/` directory. It is kept as it is because it is legacy reference material.
- `test/bundle-loader/` is byte-identical to `tests/bundle-loader/` of the Engine repository (an optional external reference), verified by a recursive comparison on 2026-09-22. The two independent repositories each keep their copy; neither is removed, and a change to one is not reflected in the other.
- A manual run starts the server inside the checked-in package; its `.beyond/` output is ignored by Git, but other state a run leaves next to the sources is not. Copy the package to a temporary directory first when the checkout must stay unchanged.
- `package.json` declares no `files` list and the repository has no `.npmignore`, so a published package would include `test/`.

## Test organization and source fixtures

These rules are shared by every Beyond repository.

- Contract/unit and integration tests live in `test/` or `tests/`; complete journeys against an installed, composed or exported product live in `acceptance/`, with a README of their own. Harness infrastructure (servers, registries, process lifecycle, copying and substitution) lives in a `support/` directory of the consuming area.
- Applications, packages, modules, documents and assets a test exercises are checked-in files with their real extensions and directory structure under the consuming area's `fixtures/`. Each fixture group has a README naming its purpose, entry modules, the tests that use it, their command, the expected behavior and any intentionally invalid part. A reader inspects the example without running or decoding a generator.
- A harness copies the fixtures it runs or edits to a unique temporary directory, substitutes only explicit values such as versions, ports or origins, and never writes the checked-in files, even when a run fails. Credentials, machine paths and build output are never fixture source.
- Small input values, expected values, protocol payloads and short edits stay inline. Source is generated only when generation is the behavior under test (size or memory stress, combinations, deliberately malformed input); the guide states why, the parameters that reproduce it and how to inspect what was generated.
- Fixtures stay out of the repository's production compilation, discovery and packaging.
- Migrating a test preserves its scenario identities, its positive, negative and recovery cases and its real execution path; an existing failure stays reported as a failure.
