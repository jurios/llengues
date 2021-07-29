#!/usr/bin/env node
import { CLI } from 'artesa';
import { InitCommand } from './commands/init.command';
import { SyncCommand } from './commands/sync.command';

CLI.init({
  init: InitCommand,
  sync: SyncCommand,
})
  .run(process.argv.slice(2))
  .then((r) => r)
  .catch((e) => console.error(e));
