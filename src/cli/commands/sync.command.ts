import { Command } from 'artesa';
import { I18n } from '../../i18n';
import { Syncer } from '../../sync/syncer';

export class SyncCommand extends Command {
  public getDescription(): string {
    return 'Sync translation files with the translations found in your source files';
  }

  protected async handle(): Promise<number> {
    const i18n: I18n = await I18n.init();
    const syncer: Syncer = new Syncer(i18n.options);
    await syncer.sync();
    this.io.success('Translation files synced');
    return 0;
  }
}
