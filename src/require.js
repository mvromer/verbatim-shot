import { use as chaiUse } from 'chai';
import { verbatimSnapshot } from './plugin.js';

export const mochaHooks = {
  beforeAll() {
    chaiUse(verbatimSnapshot());
  }
};
