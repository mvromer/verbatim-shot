import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import writePackage from 'write-pkg';
import { MochaMetastore } from '../src/metastore.js';

describe('Mocha metastore', function() {
  context('current test metadata', function() {
    const mochaMetastore = new MochaMetastore();

    context('when current test is set in beforeEach hook', function() {
      let testFullName = null;

      beforeEach(function () {
        testFullName = this.currentTest.fullTitle();
        mochaMetastore.setCurrentTest(this.currentTest);
      });

      it(`should expose current test's key within test spec`, function() {
        expect(mochaMetastore.testKey).to.equal(testFullName);
      });
    });
  });

  context('testRoots property', function() {
    let mochaMetastore;
    let testPathPrefix;
    let originalPath;
    let testPath;

    before(function() {
      testPathPrefix = path.join(os.tmpdir(), 'verbatim-shot');
    });

    beforeEach(async function() {
      mochaMetastore = new MochaMetastore();
      originalPath = process.cwd();
      testPath = await fs.mkdtemp(testPathPrefix);
      process.chdir(testPath);
    });

    afterEach(async function() {
      process.chdir(originalPath);
      await fs.rmdir(testPath, { recursive: true });
    });

    context('when no Mocha config given', function() {
      it('should resolve to current working directory', async function() {
        await writePackage(testPath, {
          name: 'resolver-test'
        });
        const expected = [process.cwd()];
        expect(mochaMetastore.testRoots).to.deep.equal(expected);
      });
    });

    context('when Mocha config present', function() {
      it('should resolve to Mocha test root', async function() {
        await writePackage(testPath, {
          name: 'resolver-test',
          mocha: {
            spec: 'test/**/*.test.js'
          }
        });
        const expected = [path.join(process.cwd(), 'test')];
        expect(mochaMetastore.testRoots).to.deep.equal(expected);
      });

      it('should resolve to all Mocha test roots', async function() {
        await writePackage(testPath, {
          name: 'resolver-test',
          mocha: {
            spec: [
              'test/**/*.test.js',
              'more-tests/**/*.test.js'
            ]
          }
        });
        const expected = [
          path.join(process.cwd(), 'test'),
          path.join(process.cwd(), 'more-tests')
        ];
        expect(mochaMetastore.testRoots).to.deep.equal(expected);
      });
    });
  });
});
