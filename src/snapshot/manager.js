import fs from 'fs-extra';
import path from 'path';
import revisionHash from 'rev-hash';
import { MochaMetastore } from '../metastore.js';
import { Snapshot } from './snapshot.js';

/**
 * Manifest entry for a single snapshot.
 *
 * @typedef SnapshotManifestEntry
 *
 * @property {string} fileName Name of the file containing the described snapshot's data.
 */

/**
 * Snapshot manifest.
 *
 * @typedef SnapshotManifest
 * @type {Object.<string, SnapshotManifestEntry>}
 */

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
   * Saves the snapshot for the current Mocha test. The manager uses its Mocha metastore to
   * determine the current Mocha test. The manifest for the current Mocha test file will also be
   * updated.
   *
   * @param {Snapshot} snapshot Snapshot to save.
   */
  saveCurrentSnapshot(snapshot) {
    const currentTestRelativePath = this.mochaMetastore.currentTestRelativePath;
    let currentManifest = this._getOrLoadManifest(currentTestRelativePath);

    // Setup a manifest if one doesn't exist for the current test file.
    if (!currentManifest) {
      currentManifest = {};
      this._loadedManifests.set(currentTestRelativePath, currentManifest);
    }

    const currentTestKey = this.mochaMetastore.currentTestKey;
    let currentManifestEntry = currentManifest[currentTestKey];

    // Setup a manifest entry for the current test if one doesn't exist.
    if (!currentManifestEntry) {
      currentManifestEntry = {};
      currentManifest[currentTestKey] = currentManifestEntry;
    }

    if (!currentManifestEntry.fileName) {
      currentManifestEntry.fileName = this._buildSnapshotFileName(currentTestKey);
    }

    // Ensure the snapshot's directory exists.
    const currentSnapshotDir = path.join(
      this.snapshotRoot,
      currentTestRelativePath
    );
    fs.mkdirpSync(currentSnapshotDir);

    snapshot.save(path.join(currentSnapshotDir, currentManifestEntry.fileName));
    // XXX: May want to think about batching up manifest file updates.
    this._saveManifest(currentManifest, currentTestRelativePath);
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
    const currentManifestEntry = (currentManifest && currentManifest[this.mochaMetastore.currentTestKey]) ?? null;

    if (!currentManifestEntry) {
      return null;
    }

    const currentSnapshotPath = path.join(
      this.snapshotRoot,
      this.mochaMetastore.currentTestRelativePath,
      currentManifestEntry.fileName);

    try {
      return Snapshot.loadFromFile(currentSnapshotPath);
    }
    catch {
      return null;
    }
  }

  /**
   * Gets a previously cached copy of the snapshot manifest for the given test path relative to the
   * snapshot root. If a cached copy doesn't exist, then the snapshot manifest will be loaded,
   * cached, and returned, if it exists.
   *
   * @param {string} testRelativePath Path relative to the snapshot root whose manifest to retrieve.
   *
   * @returns {SnapshotManifest | null} Snapshot manifest for the given test path, if it exists.
   * Otherwise, returns null.
   */
  _getOrLoadManifest(testRelativePath) {
    const manifest = this._loadedManifests.get(testRelativePath);
    return manifest ?? this._loadManifest(testRelativePath);
  }

  /**
   * Loads the snapshot manifest stored at the given test path relative to the snapshot root. The
   * loaded snapshot manifest, if it exists, will be cached so future retrievals using
   * _getOrLoadManifest will be faster.
   *
   * @param {string} testRelativePath Path relative to the snapshot root that contains the manifest
   * to load.
   *
   * @returns {SnapshotManifest|null} Snapshot manifest stored at the given test path, if it
   * exists. Otherwise, returns null.
   */
  _loadManifest(testRelativePath) {
    const manifest = fs.readJsonSync(this._buildManifestPath(testRelativePath), { throws: false });

    if (manifest) {
      this._loadedManifests.set(testRelativePath, manifest);
    }

    return manifest;
  }

  /**
   * Saves the given snapshot manifest to the given test path relative to the snapshot root.
   *
   * @param {SnapshotManifest} Snapshot manifest to save.
   *
   * @param {string} testRelativePath Path relative to the snapshot root to which the manifest will
   * be saved
   *
   * @throws Will throw an error if the snapshot manifest cannot be saved.
   */
  _saveManifest(manifest, testRelativePath) {
    fs.writeJsonSync(this._buildManifestPath(testRelativePath), manifest, { throws: true });
  }

  /**
   * Builds the manifest path for test file with the given path relative to the snapshot root.
   *
   * @returns {string} Absolute path to the manifest for the test file with the given relative path.
   */
  _buildManifestPath(testRelativePath) {
    return path.join(this.snapshotRoot, testRelativePath, 'manifest.json');
  }

  /**
   * Builds a (reasonably) unique name for the snapshot file used to store the snapshot contents of
   * the test with the given key.
   *
   * @param {string} testKey Key of the test whose snapshot data is to be stored in the file with
   * the returned name.
   *
   * @returns {string} Name of the snapshot file used to store the snapshot contents of the test
   * with the given key.
   */
  _buildSnapshotFileName(testKey) {
    return `${revisionHash(testKey)}.txt`;
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
