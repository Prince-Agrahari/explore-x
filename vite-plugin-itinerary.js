import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDir = path.dirname(fileURLToPath(import.meta.url));

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const readBody = (req) => new Promise((resolve, reject) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    try {
      resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}'));
    } catch {
      reject(Object.assign(new Error('Trip details are required.'), { code: 'invalid-argument' }));
    }
  });
  req.on('error', reject);
});

const verifyIdToken = async (token, webKey) => {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${webKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });
  const data = await response.json();
  return Boolean(data?.users?.[0]?.localId);
};

const httpStatusFor = (error, classifyGeminiError) => {
  if (error?.code === 'invalid-argument') return 400;
  const kind = error?.kind || classifyGeminiError(error);
  if (kind === 'unauthenticated') return 401;
  if (kind === 'quota') return 429;
  if (kind === 'config' || kind === 'revoked' || kind === 'unavailable') return 503;
  return 502;
};

const sanitizeLog = (error) => String(error?.message || error)
  .replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]')
  .replace(/key[=:]\s*['"]?[^'"\s]+/gi, 'key=[redacted]')
  .slice(0, 240);

export default function itineraryDevPlugin() {
  return {
    name: 'explore-x-itinerary-dev',
    configureServer(server) {
      server.middlewares.use('/api/generate-itinerary', async (req, res) => {
        if (req.method !== 'POST') {
          json(res, 405, { error: 'Method not allowed' });
          return;
        }

        const {
          classifyGeminiError,
          generateValidatedItinerary,
          userFacingMessage,
          validateTripInput,
        } = require(path.join(rootDir, 'functions/itinerary.js'));
        const { loadFirebaseWebApiKey, loadGeminiApiKey } = require(path.join(rootDir, 'functions/secrets.js'));
        const { createGeminiClient, requestItineraryJson } = require(path.join(rootDir, 'functions/gemini.js'));

        try {
          const header = String(req.headers.authorization || '');
          const token = header.startsWith('Bearer ') ? header.slice(7) : '';
          const webKey = loadFirebaseWebApiKey();
          if (!token || !webKey || !(await verifyIdToken(token, webKey))) {
            json(res, 401, { error: userFacingMessage('unauthenticated') });
            return;
          }

          const geminiKey = loadGeminiApiKey();
          if (!geminiKey) {
            json(res, 503, { error: userFacingMessage('config') });
            return;
          }

          const trip = validateTripInput(await readBody(req));
          const ai = createGeminiClient(geminiKey);
          const itinerary = await generateValidatedItinerary((validatedTrip) => (
            requestItineraryJson(ai, validatedTrip)
          ), trip);

          json(res, 200, { itinerary });
        } catch (error) {
          server.config.logger.error(`[explore-x] itinerary generation failed: ${sanitizeLog(error)}`);
          const kind = error?.kind || (error?.code === 'invalid-argument' ? 'invalid-argument' : classifyGeminiError(error));
          json(res, httpStatusFor(error, classifyGeminiError), {
            error: error?.code === 'invalid-argument' || error?.kind
              ? error.message
              : userFacingMessage(kind),
          });
        }
      });
    },
  };
}
