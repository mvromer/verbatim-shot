import { use as chaiUse } from 'chai';
import { MochaMetastore } from './metastore.js';
import { verbatimSnapshot } from './plugin.js';

const mochaMetastore = new MochaMetastore();

/** @type {Mocha.RootHookObject} */
export const mochaHooks = {
  beforeAll() {
    chaiUse(verbatimSnapshot({ mochaMetastore: mochaMetastore }));
  },

  beforeEach() {
    mochaMetastore.setCurrentTest(this.currentTest);
  }
};
