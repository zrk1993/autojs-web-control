import * as Path from 'path';
import * as glob from 'glob';

export async function globs(root: string, globsRex: string, options?: glob.IOptions): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(Path.join(root, globsRex), options, (er, files) => {
      if (er) {
        reject(er);
      } else {
        resolve(files);
      }
    });
  });
}

export function loadPackage(packageName: string) {
  try {
    return require(packageName);
  } catch (e) {
    process.exit(1);
  }
}
