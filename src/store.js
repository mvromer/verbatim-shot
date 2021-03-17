/**
 * Stores and retrieves the current Mocha test object needed by the test helpers exposed by this
 * plugin.
 */
export class CurrentMochaTestStore {
  constructor() {
    this.currentTest = null;
  }

  /**
   * Get the most recently set current Mocha test object.
   *
   * @returns {Mocha.Test} Most recent Mocha test object set with setCurrentTest. If no such object
   * has been set, then returns null.
   */
  getCurrentTest() {
    return this.currentTest;
  }

  /**
   * Sets the current Mocha test object.
   *
   * @param {Mocha.Test} test New Mocha test object to set.
   */
  setCurrentTest(test) {
    this.currentTest = test;
  }
}
