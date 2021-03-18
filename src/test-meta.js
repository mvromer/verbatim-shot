/**
 * Tracks a Mocha test object and exposes metadata about it to the test helpers provided by this
 * plugin.
 */
export class MochaTestMetaStore {
  constructor() {
    this.currentTest = null;
  }

  /**
   * Sets the Mocha test object to track.
   *
   * @param {Mocha.Test} test New Mocha test object to track.
   */
  setCurrentTest(test) {
    this.currentTest = test;
  }

  get testKey() {
    return this.currentTest?.fullTitle() ?? '';
  }
}
