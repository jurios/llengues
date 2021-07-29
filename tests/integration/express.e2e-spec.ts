import * as request  from 'supertest';
import { I18n, tr } from '../../src/i18n';
import * as express from 'express';
import * as path from 'path';
import { Locale } from '../../src/i18n.options';
import { NextFunction, Request, Response } from 'express';
import { promises as fs } from 'fs';

describe('Express integration tests', () => {
  let i18n: I18n;
  let app: express.Express = express();

  app.use((req: Request, res: Response, next: NextFunction) => {
    const locale: Locale = req.query.locale as string ?? i18n.options.locales.fallback;
    //@ts-ignore: TODO: It throws a compilation error.
    i18n.storage.run(i18n.getTranslator(locale), next);
  });

  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: tr('Greetings, :name:!', {
      name: 'test'
    })});
  });

  beforeEach(async () => {
    jest.spyOn(I18n.prototype, 'loadTranslations').mockResolvedValue(undefined);
    jest.spyOn(fs, 'readFile').mockResolvedValue("{}");

    i18n = await I18n.init({
      cwd: path.join(process.cwd(), 'tests', '.tmp'),
      locales: {
        available: ['ca', 'es'],
        original: 'en'
      },
      outDir: 'lang',
      sources: []
    });

    i18n['translations'] = {
      ca: {
        'Greetings, :name:!': 'Benvingut, :name:!'
      },
      es: {
        'Greetings, :name:!': 'Bienvenido, :name:!'
      }
    };
  })


  it('should return translated content', async () => {
    const promises: Promise<unknown>[] = [];

    const p1: Promise<unknown> = request(app)
      .get('/?locale=ca')
      .expect(200)
      .expect(response => {
        expect(response.body.message).toStrictEqual('Benvingut, test!')
      });

    const p2: Promise<unknown> = request(app)
      .get('/?locale=es')
      .expect(200)
      .expect(response => {
        expect(response.body.message).toStrictEqual('Bienvenido, test!')
      });

    promises.push(p1, p2);
    await Promise.all(promises)
  });
})