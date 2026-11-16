/**
 * Secrets for the .env file, made in the reader's browser with WebCrypto. Nothing leaves the page.
 * Alphanumeric only, so the values survive URLs, Docker Compose interpolation and kubectl.
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

/** An RSA private key as the JWK the catalog signs tokens with (SECURED_VIEW_JWK). */
export async function rsaJwk(cryptoImpl = globalThis.crypto) {
  const pair = await cryptoImpl.subtle.generateKey(
    {name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'},
    true,
    ['sign', 'verify'],
  );
  const jwk = await cryptoImpl.subtle.exportKey('jwk', pair.privateKey);
  const {kty, n, e, d, p, q, dp, dq, qi} = jwk;
  return JSON.stringify({kty, n, e, d, p, q, dp, dq, qi});
}

export async function generateSecrets(cryptoImpl = globalThis.crypto) {
  return {
    SECRET_KEY: randomString(50, cryptoImpl),
    SECURED_VIEW_JWK: await rsaJwk(cryptoImpl),
    PGPASSWORD: randomString(32, cryptoImpl),
    READIUM_PASSWORD: randomString(32, cryptoImpl),
    EVILFLOWERS_EMBEDDING_API_KEY: randomString(48, cryptoImpl),
  };
}
