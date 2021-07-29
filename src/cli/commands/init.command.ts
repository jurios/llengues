import { Command } from 'artesa';
import * as path from 'path';
import { I18nOptions } from '../../i18n.options';
import { promises as fs } from 'fs';

export class InitCommand extends Command {
  protected _filePath: string = path.join(process.cwd(), 'llengues.json');

  public getDescription(): string {
    return 'Generates llengues config file';
  }

  protected _initialConfig: I18nOptions = {
    locales: {
      available: [],
      original: 'en',
    },
    outDir: 'lang',
    sources: [],
  };

  protected async handle(): Promise<number> {
    await this.generateConfigFile(this._filePath, this._initialConfig);
    this.io.success('Llengues configuration file generated');
    return 0;
  }

  protected async generateConfigFile(filePath: string, config: I18nOptions): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(config, null, 2));
  }
}
