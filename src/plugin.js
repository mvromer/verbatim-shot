import { CurrentMochaTestStore } from './store.js';

/**
 * Options used to configure verbatim-shot.
 *
 * @typedef VerbatimShotOptions
 *
 * @property {import('./store.js').CurrentMochaTestStore} testStore Store used for tracking the
 * current Mocha test.
 */

/**
 * @param {VerbatimShotOptions} options Plugin options used to configure verbatim-shot.
 *
 * @returns {Chai.ChaiPlugin}
 */
export const verbatimSnapshot = (options = {}) => {
  const testStore = options.testStore || new CurrentMochaTestStore();

  return (chai, utils) => {
    chai.Assertion.addMethod('matchVerbatimSnapshot', function () {
      console.log(`Inside matcher. Test store get:`);
      console.log(testStore.getCurrentTest());
    });
  };
};
