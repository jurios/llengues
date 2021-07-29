import { I18nOptions, Locale } from './i18n.options';
import { TranslationFileContent } from './i18n';
import { promises as fs } from 'fs';
import * as path from 'path';

export class TranslationFileIO {
  constructor(protected readonly options: I18nOptions) {}

  /**
   * Reads a locale translation file. If the file does not exist, then an empty translation
   * file is returned.
   *
   * @param locale
   */
  async safeRead(locale: Locale): Promise<TranslationFileContent> {
    try {
      return await this.read(locale);
    } catch (e) {
      // If translation file does not exist, then return as an empty translation list
      if (e.code && e.code === 'ENOENT') {
        return {};
      }
      throw e;
    }
  }

  /**
   * Reads a locale translation file.
   *
   * @param locale
   */
  async read(locale: Locale): Promise<TranslationFileContent> {
    return JSON.parse((await fs.readFile(this.generateTranslationFilePath(locale))).toString());
  }

  /**
   * Writes a locale translation file
   *
   * @param locale
   * @param translationsContent
   */
  async write(locale: Locale, translationsContent: TranslationFileContent): Promise<void> {
    await fs.writeFile(
      this.generateTranslationFilePath(locale),
      JSON.stringify(translationsContent, null, 2),
    );
  }

  /**
   * Generates the locale translation file path
   * @param locale
   * @protected
   */
  protected generateTranslationFilePath(locale: Locale): string {
    return path.join(this.options.outDir, `${locale}.json`);
  }
}
