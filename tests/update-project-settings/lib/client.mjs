import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

const MAX_RETRIES = 5;

if (!process.env.API_ENDPOINT_DOMAIN) {
  throw new Error('API_ENDPOINT_DOMAIN is not set. Copy .env.example to .env and fill it in.');
}

function buildHeaders(apiKey, extra = {}) {
  const headers = { Authorization: `Bearer ${apiKey}`, Accept: 'application/json', ...extra };
  if (process.env.RATE_LIMIT_BYPASS_KEY) {
    headers['x-ratelimit-bypass'] = process.env.RATE_LIMIT_BYPASS_KEY;
  }
  return headers;
}

export async function send(apiKey, method, path, { json, form } = {}) {
  const url = new URL(path, process.env.API_ENDPOINT_DOMAIN);

  for (let attempt = 0; ; attempt += 1) {
    const init = { method, headers: buildHeaders(apiKey) };
    if (json !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(json);
    }
    if (form !== undefined) {
      init.body = form();
    }

    const res = await fetch(url, init);
    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = Number(res.headers.get('retry-after')) || 60;
      await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
      continue;
    }

    const text = await res.text();
    let body = text;
    try {
      body = JSON.parse(text);
    } catch {
      // Non-JSON bodies (e.g. plain-text errors) are returned as-is.
    }
    return { status: res.status, body };
  }
}

export async function getProject(apiKey) {
  const res = await send(apiKey, 'GET', 'v2/projects/me');
  if (res.status !== 200) {
    throw new Error(`GET /v2/projects/me returned ${res.status}: ${JSON.stringify(res.body)}`);
  }
  return res.body.data;
}

export function patchProject(apiKey, body) {
  return send(apiKey, 'PATCH', 'v2/projects/me', { json: body });
}

export async function uploadFile(apiKey, path, filePath, mimeType) {
  const bytes = await readFile(filePath);
  return send(apiKey, 'POST', path, {
    form: () => {
      const form = new FormData();
      form.append('file', new Blob([bytes], { type: mimeType }), basename(filePath));
      return form;
    },
  });
}
