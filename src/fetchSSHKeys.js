const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const sshDir = path.join(process.env.HOME || process.env.USERPROFILE, ".ssh");

function ensureSshDir() {
  if (!fs.existsSync(sshDir)) {
    fs.mkdirSync(sshDir, { recursive: true });
  }
}

export default function getKeysInfo() {
  ensureSshDir();

  return fs
    .readdirSync(sshDir)
    .filter((file) => file.endsWith(".pub"))
    .map((pubFile) => {
      const fullPath = path.join(sshDir, pubFile);

      // Get the key name (strip the .pub extension).
      const keyName = pubFile.replace(".pub", "");

      // Get file stats to retrieve creation (birth) time.
      const stats = fs.statSync(fullPath);

      // Read the public key data.
      const keyData = fs.readFileSync(fullPath, "utf8");

      // The public key line is often space-separated:
      // e.g. "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... user@host"
      // We only need the raw base64 portion for hashing.
      const parts = keyData.trim().split(/\s+/);
      if (parts.length < 2) {
        return {
          name: keyName,
          creationDate: stats.birthtime,
          fingerprint: "Could not parse public key",
        };
      }

      const base64Key = parts[1];
      // Convert base64 key to a Buffer and get a SHA256 fingerprint.
      const pubKeyBuffer = Buffer.from(base64Key, "base64");
      const fullFingerprint = crypto
        .createHash("sha256")
        .update(pubKeyBuffer)
        .digest("base64");

      // If you only want the "beginning" of the fingerprint, truncate as desired.
      const partialFingerprint = fullFingerprint.substring(0, 10);

      return {
        name: keyName,
        creationDate: stats.birthtime, // or stats.ctime, depending on your need
        fingerprint: partialFingerprint,
      };
    });
}
