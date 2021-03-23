import path from 'path';
import { loadOptions } from 'mocha/lib/cli/options.js';
import parseGlob from 'parse-glob';

/**
 * Tracks and exposes metadata about the current Mocha invocation.
 */
export class MochaMetastore {
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

  /**
   * @returns {string[]}
   */
  get testRoots() {
    // As of Mocha 8.3.2, the spec paths given to Mocha are on the _ property of the loaded options.
    const mochaOptions = loadOptions();

    /** @type string[] */
    const specPaths = mochaOptions._ ?? [];
    const testRoots = (specPaths.length > 0 ? specPaths : [process.cwd()])
      .map(specPath => {
        const parsedGlob = parseGlob(specPath);
        return path.resolve(parsedGlob.is.glob ? parsedGlob.base : parsedGlob.orig);
      });

    // Memoize the property.
    Object.defineProperty(this, 'testRoots', {
      value: testRoots,
      writable: false
    });

    return this.testRoots;
  }
}
