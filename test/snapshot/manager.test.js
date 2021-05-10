import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import withLocalTmpDir from 'with-local-tmp-dir';
import { SnapshotManager } from '../../src/snapshot/manager.js';
import { Snapshot } from '../../src/snapshot/snapshot.js';

use(chaiAsPromised);

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
              file: path.join(process.cwd(), 'test.js')
            },
            currentTestRelativePath: 'test.js',
            currentTestKey: 'Test'
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
              file: path.join(process.cwd(), 'test.js')
            },
            currentTestRelativePath: 'test.js',
            currentTestKey: 'Test'
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

  context('saveCurrentSnapshot', function() {
    context('when no manifest can be found', function() {
      it('should create new manifest', async function() {
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
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          const snapshot = new Snapshot('Test contents');
          manager.saveCurrentSnapshot(snapshot);

          const manifestPath = path.join(snapshotRoot, 'test.js', 'manifest.json');
          expect(fs.pathExists(manifestPath)).to.eventually.be.true;
        });
      });

      it('should create manifest entry for snapshot', async function() {
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
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          const snapshot = new Snapshot('Test contents');
          manager.saveCurrentSnapshot(snapshot);

          const manifestPath = path.join(snapshotRoot, 'test.js', 'manifest.json');
          const manifest = await fs.readJson(manifestPath);
          expect(manifest['Test'].fileName).to.exist;
        });
      });

      it('should create snapshot file for snapshot', async function() {
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
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          const snapshot = new Snapshot('Test contents');
          manager.saveCurrentSnapshot(snapshot);

          const manifestPath = path.join(snapshotRoot, 'test.js', 'manifest.json');
          const manifest = await fs.readJson(manifestPath);
          const snapshotPath = path.join(snapshotRoot, 'test.js', manifest['Test'].fileName);
          const snapshotContents = await fs.readFile(snapshotPath, { encoding: 'utf8' });
          expect(snapshotContents).to.equal(snapshot.contents);
        });
      });
    });

    context('when a manifest already exists', function() {
      it('should update contents of snapshot file that already exists', async function() {
        await withLocalTmpDir(async () => {
          const mochaMetastore = {
            testRoots: [process.cwd()],
            currentTest: {
              file: path.join(process.cwd(), 'test.js')
            },
            currentTestRelativePath: 'test.js',
            currentTestKey: 'Test'
          };

          // Setup the original snapshot file.
          const snapshotRoot = path.join(process.cwd(), 'snapshots');
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          const snapshot = new Snapshot('Test contents');
          manager.saveCurrentSnapshot(snapshot);

          // The actual test. Try to update the snapshot file with new contents.
          const updatedSnapshot = new Snapshot('Updated contents');
          manager.saveCurrentSnapshot(updatedSnapshot);

          const manifestPath = path.join(snapshotRoot, 'test.js', 'manifest.json');
          const manifest = await fs.readJson(manifestPath);
          const snapshotPath = path.join(snapshotRoot, 'test.js', manifest['Test'].fileName);
          const snapshotContents = await fs.readFile(snapshotPath, { encoding: 'utf8' });
          expect(snapshotContents).to.equal(updatedSnapshot.contents);
        });
      });

      it('should not alter unrelated snapshot files', async function() {
        await withLocalTmpDir(async () => {
          const mochaMetastore = {
            testRoots: [process.cwd()],
            currentTest: {
              file: path.join(process.cwd(), 'test.js')
            },
            currentTestRelativePath: 'test.js',
            currentTestKey: 'Unrelated test'
          };

          // Setup the unrelated snapshot file.
          const snapshotRoot = path.join(process.cwd(), 'snapshots');
          const manager = new SnapshotManager(mochaMetastore, snapshotRoot);
          const unrelatedSnapshot = new Snapshot('Unrelated contents');
          manager.saveCurrentSnapshot(unrelatedSnapshot);

          // Setup the "new" snapshot file. Simulate the Mocha metastore now running a new test.
          mochaMetastore.currentTestKey = 'Test';
          const snapshot = new Snapshot('Test contents');
          manager.saveCurrentSnapshot(snapshot);

          const manifestPath = path.join(snapshotRoot, 'test.js', 'manifest.json');
          const manifest = await fs.readJson(manifestPath);
          const unrelatedSnapshotPath = path.join(snapshotRoot, 'test.js', manifest['Unrelated test'].fileName);
          const unrelatedSnapshotContents = await fs.readFile(unrelatedSnapshotPath, { encoding: 'utf8' });
          expect(unrelatedSnapshotContents).to.equal(unrelatedSnapshot.contents);
        });
      });
    });
  });
});
