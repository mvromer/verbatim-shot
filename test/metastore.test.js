import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import writePackage from 'write-pkg';
import { MochaMetastore } from '../src/metastore.js';

describe('Mocha metastore', function() {
  context('currentTestKey property', function() {
    const mochaMetastore = new MochaMetastore();

    context('when current test is set in beforeEach hook', function() {
      let testFullName = null;

      beforeEach(function () {
        testFullName = this.currentTest.fullTitle();
        mochaMetastore.setCurrentTest(this.currentTest);
      });

      it(`should expose current test's key within test spec`, function() {
        expect(mochaMetastore.currentTestKey).to.equal(testFullName);
      });
    });
  });

  context('currentTestRelativePath property', function() {
    context('when current test is not set', function() {
      it('should throw an error', function() {
        const mochaMetastore = new MochaMetastore();
        expect(() => mochaMetastore.currentTestRelativePath).to.throw();
      });
    });

    context('when current test has unique test root', function() {
      it('should return path relative to configured test root', function() {
        const testRoots = ['C:\\resolver-test\\test'];
        const testFile = 'test.js';

        const mochaMetastore = new MochaMetastore();
        Object.defineProperty(mochaMetastore, 'testRoots', {
          value: testRoots,
          writable: false
        });

        const mochaTestStub = {
          file: path.join(testRoots[0], testFile)
        };

        mochaMetastore.setCurrentTest(mochaTestStub);
        expect(mochaMetastore.currentTestRelativePath).to.equal(testFile);
      });
    });

    context('when current test has multiple matching test roots', function() {
      it('should return path relative to longest matching test root', function() {
        const testRoots = [
          'C:\\resolver-test\\test\\deeper',
          'C:\\resolver-test\\test'
        ];
        const testFile = 'test.js';

        const mochaMetastore = new MochaMetastore();
        Object.defineProperty(mochaMetastore, 'testRoots', {
          value: testRoots,
          writable: false
        });

        const mochaTestStub = {
          file: path.join(testRoots[0], testFile)
        };

        mochaMetastore.setCurrentTest(mochaTestStub);
        expect(mochaMetastore.currentTestRelativePath).to.equal(testFile);
      });
    });
  });

  context('testRoots property', function() {
    let mochaMetastore;
    let originalPath;
    let testPath;

    beforeEach(async function() {
      mochaMetastore = new MochaMetastore();
      originalPath = process.cwd();
      testPath = await fs.mkdtemp(path.join(os.tmpdir(), 'verbatim-shot'));
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
