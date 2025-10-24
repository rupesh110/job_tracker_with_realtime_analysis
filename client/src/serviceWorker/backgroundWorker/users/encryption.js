async function encryptData(plain) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("jobtracker-secret"),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new TextEncoder().encode("salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(plain))
  );
  return { cipher, iv: Array.from(iv) };
}
