import { use as chaiUse } from 'chai';
import { MochaTestMetaStore } from './test-meta.js';
import { verbatimSnapshot } from './plugin.js';

const testMetaStore = new MochaTestMetaStore();

/** @type {Mocha.RootHookObject} */
export const mochaHooks = {
  beforeAll() {
    chaiUse(verbatimSnapshot({ testMetaStore: testMetaStore }));
  },

  beforeEach() {
    testMetaStore.setCurrentTest(this.currentTest);
  }
};
