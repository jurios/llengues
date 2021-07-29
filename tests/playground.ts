import { promises as fs } from 'fs';
import * as path from 'path';

export const playgroundsPath = path.join(process.cwd(), 'tests', '.tmp');

beforeAll(async () => {
  try {
    await fs.access(playgroundsPath);
  } catch (e) {
    if (e && e.code === 'ENOENT') {
      await fs.mkdir(playgroundsPath);
      return;
    }
    throw e;
  }
});

afterAll(async () => {
  try {
    await fs.access(playgroundsPath);
    await fs.rm(playgroundsPath, {recursive: true});
  } catch (e) {
    if (e && e.code === 'ENOENT') {
      return;
    }
    throw e;
  }
})

export async function getPlayground(): Promise<string> {
  return await fs.mkdtemp(path.join(playgroundsPath, 'test-'));
}