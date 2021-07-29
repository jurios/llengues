import { Syncer } from './syncer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TranslationFinder } from './translation-finder';
import { getPlayground } from '../../tests/playground';

describe(Syncer.name, () => {
  let syncer: Syncer;
  let playground: string;

  beforeEach(async () => {
    playground = await getPlayground();

    syncer = new Syncer({
      cwd: playground,
      outDir: path.join(playground, 'lang'),
      sources: ['**/*.ts'],
      locales: {
        original: 'en',
        fallback: 'en',
        available: ['en', 'ca'],
      },
    });

    jest.spyOn(TranslationFinder, 'find').mockResolvedValue([
      {
        text: 'Translation1',
        files: [],
      },
      {
        text: 'Translation2',
        files: [],
      },
    ]);
  });

  describe('sync', () => {
    it('should generate outDir if it does not exist', async () => {
      await syncer.sync();

      expect((await fs.stat(syncer.options.outDir)).isDirectory()).toBeTruthy();
    });

    it('should not generate outDir if it already exists', async () => {
      await fs.mkdir(syncer.options.outDir);

      await expect(syncer.sync()).resolves.toEqual(undefined);
    });

    it('should generate translation file for each locale', async () => {
      await syncer.sync();

      expect(await fs.access(path.join(syncer.options.outDir, 'en.json')));
      expect(await fs.access(path.join(syncer.options.outDir, 'ca.json')));
    });

    it('should set non-original locale new translations to null', async () => {
      await syncer.sync();

      expect(
        JSON.parse((await fs.readFile(path.join(syncer.options.outDir, 'en.json'))).toString()),
      ).toStrictEqual({
        Translation1: 'Translation1',
        Translation2: 'Translation2',
      });

      expect(
        JSON.parse((await fs.readFile(path.join(syncer.options.outDir, 'ca.json'))).toString()),
      ).toStrictEqual({
        Translation1: null,
        Translation2: null,
      });
    });

    it('should not overwrite translations already translated', async () => {
      await fs.mkdir(syncer.options.outDir);
      await syncer['translationFileIO']['write']('en', {
        Translation2: 'Already translated',
      });

      await syncer.sync();

      expect(
        JSON.parse((await fs.readFile(path.join(syncer.options.outDir, 'en.json'))).toString()),
      ).toStrictEqual({
        Translation1: 'Translation1',
        Translation2: 'Already translated',
      });
    });
  });
});
