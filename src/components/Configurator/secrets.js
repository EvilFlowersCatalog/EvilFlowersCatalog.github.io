/**
 * Secrets for .env, made with WebCrypto in the reader's browser (or Node for the checks).
 * Alphanumeric, so the values survive URLs, Docker Compose, kubectl and htpasswd.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function randomString(length, cryptoImpl = globalThis.crypto) {
  const out = [];
  const bytes = new Uint8Array(length * 2);
  while (out.length < length) {
    cryptoImpl.getRandomValues(bytes);
    for (const b of bytes) {
      // 248 = 4 × 62: drop the top values so every character is equally likely.
      if (b < 248 && out.length < length) out.push(ALPHABET[b % 62]);
    }
  }
  return out.join('');
}

/** An RSA private key as the JWK the catalog signs access tokens with (SECURED_VIEW_JWK). */
async function rsaJwk(cryptoImpl) {
  const pair = await cryptoImpl.subtle.generateKey(
    {name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'},
    true,
    ['sign', 'verify'],
  );
  const {kty, n, e, d, p, q, dp, dq, qi} = await cryptoImpl.subtle.exportKey('jwk', pair.privateKey);
  return JSON.stringify({kty, n, e, d, p, q, dp, dq, qi});
}

/** An htpasswd line in the {SHA} scheme, which the Readium servers read. */
async function htpasswd(user, password, cryptoImpl) {
  const digest = new Uint8Array(await cryptoImpl.subtle.digest('SHA-1', new TextEncoder().encode(password)));
  return `${user}:{SHA}${btoa(String.fromCharCode(...digest))}`;
}

export async function generateSecrets(cryptoImpl = globalThis.crypto) {
  const secrets = {
    SECRET_KEY: randomString(50, cryptoImpl),
    SECURED_VIEW_JWK: await rsaJwk(cryptoImpl),
    PGPASSWORD: randomString(32, cryptoImpl),
    ELVIRA_READIUM_PASSWORD: randomString(32, cryptoImpl),
    EVILFLOWERS_EMBEDDING_API_KEY: randomString(48, cryptoImpl),
  };
  secrets.READIUM_HTPASSWD = await htpasswd('evilflowers', secrets.ELVIRA_READIUM_PASSWORD, cryptoImpl);
  return secrets;
}
