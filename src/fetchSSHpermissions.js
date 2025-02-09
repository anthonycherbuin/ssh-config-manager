export default async function checkSshPermissions(fs, path, os) {
  const sshDir = path.join(os.homedir(), ".ssh");
  const filesToCheck = [
    { path: sshDir, expected: "700" }, // SSH Directory
    { path: path.join(sshDir, "id_rsa.pub"), expected: "644" }, // Public Key
    { path: path.join(sshDir, "id_rsa"), expected: "600" }, // Private Key
    { path: path.join(sshDir, "config"), expected: "600" }, // Config
  ];

  const results = [];

  for (const file of filesToCheck) {
    try {
      const stats = await fs.stat(file.path);

      const numericPerms = (stats.mode & 0o777).toString(8).padStart(3, "0");

      results.push({
        item: path.basename(file.path),
        path: file.path,
        actual: numericPerms,
        expected: file.expected,
        valid: numericPerms === file.expected,
      });
    } catch (error) {
      console.log(error);
      results.push({
        item: null,
      });
    }
  }

  return results;
}
