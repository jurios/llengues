import { Command } from 'artesa';
import { I18n } from '../../i18n';
import { Syncer } from '../../sync/syncer';

export class SyncCommand extends Command {
  public getDescription(): string {
    return 'Sync translation files with the translations found in your source files';
  }

  protected async handle(): Promise<number> {
    const i18n: I18n = await I18n.init();

    try {
      const syncer: Syncer = new Syncer(i18n.options);
      await syncer.sync();
      this.io.success('Translation files synced');
    } catch (e) {
      this.io.err(e.message);
      console.error(e);
    } finally {
      this.printBetaNote();
    }
    return 0;
  }

  protected printBetaNote(): void {
    this.io.space(2);
    this.io.writeLn(
      `(!) Llengues is in beta. Please fill an issue if you find out a bug or an unexpected behaviour during sync process.`,
      { color: [251, 191, 36] },
    );
  }
}
