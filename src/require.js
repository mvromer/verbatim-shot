import { use as chaiUse } from 'chai';
import { CurrentMochaTestStore } from './store.js';
import { verbatimSnapshot } from './plugin.js';

const testStore = new CurrentMochaTestStore();

/** @type {Mocha.RootHookObject} */
export const mochaHooks = {
  beforeAll() {
    chaiUse(verbatimSnapshot({ testStore }));
  },

  beforeEach() {
    testStore.setCurrentTest(this.currentTest);
  }
};
