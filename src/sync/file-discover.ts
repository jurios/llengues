import * as glob from 'glob';

function discover(pattern: string, options: glob.IOptions = {}): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    glob(pattern, options, (err: Error | null, results: string[]) => {
      if (err) {
        return reject(err);
      }

      return resolve(results);
    });
  });
}

export class FileDiscover {
  static async discover(patterns: string[], options: glob.IOptions = {}): Promise<string[]> {
    const discoverPromises: Promise<string[]>[] = [];

    for (const pattern of patterns) {
      discoverPromises.push(discover(pattern, options));
    }

    const results: string[][] = await Promise.all(discoverPromises);

    return results.reduce((reduced: string[], current: string[]) => {
      current.forEach((filePath) => {
        if (!reduced.includes(filePath)) {
          reduced.push(filePath);
        }
      });

      return reduced;
    }, []);
  }
}
