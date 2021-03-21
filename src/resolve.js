import path from 'path';
import { loadOptions } from 'mocha/lib/cli/options.js';
import parseGlob from 'parse-glob';

export const resolveSnapshotRoot = (givenSnapshotRoot) => {
  if (givenSnapshotRoot) {
    return path.resolve(givenSnapshotRoot);
  }

  const mochaOptions = loadOptions();
  const parsedSpecGlob = parseGlob(mochaOptions._[0] ?? process.cwd());
  const testRoot = parsedSpecGlob.is.glob ? parsedSpecGlob.base : parsedSpecGlob.orig;
  return path.join(path.resolve(testRoot), 'snapshots', 'verbatim');
};
