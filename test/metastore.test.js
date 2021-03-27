import path from 'path';
import { expect } from 'chai';
import chdir from 'chdir';
import tmp from 'tmp-promise';
import withLocalTmpDir from 'with-local-tmp-dir';
import writePackage from 'write-pkg';
import { MochaMetastore } from '../src/metastore.js';

// This basically does the same thing as withLocalTmpDir except it creates its directory inside the
// system's default temp directory (as determined by os.tmpdir()). This is needed because for some
// tests, if a local temp directory is used, this project's Mocha config interferes with how a Mocha
// metastore under test resolves its test roots and other settings derived from the Mocha config.
const withSysTmpDir = (callback) => tmp.withDir(context => chdir(context.path, callback), { unsafeCleanup: true });

describe('Mocha metastore', function() {
  context('currentTestKey property', function() {
    context('when current test is set in beforeEach hook', function() {
      const mochaMetastore = new MochaMetastore();

      beforeEach(function () {
        mochaMetastore.setCurrentTest(this.currentTest);
      });

      it(`should expose current test's key within test spec`, function() {
        expect(mochaMetastore.currentTestKey).to.equal(this.test.fullTitle());
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

        // Stub out an already memoized version of the testRoots property. That way we don't have to
        // worry about any ambient Mocha config influencing this test's outcome.
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

        // Stub out an already memoized version of the testRoots property. That way we don't have to
        // worry about any ambient Mocha config influencing this test's outcome.
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
    context('when no Mocha config given', function() {
      it('should resolve to current working directory', async function() {
        await withSysTmpDir(async () => {
          await writePackage(process.cwd(), {
            name: 'resolver-test'
          });
          const mochaMetastore = new MochaMetastore();
          const expected = [process.cwd()];
          expect(mochaMetastore.testRoots).to.deep.equal(expected);
        });
      });
    });

    context('when Mocha config present', function() {
      it('should resolve to Mocha test root', async function() {
        await withSysTmpDir(async () => {
          await writePackage(process.cwd(), {
            name: 'resolver-test',
            mocha: {
              spec: 'test2/**/*.test.js'
            }
          });
          const mochaMetastore = new MochaMetastore();
          const expected = [path.join(process.cwd(), 'test2')];
          expect(mochaMetastore.testRoots).to.deep.equal(expected);
        });
      });

      it('should resolve to all Mocha test roots', async function() {
        await withSysTmpDir(async () => {
          await writePackage(process.cwd(), {
            name: 'resolver-test',
            mocha: {
              spec: [
                'test/**/*.test.js',
                'more-tests/**/*.test.js'
              ]
            }
          });
          const mochaMetastore = new MochaMetastore();
          const expected = [
            path.join(process.cwd(), 'test'),
            path.join(process.cwd(), 'more-tests')
          ];
          expect(mochaMetastore.testRoots).to.deep.equal(expected);
        });
      });
    });
  });
});
