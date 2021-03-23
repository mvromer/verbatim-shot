import path from 'path';

export const resolveSnapshotRoot = (testRoots, givenSnapshotRoot) => {
  if (givenSnapshotRoot) {
    return path.resolve(givenSnapshotRoot);
  }

  return path.join(path.resolve(testRoots[0]), 'snapshots', 'verbatim');
};
