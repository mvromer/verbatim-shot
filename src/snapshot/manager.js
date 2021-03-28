import fs from 'fs-extra';
import path from 'path';
import { MochaMetastore } from '../metastore.js';
import { Snapshot } from './snapshot.js';

/**
 * Manage access to snapshots.
 */
export class SnapshotManager {
  /**
   * Create a new snapshot manager that manages access to snapshot files located at the given
   * snapshot root.
   *
   * @param {import('../metastore.js').MochaMetastore} mochaMetastore Mocha metastore used to track
   * metadata on the tests whose snapshots are managed by this manager.
   *
   * @param {string} snapshotRoot Optional root directory in which this manager will load and save
   * snapshots. If this is a relative path, then it will be relative to the current working
   * directory. If not given, then the snapshot root will be set to a snapshots/verbatim folder
   * located in the given Mocha metastore's first test root.
   */
  constructor(mochaMetastore, snapshotRoot) {
    this.mochaMetastore = mochaMetastore;
    this.snapshotRoot = SnapshotManager.resolveSnapshotRoot(mochaMetastore, snapshotRoot);

    /** @type Map<string, SnapshotManifest> */
    this._loadedManifests = new Map();
  }

  /**
   * Loads the snapshot for the current Mocha test. The manager uses its Mocha metastore to
   * determine the current Mocha test.
   *
   * @returns {Snapshot} Snapshot for the current Mocha test. If either the snapshot's manifest does
   * not exist, the manifest does not contain an entry for the current test, or the current test's
   * snapshot file does not exist, then this will return null.
   */
  loadCurrentSnapshot() {
    const currentManifest = this._getOrLoadManifest(this.mochaMetastore.currentTestRelativePath);
    const currentSnapshotManifestData = (currentManifest && currentManifest[this.mochaMetastore.currentTestKey]) ?? null;

    if (!currentSnapshotManifestData) {
      return null;
    }

    const currentSnapshotDir = path.join(this.snapshotRoot, this.mochaMetastore.currentTestRelativePath);
    try {
      const snapshotPath = path.join(currentSnapshotDir, currentSnapshotManifestData.fileName);
      return Snapshot.loadFromFile(snapshotPath);
    }
    catch {
      return null;
    }
  }

  _getOrLoadManifest(testRelativePath) {
    const manifest = this._loadedManifests.get(testRelativePath);
    return manifest ?? this._loadManifest(testRelativePath);
  }

  _loadManifest(testRelativePath) {
    const manifestPath = path.join(this.snapshotRoot, testRelativePath, 'manifest.json');
    const manifest = fs.readJsonSync(manifestPath, { throws: false });

    if (manifest) {
      this._loadedManifests.set(testRelativePath, manifest);
    }

    return manifest;
  }

  /**
   * Determines the snapshot root absolute path from the given snapshot root and Mocha metastore.
   *
   * @param {MochaMetastore} mochaMetastore Mocha metastore that will be used to derive the snapshot
   * root if one is not explicitly given.
   *
   * @param {string} givenSnapshotRoot If given, then this will override the snapshot root that
   * would have otherwise been determined from the given Mocha metastore. Otherwise, the snapshot
   * root will be a snapshots/verbatim directory located inside the Mocha metastore's first test
   * root.
   *
   * @returns {string} Absolute path to the resolved snapshot root.
   */
  static resolveSnapshotRoot(mochaMetastore, givenSnapshotRoot) {
    if (givenSnapshotRoot) {
      return path.resolve(givenSnapshotRoot);
    }

    return path.join(path.resolve(mochaMetastore.testRoots[0]), 'snapshots', 'verbatim');
  }
}
