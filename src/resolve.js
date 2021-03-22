import path from 'path';
import { loadOptions } from 'mocha/lib/cli/options.js';
import parseGlob from 'parse-glob';

export const resolveTestRoots = () => {
  // As of Mocha 8.3.2, the spec paths given to Mocha are on the _ property of the loaded options.
  const mochaOptions = loadOptions();
  /** @type string[] */
  const specPaths = mochaOptions._ ?? [];
  return (specPaths.length > 0 ? specPaths : [process.cwd()])
    .map(specPath => parseGlob(specPath))
    .map(parsedGlob => parsedGlob.is.glob ? parsedGlob.base : parsedGlob.orig)
    .map(testRoot => path.resolve(testRoot));
};

export const resolveSnapshotRoot = (givenSnapshotRoot) => {
  if (givenSnapshotRoot) {
    return path.resolve(givenSnapshotRoot);
  }

  const mochaOptions = loadOptions();
  const parsedSpecGlob = parseGlob(mochaOptions._[0] ?? process.cwd());
  const testRoot = parsedSpecGlob.is.glob ? parsedSpecGlob.base : parsedSpecGlob.orig;
  return path.join(path.resolve(testRoot), 'snapshots', 'verbatim');
};
