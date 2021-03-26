import path from 'path';

/**
 * Snapshot manifest.
 *
 * @typedef SnapshotManifest
 *
 * @property {string} foo
 */

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

    /** @type Map<string, SnapshotManifest> */
    this._loadedManifests = new Map();
  }

  loadCurrentSnapshot() {
    const currentSnapshotDir = path.join(this.snapshotRoot, this.mochaMetastore.currentTestRelativePath);
    const currentSnapshotManifestPath = path.join(currentSnapshotDir, 'manifest.json');
  }

  _getOrLoadManifest(testRelativePath) {
    const manifest = this._loadedManifests.get(testRelativePath);
    return manifest ?? this._loadedManifests(testRelativePath);
  }

  _loadManifest(testRelativePath) {
    const snapshotDir = path.join(this.snapshotRoot, testRelativePath);
    const manifestPath = path.join(snapshotDir, 'manifest.json');
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
