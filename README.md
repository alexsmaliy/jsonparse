What
===

This is a hand-written JSON parser, which means it's probably not standards-compliant.

Dependencies
===

Code is written in TypeScript 4.5.x. It would have been a peer dependency in `package.json` had `ts-mocha` not wanted it installed as a dev dependency.

This repository uses Parcel for creating a code bundle and running a dev server (for in-browser debugging).

Unit tests use Mocha (or, rather, `ts-mocha`).

Dependencies are managed with Yarn.

Running
===

Check the scripts section in `package.json`.

At the moment, `yarn dev` runs Parcel, `yarn check` runs `tsc` in no-emit mode, and `yarn test` runs the Mocha tests.
