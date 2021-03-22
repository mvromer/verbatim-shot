import { MochaTestMetaStore } from './test-meta.js';
import { resolveSnapshotRoot, resolveTestRoots } from './resolve.js';

/**
 * Options used to configure verbatim-shot.
 *
 * @typedef VerbatimShotOptions
 *
 * @property {import('./test-meta.js').MochaTestMetaStore} testMetaStore Store used for tracking and
 * exposing metadata about the current Mocha test.
 *
 * @property {string} snapshotRoot Path to the root directory containing your verbatim snapshots. If
 * not given, then verbatim snapshots will be placed in <testRoot>/snapshots/verbatim, where
 * <testRoot> will be determined from the first spec path given to Mocha. If that spec path is a
 * glob, then the glob's base path will be used for <testRoot>. If no spec paths were given to
 * Mocha, then <testRoot> defaults to process.cwd().
 */

/**
 * @param {VerbatimShotOptions} options Plugin options used to configure verbatim-shot.
 *
 * @returns {Chai.ChaiPlugin}
 */
export const verbatimSnapshot = (options = {}) => {
  const testMetaStore = options.testMetaStore ?? new MochaTestMetaStore();
  const testRoots = resolveTestRoots();
  const snapshotRoot = resolveSnapshotRoot(testRoots, options.snapshotRoot);

  return (chai, utils) => {
    chai.Assertion.addMethod('matchVerbatimSnapshot', function () {
      console.log(`Inside matcher. Current test key: ${testMetaStore.testKey}`);
    });
  };
};
