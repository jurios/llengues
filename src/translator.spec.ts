import { Translator } from './translator';
import { TranslationFileContent } from './i18n';

describe(Translator.name, () => {
  describe('translate', () => {
    let translator: Translator;
    let translations: TranslationFileContent;

    beforeEach(() => {
      translations = {
        'Welcome, :name:. Date: :date:': 'Benvingut, :name:. Data: :date:',
      };

      translator = new Translator('ca', translations);
    });

    it('should bind variables', () => {
      const date: string = new Date().toString();
      expect(
        translator.translate('Welcome, :name:. Date: :date:', {
          name: 'test',
          date: date,
        }),
      ).toStrictEqual(`Benvingut, test. Data: ${date}`);
    });

    it('should not bind a variable which is not defined', () => {
      expect(
        translator.translate('Welcome, :name:. Date: :date:', {
          name: 'test',
        }),
      ).toStrictEqual(`Benvingut, test. Data: :date:`);
    });

    it('should return fallback translation if translation is not defined in the current locale', () => {
      const fallbackTranslations: TranslationFileContent = {
        'Cheers!': 'Salud!',
      };
      translator = new Translator('ca', translations, 'es', fallbackTranslations);

      expect(translator.translate('Cheers!')).toStrictEqual('Salud!');
    });

    it('should return fallback translation if translation is null in the current locale', () => {
      translations = {
        'Welcome, :name:. Date: :date:': null,
      };

      const fallbackTranslations: TranslationFileContent = {
        'Welcome, :name:. Date: :date:': 'Welcome, :name:. Date: :date:',
      };

      translator = new Translator('ca', translations, 'es', fallbackTranslations);

      expect(translator.translate('Welcome, :name:. Date: :date:')).toStrictEqual(
        'Welcome, :name:. Date: :date:',
      );
    });

    it('should return original if not found in both locale translations', () => {
      translator = new Translator('ca', translations, 'en', {});

      expect(translator.translate('Cheers!')).toStrictEqual('Cheers!');
    });
  });
});
