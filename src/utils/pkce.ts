import * as Crypto from "expo-crypto";

const RANDOM_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

function toBase64Url(value: string) {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function generateRandomString(length: number) {
  const randomBytes = Crypto.getRandomBytes(length);

  return Array.from(randomBytes, (value) => RANDOM_CHARSET[value % RANDOM_CHARSET.length]).join("");
}

export function generateCodeVerifier() {
  return generateRandomString(96);
}

export async function generateCodeChallenge(verifier: string) {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );

  return toBase64Url(digest);
}

export function generateState() {
  return generateRandomString(32);
}

export function generateNonce() {
  return generateRandomString(32);
}
