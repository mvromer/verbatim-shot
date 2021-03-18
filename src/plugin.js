import { MochaTestMetaStore } from './test-meta.js';

/**
 * Options used to configure verbatim-shot.
 *
 * @typedef VerbatimShotOptions
 *
 * @property {import('./test-meta.js').MochaTestMetaStore} testMetaStore Store used for tracking and
 * exposing metadata about the current Mocha test.
 */

/**
 * @param {VerbatimShotOptions} options Plugin options used to configure verbatim-shot.
 *
 * @returns {Chai.ChaiPlugin}
 */
export const verbatimSnapshot = (options = {}) => {
  const testMetaStore = options.testMetaStore || new MochaTestMetaStore();

  return (chai, utils) => {
    chai.Assertion.addMethod('matchVerbatimSnapshot', function () {
      console.log(`Inside matcher. Current test key: ${testMetaStore.testKey}`);
    });
  };
};
