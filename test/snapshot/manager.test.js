import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { expect } from 'chai';
import withLocalTmpDir from 'with-local-tmp-dir';
import { SnapshotManager } from '../../src/snapshot/manager.js';

describe('Snapshot manager', function() {
  context('snapshotRoot property', function() {
    context('when manager is given relative snapshot root', function() {
      it('should resolve to absolute path using current working directory', function() {
        const mochaMetastore = { testRoots: [process.cwd()] };
        const snapshotRoot = 'snapshots';
        const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
        const expected = path.join(process.cwd(), snapshotRoot);
        expect(manager.snapshotRoot).to.equal(expected);
      });
    });

    context('when manager is given absolute snapshot root', function() {
      it('should resolve to given path', function() {
        const mochaMetastore = { testRoots: [process.cwd()] };
        const snapshotRoot = path.join(process.cwd(), 'snapshots');
        const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
        expect(manager.snapshotRoot).to.equal(snapshotRoot);
      });
    });

    context('when manager is given no snapshot root', function() {
      it('should resolve to snapshots/verbatim directory within first Mocha test root', function() {
        const mochaMetastore = {
          testRoots: [
            process.cwd(),
            os.tmpdir()
          ]
        };
        const manager = new SnapshotManager(mochaMetastore);
        const expected = path.join(process.cwd(), 'snapshots', 'verbatim');
        expect(manager.snapshotRoot).to.equal(expected);
      });
    });
  });

  context('loadCurrentSnapshot', function() {
    context('when no manifest can be found', function() {
      it('should return null', async function() {
        await withLocalTmpDir(() => {
          const mochaMetastore = {
            testRoots: [process.cwd()],
            currentTest: {
              file: path.join(process.cwd(), 'test.js'),
              fullTitle() { return 'Test'; }
            },
            currentTestRelativePath: 'test.js'
          };

          const snapshotRoot = path.join(process.cwd(), 'snapshots');
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          expect(manager.loadCurrentSnapshot()).to.be.null;
        });
      });
    });

    context('when manifest has no entry for current test', function() {
      it('should return null', async function() {
        await withLocalTmpDir(async () => {
          const mochaMetastore = {
            testRoots: [process.cwd()],
            currentTest: {
              file: path.join(process.cwd(), 'test.js'),
              fullTitle() { return 'Test'; }
            },
            currentTestRelativePath: 'test.js'
          };

          const snapshotRoot = path.join(process.cwd(), 'snapshots');
          await fs.mkdirp(path.join(snapshotRoot, 'test.js'));
          await fs.writeJson(path.join(snapshotRoot, 'test.js', 'manifest.json'), {});
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          expect(manager.loadCurrentSnapshot()).to.be.null;
        });
      });
    });

    context('when snapshot file for current test cannot be found', function() {
      it('should return null', async function() {
        await withLocalTmpDir(async () => {
          const mochaMetastore = {
            testRoots: [process.cwd()],
            currentTest: {
              file: path.join(process.cwd(), 'test.js')
            },
            currentTestRelativePath: 'test.js',
            currentTestKey: 'Test'
          };

          const snapshotRoot = path.join(process.cwd(), 'snapshots');
          await fs.mkdirp(path.join(snapshotRoot, 'test.js'));
          await fs.writeJson(path.join(snapshotRoot, 'test.js', 'manifest.json'), { 'Test': { fileName: 'snap.txt' } });
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          expect(manager.loadCurrentSnapshot()).to.be.null;
        });
      });
    });

    context('when snapshot file and manifest exist', function() {
      it('should return a valid snapshot', async function() {
        await withLocalTmpDir(async () => {
          const mochaMetastore = {
            testRoots: [process.cwd()],
            currentTest: {
              file: path.join(process.cwd(), 'test.js')
            },
            currentTestRelativePath: 'test.js',
            currentTestKey: 'Test'
          };

          const snapshotRoot = path.join(process.cwd(), 'snapshots');
          await fs.mkdirp(path.join(snapshotRoot, 'test.js'));
          await fs.writeJson(path.join(snapshotRoot, 'test.js', 'manifest.json'), { 'Test': { fileName: 'snap.txt' } });
          await fs.writeFile(path.join(snapshotRoot, 'test.js', 'snap.txt'), 'This is a test snapshot');
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          expect(manager.loadCurrentSnapshot()).to.not.be.null;
        });
      });
    });
  });
});
