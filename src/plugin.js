import { MochaMetastore } from './metastore.js';
import { SnapshotManager } from './snapshot/manager.js';

/**
 * Options used to configure verbatim-shot.
 *
 * @typedef VerbatimShotOptions
 *
 * @property {import('./metastore.js').MochaMetastore} mochaMetastore Store used for tracking and
 * exposing metadata about the current Mocha invocation.
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
  const mochaMetastore = options.mochaMetastore ?? new MochaMetastore();
  const snapshotManger = new SnapshotManager(mochaMetastore);

  return (chai, utils) => {
    chai.Assertion.addMethod('matchVerbatimSnapshot', function () {
      // this._obj is the value in expect() call.

      // Get snapshot of current test.
    });
  };
};
