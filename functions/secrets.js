const fs = require('node:fs');
const path = require('node:path');

const PRIMARY_KEY_NAMES = ['GEMINI_API_KEY', 'GOOGLE_GEMINI_API_KEY'];
const LOCAL_KEY_NAMES = [...PRIMARY_KEY_NAMES, 'GOOGLE_API_KEY'];

const normalizeSecret = (value) => String(value || '')
  .replace(/^\uFEFF/, '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
  .trim();

const readNamedValue = (filePath, names) => {
  if (!fs.existsSync(filePath)) return '';
  const text = fs.readFileSync(filePath, 'utf8');
  for (const name of names) {
    const line = text.split(/\r?\n/).find((item) => item.startsWith(`${name}=`));
    if (!line) continue;
    const value = normalizeSecret(line.slice(name.length + 1));
    if (value) return value;
  }
  return '';
};

const loadGeminiApiKey = () => {
  for (const name of LOCAL_KEY_NAMES) {
    const value = normalizeSecret(process.env[name]);
    if (value) return value;
  }

  const functionsEnv = readNamedValue(path.join(__dirname, '.env'), LOCAL_KEY_NAMES);
  if (functionsEnv) return functionsEnv;

  const secretLocal = readNamedValue(path.join(__dirname, '.secret.local'), LOCAL_KEY_NAMES);
  if (secretLocal) return secretLocal;

  return readNamedValue(path.join(__dirname, '..', '.env'), PRIMARY_KEY_NAMES);
};

const loadFirebaseWebApiKey = () => {
  const fromEnv = normalizeSecret(process.env.VITE_FIREBASE_API_KEY);
  if (fromEnv) return fromEnv;
  return readNamedValue(path.join(__dirname, '..', '.env'), ['VITE_FIREBASE_API_KEY']);
};

module.exports = {
  normalizeSecret,
  loadGeminiApiKey,
  loadFirebaseWebApiKey,
};
