import { I18nOptions, Locale } from './i18n.options';
import * as path from 'path';
import { TranslationFileIO } from './translation-file-io';
import { Bindings, Translator } from './translator';
import { AsyncLocalStorage } from 'async_hooks';
import { promises as fs } from 'fs';

export type TranslationFileContent = { [original: string]: string };

let singleton: I18n = null;

export function tr(line: string, bindings?: Bindings): string {
  const translator: Translator =
    singleton.storage.getStore() ??
    singleton.getTranslator(
      singleton.options.locales.fallback ?? singleton.options.locales.original,
    );

  return translator.translate(line, bindings);
}

export class I18n {
  public readonly options: I18nOptions;
  protected readonly translationFileIO: TranslationFileIO;
  protected translations: { [locale: string]: TranslationFileContent };
  public storage: AsyncLocalStorage<Translator>;

  constructor(options: I18nOptions) {
    this.options = {
      cwd: options.cwd ?? process.cwd(),
      outDir: path.isAbsolute(options.outDir)
        ? options.outDir
        : path.join(options.cwd ?? process.cwd(), options.outDir),
      sources: options.sources,
      locales: {
        original: options.locales.original,
        fallback: options.locales.fallback ?? options.locales.original,
        available: this.normalizeLocalesAvailable(
          options.locales.available,
          options.locales.original,
          options.locales.fallback,
        ),
      },
    };
    this.translationFileIO = new TranslationFileIO(this.options);
    this.translations = {};
    this.storage = new AsyncLocalStorage<Translator>();
  }

  async loadTranslations(): Promise<void> {
    const promises: Promise<TranslationFileContent>[] = [];

    this.options.locales.available.forEach((locale) => {
      const promise: Promise<TranslationFileContent> = this.translationFileIO.safeRead(locale);
      promises.push(promise);
      promise
        .then((content) => {
          this.translations[locale] = content;
        })
        .catch((err) => {
          throw err;
        });
    });

    await Promise.all(promises);
  }

  isAvailable(locale: Locale): boolean {
    return this.options.locales.available.includes(locale);
  }

  isFallback(locale: Locale): boolean {
    return this.options.locales.fallback === locale;
  }

  getTranslator(locale: Locale): Translator {
    if (!this.isAvailable(locale)) {
      locale = this.options.locales.fallback;
    }

    if (this.isFallback(locale)) {
      return new Translator(locale, this.translations[locale]);
    }

    return new Translator(
      locale,
      this.translations[locale],
      this.options.locales.fallback,
      this.translations[this.options.locales.fallback],
    );
  }

  /**
   * Returns available locales including original and fallback in case they are not listed
   *
   * @param available
   * @param original
   * @param fallback
   * @protected
   */
  protected normalizeLocalesAvailable(
    available: Locale[],
    original: Locale,
    fallback?: Locale,
  ): Locale[] {
    if (!available.includes(original)) {
      available.push(original);
    }

    if (fallback && !available.includes(fallback)) {
      available.push(fallback);
    }

    return available;
  }

  static async init(options: Partial<I18nOptions> = {}): Promise<I18n> {
    if (!singleton) {
      const config: I18nOptions = JSON.parse(
        (await fs.readFile(path.join(process.cwd(), 'llengues.json'))).toString(),
      );
      const i18n: I18n = new this(
        Object.assign<I18nOptions, Partial<I18nOptions>>(config, options),
      );
      await i18n.loadTranslations();
      singleton = i18n;
    }
    return singleton;
  }
}
