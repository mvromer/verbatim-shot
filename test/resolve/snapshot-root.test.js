import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import writePackage from 'write-pkg';
import { resolveSnapshotRoot } from '../../src/resolve.js';

describe('Snapshot root resolver', function() {
  context('when given relative path', function() {
    it('should resolve to absolute path using current working directory', function() {
      const snapshotRoot = 'snapshots';
      const testRoots = [process.cwd()];
      const expected = path.join(process.cwd(), snapshotRoot);
      expect(resolveSnapshotRoot(testRoots, snapshotRoot)).to.equal(expected);
    });
  });

  context('when given absolute path', function() {
    it('should resolve to given path', function() {
      const snapshotRoot = path.join(process.cwd(), 'snapshots');
      const testRoots = [process.cwd()];
      expect(resolveSnapshotRoot(testRoots, snapshotRoot)).to.equal(snapshotRoot);
    });
  });

  context('when given no path', function() {
    let testPathPrefix;
    let originalPath;
    let testPath;

    before(function() {
      testPathPrefix = path.join(os.tmpdir(), 'verbatim-shot');
    });

    beforeEach(async function() {
      originalPath = process.cwd();
      testPath = await fs.mkdtemp(testPathPrefix);
      process.chdir(testPath);
    });

    afterEach(async function() {
      process.chdir(originalPath);
      await fs.rmdir(testPath, { recursive: true });
    });

    context('when no Mocha config given', function() {
      it('should resolve snapshots/verbatim within current working directory', async function() {
        await writePackage(testPath, {
          name: 'resolver-test'
        });
        const testRoots = [testPath];
        const expected = path.join(process.cwd(), 'snapshots', 'verbatim');
        expect(resolveSnapshotRoot(testRoots)).to.equal(expected);
      });
    });

    context('when Mocha config present', function() {
      it('should resolve snapshots/verbatim within Mocha test root', async function() {
        await writePackage(testPath, {
          name: 'resolver-test',
          mocha: {
            spec: 'test/**/*.test.js'
          }
        });
        const testRoots = [path.join(testPath, 'test')];
        const expected = path.join(process.cwd(), 'test', 'snapshots', 'verbatim');
        expect(resolveSnapshotRoot(testRoots)).to.equal(expected);
      });
    });
  });
});
