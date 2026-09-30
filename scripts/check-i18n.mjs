import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/i18n/locales');
const source = JSON.parse(fs.readFileSync(path.join(root, 'en.json'), 'utf8'));
const flatten = (value, prefix = '', result = {}) => {
  for (const [key, child] of Object.entries(value)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, full, result);
    else result[full] = String(child);
  }
  return result;
};
const sourceKeys = flatten(source);
let failed = false;
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.json') && name !== 'en.json')) {
  const locale = flatten(JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));
  const missing = Object.keys(sourceKeys).filter(key => !(key in locale));
  const extra = Object.keys(locale).filter(key => !(key in sourceKeys));
  const sameWordTranslations = file === 'pt.json'
    ? ['crops.Banana', 'crops.banana', 'common.hectaresShort', 'readAloud.normal', 'overview.stats.mm']
    : file === 'zu.json' ? ['overview.stats.mm'] : [];
  const untranslated = Object.keys(sourceKeys).filter(key => key in locale && locale[key] === sourceKeys[key] && !key.startsWith('languages.') && !key.startsWith('countries.') && !['weather.temperature', 'dashboard.khanna', ...sameWordTranslations].includes(key));
  if (missing.length || extra.length || untranslated.length) failed = true;
  console.log(`${file}: ${missing.length} missing, ${extra.length} extra, ${untranslated.length} unchanged from English`);
  if (missing.length) console.log(`  Missing: ${missing.join(', ')}`);
  if (extra.length) console.log(`  Extra: ${extra.join(', ')}`);
  if (untranslated.length) console.log(`  Untranslated: ${untranslated.join(', ')}`);
}
if (failed) process.exitCode = 1;
