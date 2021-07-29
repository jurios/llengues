# Llengues
*Llengues* is a NodeJS module which provides an internationalization (i18n) solution
for `NodeJS` (`javascript` and `typescript` compatible).

With *llengues*, you will be able to generate automatically translation files based on `json` which
then will be used to translate lines at running time.

*Llengues* performs two different tasks:

* **Sync**: Generate translation files for each desired `locale` building an 
AST for your source files (like a `lint` tool) and looking for calls to the translation method (`tr(...)`).
* **Translate**: Provides a runtime mechanism to perform translations to the desired `locale` when required.

`Sync` task must be performed every time a new translatable line is added to the codebase in order to include it to the
translation files. `Llengues` provides a CLI in order to run `sync`s easily.

`Translate` process take place during application execution when `tr()` is called. Based on the desired locale, 
the translated line will be used instead. `Translate` process is request context aware (using `AsyncLocalStorage`) 
thus you can use different locales for each request in case your application is handling requests.

## Getting Started
First install the package:
```shell
npm install llengues
```
### Configuration
*Llengues* configuration is located in `llengues.json` file. And follows this interface:
```typescript
  sources: string[];
  locales: {
    original: Locale;
    fallback?: Locale;
    available: Locale[];
  };
  outDir: string;
```

* **sources**: Glob patterns used to get the files where look for translations
* **locales.original**: Original locale used in your sources. This will save time as the locale translation files generated will be translated automatically
* **locales.fallback**: Locale used when a translation or a locale is not available.
* **locales.available**: Locale list of available locales.
* **outDir**: Path where translation files will be persisted and loaded.


You can generate a default configuration file with:
```shell
node node_modules/.bin/llengues init
```

## Creating translatable lines
*Llengues* exports the `tr` function:
```typescript
export function tr(line: string, bindings?: Bindings): string;
```
This method translates the line to the desired `locale` and fills placeholders with values in it.
For instance, having the following files:

#####`en.json`:
```
{
  "Greetings, :name:": "Welcome, :name:"
}
```

##### `app.ts`:
```typescript
import { tr } from 'llengues';

console.log(tr('Greetings, :name:', { name: 'Enric'}));
```
The following text will be printed out if the configured locale is `en`:
```bash
Welcome, Enric
```

Any word which starts and ends with `:` is considered a placeholder and will be replaced in case `bindings` contains a key
with the same name.

## Sync
`Sync` process looks for calls to the `tr("...")` method in the files which match the `sources` configuration patterns. All new translations which are not already present in the translation files 
for each `locale` will be added. Notice `original` and `fallback` translation files are generated too.

`Sync` can be easily called with:
```shell
node node_modules/.bin/llengues sync
```

### Example:
Using the following configuration: 
```json
{
  "sources": ["src/**/*.ts"],
  "locales": {
    "original": "en",
    "fallback": "ca",
    "available": ["ca", "es"]
  },
  "outDir": "lang"
}
```
And having this source file:
```typescript
//src/app/app.ts
import { tr } from 'llengues'

tr("Greetings, :name:", { name: user.name });
```

Following files will be generated (or updated) in `lang` directory after call `sync`:

####`en.json`
(Notice `en` translation file is also generated because is defined as `original`.)
```json
{
  "Greetings, :name:": "Greetings, :name:"
}
```
As `original` locale, translation file is automatically filled.

####`ca.json`
```json
{
  "Greetings, :name:": null
}
```

####`es.json`
```json
{
  "Greetings, :name:": null
}
```
New translations detected will be filled with `null` for any locale which is not `original` locale.

Every translated line which is already in the translation file before `sync` remains immutable 
while is being used. If a translated line is not being used anywhere then it will be removed automatically.

A line is considered translatable when calls to `tr()` exported method. It also detects local variables thus following
scenarios will be also detected:
```typescript
import { tr } from 'llengues';
import { tr as alias } from 'llengues';
const tr = require('llengues').tr;
const alias = require('llengues').tr;
```

## Translate
TODO