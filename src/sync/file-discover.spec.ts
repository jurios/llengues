import { FileDiscover } from './file-discover';
import * as path from 'path';
import { promises as fs } from 'fs';
import { getPlayground } from '../../tests/playground';

describe(FileDiscover.name, () => {
  let playground: string;

  beforeEach(async () => {
    playground = await getPlayground();

    await fs.mkdir(path.join(playground, 'src', 'app', 'controllers'), { recursive: true });
    await fs.writeFile(path.join(playground, 'src', 'app', 'app.ts'), '');
    await fs.writeFile(path.join(playground, 'src', 'app', 'controllers', 'app.controller.ts'), '');
    await fs.writeFile(path.join(playground, 'src', 'index.ts'), '');
  });

  describe('discover()', () => {
    it('should discover files', async () => {
      const files: string[] = await FileDiscover.discover(['src/**/*.ts'], {
        cwd: playground,
      });

      expect(files).toContain('src/app/app.ts');
      expect(files).toContain('src/app/controllers/app.controller.ts');
      expect(files).toContain('src/index.ts');
    });

    it('should remove duplicates', async () => {
      const files: string[] = await FileDiscover.discover(['src/**/*.ts', 'src/**/*.ts'], {
        cwd: playground,
      });

      expect(files).toHaveLength(3);
    });
  });
});
