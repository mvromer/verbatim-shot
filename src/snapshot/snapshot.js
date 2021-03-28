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
   * @param {string} snapshotPath Path of file to load the snapshot from.
   *
   * @returns {Snapshot}
   */
  static loadFromFile(snapshotPath) {
    const snapshotData = fs.readFileSync(snapshotPath, { encoding: 'utf-8' });
    return new Snapshot(snapshotData);
  }
}
