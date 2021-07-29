import { TranslationFinder, TranslationMetadata } from './translation-finder';
import { promises as fs } from 'fs';

describe(TranslationFinder.name, () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('find()', () => {
    it('should find imported function', async () => {
      jest.spyOn(fs, 'readFile').mockImplementation(async () => {
        return "import {tr} from 'package'; tr('translation')";
      });

      const translationsMetadata: TranslationMetadata[] = await TranslationFinder.find(
        ['file'],
        'tr',
        'package',
      );

      expect(translationsMetadata).toHaveLength(1);
      expect(translationsMetadata[0]).toStrictEqual<TranslationMetadata>({
        text: 'translation',
        files: ['file'],
      });
    });

    it('should find imported function with local alias', async () => {
      jest.spyOn(fs, 'readFile').mockImplementation(async () => {
        return "import { tr as alias } from 'package'; alias('translation')";
      });

      const translationsMetadata: TranslationMetadata[] = await TranslationFinder.find(
        ['file'],
        'tr',
        'package',
      );

      expect(translationsMetadata).toHaveLength(1);
      expect(translationsMetadata[0]).toStrictEqual<TranslationMetadata>({
        text: 'translation',
        files: ['file'],
      });
    });

    it('should join duplicated translations metadata', async () => {
      jest.spyOn(fs, 'readFile').mockImplementation(async (file: string) => {
        switch (file) {
          case '1':
            return "import {tr} from 'package'; export default function () { return tr('translation'); }";
          case '2':
            return "import {tr} from 'package'; export default function () { return tr('translation'); }";
        }
      });

      const translationsMetadata: TranslationMetadata[] = await TranslationFinder.find(
        ['1', '2'],
        'tr',
        'package',
      );

      expect(translationsMetadata).toHaveLength(1);
      expect(translationsMetadata[0]).toStrictEqual<TranslationMetadata>({
        text: 'translation',
        files: ['1', '2'],
      });
    });

    it('should detect required tr function calls', async () => {
      jest.spyOn(fs, 'readFile').mockImplementation(async () => {
        return "const alias = require('package').tr; export default function () { return alias('translation'); }";
      });

      const translationsMetadata: TranslationMetadata[] = await TranslationFinder.find(
        ['file'],
        'tr',
        'package',
      );

      expect(translationsMetadata).toHaveLength(1);
      expect(translationsMetadata[0]).toStrictEqual<TranslationMetadata>({
        text: 'translation',
        files: ['file'],
      });
    });

    it('should ignore translations which are not strings', async () => {
      jest.spyOn(fs, 'readFile').mockImplementation(async () => {
        return "import {tr} from 'package'; tr({item: 1})";
      });

      const translationsMetadata: TranslationMetadata[] = await TranslationFinder.find(
        ['file'],
        'tr',
        'package',
      );

      expect(translationsMetadata).toHaveLength(0);
    });
  });
});
