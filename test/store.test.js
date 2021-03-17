import { expect } from 'chai';
import { CurrentMochaTestStore } from '../src/store.js';

const testStore = new CurrentMochaTestStore();

describe('Current Mocha test store', function () {
  beforeEach(function () {
    testStore.setCurrentTest(this.currentTest);
  });

  it(`should store the same test object that Mocha sets on a test's context`, function () {
    expect(testStore.getCurrentTest()).to.equal(this.test);
  });
});
