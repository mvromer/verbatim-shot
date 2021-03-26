// Input: string (potentially multi-line) computed by test that is subject of expect.
// Input: some identifier for the current test (used for locating snapshot file)
// Input: args or env signifying whether to update snapshot or not (can use has-flag and process.env)

// Req: Write new snapshot file is none exists
// Req: Trigger error if given test subject does not match expected snapshot's contents
// Req: Update snapshots with new given test subject if --update flag is given.
// Req: Fail if test subject is not a string

// installing chai plugin
// - create mocha context store
//   - this thing is used by beforeEach to store the mocha context
//   - this thing is used by matchSnapshotVerbatim to get the test key from the mocha context
//
// - create "snapshot manager"
//   - this is used by matchSnapshotVerbatim to retrieve and update snapshot files
//
// - install beforeEach method

// before each test:
//   - cache reference to the current test

// matchSnapshot
//   - build test key: combo of all describe/contexts + test (it/specify) name
//     - can use this.test.fullTitle() possibly, assuming we can get the test's this context easily
//       - this only works if you're processing inside it. you get this via this.currentTest inside
//         the beforeEach hook

// snapshot storage
// /<snapshot root>/
//   /verbatim/
//     /path/relative/to/test/root/foo.test.js/
//       /snap01.txt
//       /snap02.txt
//       /  ...

// snapshot file format:
//
// ##<test key>
// <snapshot contents>

// XXX: need to think about how to design the snapshot manager...
// - need to determine root path for snapshots
//   - configurable via option
//     - look at cosmiconfig for this. for now pull config from package.json
//   - default to finding the root test path
//     - use mocha loadOptions to load an object
//       - the 'spec' property appears to be under the _ property name. why? reasons..
//         - this is a glob
//         - can use glob-parent to determine base path. this can be the root test path
// - other operations:
//   - load snapshot for current test
//   - save snapshot for current test
//
// other behaviors:
// - if a test key currently does not have a stored snapshot, then create a new snapshot from its
//   given contents
// - if a test key does have a snapshot, then need to diff the snapshot with the test key's given
//   content
// - if a test key does have a snapshot and the update setting in enabled, then need to update the
//   test key's snapshot with the given content.

export * from './plugin.js';
