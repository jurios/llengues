import { I18n } from './i18n';
import * as path from 'path';
import { Translator } from './translator';
import { getPlayground } from '../tests/playground';

describe(I18n.name, () => {
  let i18n: I18n;
  let playground: string;
  beforeEach(async () => {
    playground = await getPlayground();
    i18n = new I18n({
      cwd: playground,
      outDir: 'lang',
      sources: ['**/*.ts'],
      locales: {
        original: 'en',
        fallback: 'en',
        available: ['en', 'ca'],
      },
    });

    await i18n.loadTranslations();
  });

  describe('constructor', () => {
    it('should prepend cwd if path option is relative', () => {
      i18n = new I18n({
        cwd: playground,
        outDir: 'lang',
        sources: ['**/*.ts'],
        locales: {
          original: 'en',
          fallback: 'en',
          available: ['en', 'ca'],
        },
      });

      expect(i18n.options.outDir).toBe(path.join(playground, 'lang'));
    });

    it('should include fallback and original as an available locale', () => {
      i18n = new I18n({
        cwd: playground,
        outDir: 'lang',
        sources: ['**/*.ts'],
        locales: {
          original: 'en',
          fallback: 'ca',
          available: ['es'],
        },
      });

      expect(i18n.options.locales.available).toContain('en');
      expect(i18n.options.locales.available).toContain('ca');
      expect(i18n.options.locales.available).toContain('es');
    });
  });

  describe('isAvailable', () => {
    it('should return true if locale is available', () => {
      expect(i18n.isAvailable('ca')).toBeTruthy();
    });

    it('should return false if locale is not available', () => {
      expect(i18n.isAvailable('fr')).toBeFalsy();
    });
  });

  describe('getTranslator', () => {
    it('should return a translator', () => {
      expect(i18n.getTranslator('ca')).toBeInstanceOf(Translator);
    });

    it('should return a suitable locale translator', () => {
      expect(i18n.getTranslator('ca').locale).toStrictEqual('ca');
      expect(i18n.getTranslator('ca').fallback).toStrictEqual(i18n.options.locales.fallback);
    });

    it('should return fallback locale translator when locale requested is not available', async () => {
      expect(i18n.getTranslator('fr').locale).toStrictEqual(i18n.options.locales.fallback);
      expect(i18n.getTranslator('fr').fallback).toBe(undefined);
    });
  });
});
