export type Locale = string;

export type I18nOptions = {
  cwd?: string;
  sources: string[];
  locales: {
    original: Locale;
    fallback?: Locale;
    available: Locale[];
  };
  outDir: string;
};
