import { TranslationFileContent } from './i18n';
import { Locale } from './i18n.options';

export type Bindings = Record<string, string>;

export class Translator {
  constructor(
    public readonly locale: Locale,
    public readonly translations: TranslationFileContent,
    public readonly fallback?: Locale,
    public readonly fallbackTranslations?: TranslationFileContent,
  ) {}

  /**
   * Translates a line using the translation provided or the fallback.
   * If line cannot be translated then original is returned
   *
   * @param line
   * @param bindings
   */
  translate(line: string, bindings: Bindings = {}): string {
    if (this.translations[line]) {
      return this.bind(this.translations[line], bindings);
    }

    if (this.fallbackTranslations && this.fallbackTranslations[line]) {
      return this.bind(this.fallbackTranslations[line], bindings);
    }

    return this.bind(line, bindings);
  }

  /**
   * Binds variables in the line
   *
   * @param line
   * @param bindings
   * @protected
   */
  protected bind(line: string, bindings: Bindings = {}): string {
    Object.keys(bindings).forEach((bind) => {
      line = line.replace(`:${bind}:`, bindings[bind]);
    });

    return line;
  }
}
