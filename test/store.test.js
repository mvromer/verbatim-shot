import { expect } from 'chai';
import { MochaTestMetaStore } from '../src/test-meta.js';

const testMetaStore = new MochaTestMetaStore();

describe('Current Mocha test store', function () {
  let testFullName = null;

  beforeEach(function () {
    testFullName = this.currentTest.fullTitle();
    testMetaStore.setCurrentTest(this.currentTest);
  });

  it(`should store the same test object that Mocha sets on a test's context`, function () {
    expect(testMetaStore.testKey).to.equal(testFullName);
  });
});
