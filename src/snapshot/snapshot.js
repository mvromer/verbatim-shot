import fs from 'fs-extra';

/**
 * @typedef SnapshotManifestData
 *
 * @property {string} fileName Name of file storing the snapshot's data. Relative to the snapshot's
 * directory.
 */

/**
 * Represents a single verbatim snapshot. After construction, a Snapshot instance's contents are
 * immutable.
 */
export class Snapshot {
  /**
   * @param {string} snapshotContents
   */
  constructor(snapshotContents) {
    this._contents = snapshotContents;
  }

  /**
   * Returns the snapshot's contents.
   *
   * @returns {string}
   */
  get contents() {
    return this._contents;
  }

  /**
   * Saves this snapshot's contents to the given path as a string of UTF-8 text.
   *
   * @param {string} snapshotPath Path of file to save this snapshot's contents.
   */
  save(snapshotPath) {
    fs.writeFileSync(snapshotPath, this._contents, { encoding: 'utf-8' });
  }

  /**
   * Reads the contents of the given path as a UTF-8 string and uses it to construct a new
   * {@link Snapshot}, using the read string as the new snapshot's contents.
   *
   * @param {string} snapshotPath Path of file to load the snapshot from.
   *
   * @returns {Snapshot} Snapshot with contents set equal to the UTF-8 contents read from the file
   * at the given path.
   */
  static loadFromFile(snapshotPath) {
    const snapshotContents = fs.readFileSync(snapshotPath, { encoding: 'utf-8' });
    return new Snapshot(snapshotContents);
  }
}
