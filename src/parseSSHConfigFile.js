/* This JavaScript function `parseSshConfigManagerSection` is designed to parse a specific section of
an SSH configuration file. It looks for a section delimited by markers `# --------- BEGINNING OF SSH
CONFIG MANAGER CONFIG ----------` and `# --------- END OF SssSH CONFIG MANAGER CONFIG ----------`. */
export default function parseSshConfigManagerSection(configContent) {
  const startMarker = "# --------- BEGINNING OF SssSH CONFIG ----------";
  const endMarker = "# --------- END OF SssSH CONFIG MANAGER CONFIG ----------";

  const startIndex = configContent.indexOf(startMarker);
  const endIndex = configContent.indexOf(endMarker);

  // If markers aren't found or are in the wrong order, return an empty array
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    return [];
  }

  // Extract just the manager-config section
  const managerSection = configContent.substring(
    startIndex + startMarker.length,
    endIndex
  );

  const lines = managerSection.split("\n");
  const results = [];

  let currentHost = null;

  for (let line of lines) {
    line = line.trim();

    // Skip empty lines or comment lines
    if (!line || line.startsWith("#")) {
      continue;
    }

    // A new Host block
    if (line.startsWith("Host ")) {
      // If we already have a Host object in progress, push it to results
      if (currentHost) {
        results.push(currentHost);
      }
      // Create a new object for this host
      const hostName = line.replace(/^Host\s+/, "").trim();
      currentHost = {
        Host: hostName,
        Hostname: "",
        User: "",
        UseKeychain: "",
        IdentityFile: "",
      };
    } else if (currentHost) {
      // We are within a Host block, so parse possible directives
      // Lines look like "HostName github.com", "User git", "IdentityFile ~/.ssh/..."
      const [key, ...rest] = line.split(/\s+/);
      const value = rest.join(" ");

      switch (key) {
        case "HostName":
          currentHost.Hostname = value;
          break;
        case "UseKeychain":
          currentHost.UseKeychain = value;
          break;
        case "User":
          currentHost.User = value;
          break;
        case "IdentityFile":
          currentHost.IdentityFile = /[^/]*$/.exec(value)[0];
          break;
        default:
          // You can handle other SSH config directives if needed
          break;
      }
    }
  }

  // Push the last host found, if any
  if (currentHost) {
    results.push(currentHost);
  }

  return results;
}
