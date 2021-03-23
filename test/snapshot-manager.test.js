import os from 'os';
import path from 'path';
import { expect } from 'chai';
import { SnapshotManager } from '../src/snapshot/manager.js';

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
});
