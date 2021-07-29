import { I18nOptions } from '../i18n.options';
import { FileDiscover } from './file-discover';
import * as path from 'path';
import { TranslationFinder, TranslationMetadata } from './translation-finder';
import { TranslationFileContent } from '../i18n';
import { promises as fs } from 'fs';
import { TranslationFileIO } from '../translation-file-io';

export class Syncer {
  protected readonly translationFileIO: TranslationFileIO;

  constructor(public readonly options: I18nOptions) {
    this.translationFileIO = new TranslationFileIO(options);
  }

  async sync(): Promise<void> {
    const files: string[] = (
      await FileDiscover.discover(this.options.sources, {
        cwd: this.options.cwd,
      })
    ).map((file) => path.join(this.options.cwd, file));

    const translationsFound: TranslationMetadata[] = await TranslationFinder.find(
      files,
      'tr',
      'llengues',
    );

    await this.ensureOutDirExists();

    for (const locale of this.options.locales.available) {
      const localeTranslations: TranslationFileContent = await this.translationFileIO.safeRead(
        locale,
      );
      const updatedTranslations: TranslationFileContent = {};

      translationsFound.forEach((translationMetadata: TranslationMetadata) => {
        updatedTranslations[translationMetadata.text] =
          localeTranslations[translationMetadata.text] ??
          (locale === this.options.locales.original ? translationMetadata.text : null);
      });

      await this.translationFileIO.write(locale, updatedTranslations);
    }
  }

  protected async ensureOutDirExists(): Promise<void> {
    try {
      await fs.mkdir(this.options.outDir);
    } catch (e) {
      if (e.code && e.code === 'EEXIST') {
        return;
      }
      throw e;
    }
  }
}
