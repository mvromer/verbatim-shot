// Input: string (potentially multi-line) computed by test that is subject of expect.
// Input: some identifier for the current test (used for locating snapshot file)
// Input: args or env signifying whether to update snapshot or not (can use has-flag and process.env)

// Req: Write new snapshot file is none exists
// Req: Trigger error if given test subject does not match expected snapshot's contents
// Req: Update snapshots with new given test subject if --update flag is given.
// Req: Fail if test subject is not a string

// installing chai plugin
// - create "snapshot manager"
// - install beforeEach method

// before each test:
//   - cache reference to the current test

// matchSnapshot
//   - build test key: combo of all describe/contexts + test (it/specify) name
//     - can use this.test.fullTitle() possibly, assuming we can get the test's this context easily
//       - this only works if you're processing inside it. you get this via this.currentTest inside
//         the beforeEach hook

export * from './plugin.js';
