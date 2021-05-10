import hasFlag from 'has-flag';
import { MochaMetastore } from './metastore.js';
import { SnapshotManager } from './snapshot/manager.js';
import { Snapshot } from './snapshot/snapshot.js';

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
  const updateSnapshots = hasFlag('--update');
  const mochaMetastore = options.mochaMetastore ?? new MochaMetastore();
  const snapshotManger = new SnapshotManager(mochaMetastore, options.snapshotRoot);

  return (chai, utils) => {
    chai.Assertion.addMethod('matchVerbatimSnapshot', function() {
      const actualValue = this._obj;
      const snapshot = snapshotManger.loadCurrentSnapshot();

      if (!snapshot) {
        // Create new snapshot based on actual test value.
        snapshotManger.saveCurrentSnapshot(new Snapshot(actualValue));
        return;
      }

      // Figure out if we need to update the current snapshot if the current assertion is expected
      // to fail.
      //
      // When .not is present in the assertion chain (expect(...).not.matchVerbatimSnapshot()), then
      // this assertion fails when the actual test value and the snapshot contents DO match. Yet,
      // this case is a no-op because there's no point in "updating" the snapshot's contents with
      // the same contents. Admittedly, this is a weird case, but maybe there's a legit use for it.
      //
      // When .not is absent from the assertion chain, then this assertion fails when the actual
      // test value and the snapshot contents DO NOT match. In this case, we would update the
      // snapshot's contents using the actual test value given, assuming the plugin is configured to
      // update this snapshot's contents.
      const actualMatchesExpected = actualValue === snapshot.contents;

      if (updateSnapshots && !actualMatchesExpected) {
        // Update current snapshot with actual test value.
        snapshotManger.saveCurrentSnapshot(new Snapshot(actualValue));
        return;
      }

      this.assert(
        actualMatchesExpected,
        'Expected actual value to match snapshot contents',
        'Expected actual value to not match snapshot contents',
        snapshot.contents,
        actualValue
      );
    });
  };
};
