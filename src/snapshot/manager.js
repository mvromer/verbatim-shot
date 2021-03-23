import path from 'path';

/**
 * Manage access to snapshots.
 */
export class SnapshotManager {
  /**
   * @param {import('../metastore.js').MochaMetastore} mochaMetastore
   * @param {string} snapshotRoot
   */
  constructor(mochaMetastore, snapshotRoot) {
    this.mochaMetastore = mochaMetastore;
    this.snapshotRoot = SnapshotManager.resolveSnapshotRoot(mochaMetastore, snapshotRoot);
  }

  /**
   * @param {string} givenSnapshotRoot
   * @returns {string}
   */
  static resolveSnapshotRoot(mochaMetastore, givenSnapshotRoot) {
    if (givenSnapshotRoot) {
      return path.resolve(givenSnapshotRoot);
    }

    return path.join(path.resolve(mochaMetastore.testRoots[0]), 'snapshots', 'verbatim');
  }
}
