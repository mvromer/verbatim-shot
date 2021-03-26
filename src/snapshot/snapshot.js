import fs from 'fs-extra';
import path from 'path';

/**
 * @typedef SnapshotManifestData
 *
 * @property {string} fileName Name of file storing the snapshot's data. Relative to the snapshot's
 * directory.
 */

/**
 * Represents a single verbatim snapshot.
 */
export class Snapshot {
  constructor(snapshotData) {
    this._snapshotData = snapshotData;
  }

  /**
   * @param {string} snapshotDir Directory to load the snapshot from.
   *
   * @param {SnapshotManifestData} snapshotManifestData Metadata about the snapshot to load pulled
   * from the snapshot's manifest.
   *
   * @returns {Snapshot}
   */
  static loadFrom(snapshotDir, snapshotManifestData) {
    const snapshotPath = path.join(snapshotDir, snapshotManifestData.fileName);
    const snapshotData = fs.readFileSync(snapshotPath, { encoding: 'utf-8' });
    return new Snapshot(snapshotData);
  }
}
