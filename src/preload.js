const { contextBridge, ipcRenderer } = require("electron");
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

/**
 * This preload script bridges between the renderer and main processes.
 * Expose safe APIs for the renderer to call via `window.electronAPI`.
 */
contextBridge.exposeInMainWorld("electronAPI", {
  loadConfig: () => ipcRenderer.invoke("load-config"),
  saveConfig: (content) => ipcRenderer.invoke("save-config", content),
  getKeys: () => ipcRenderer.invoke("get-keys"),
  generateKey: (keyName, passphrase, selectedEncryptionMethod, comment) =>
    ipcRenderer.invoke(
      "generate-key",
      keyName,
      passphrase,
      selectedEncryptionMethod,
      comment
    ),
  readPublicKeyFile: (keyName) =>
    ipcRenderer.invoke("readPublicKeyFile", keyName),
  openSSHConnection: (host) => ipcRenderer.invoke("openSSHConnection", host),
  runCommand: (command) => ipcRenderer.invoke("runCommand", command),
  deleteKey: (keyName) => ipcRenderer.invoke("delete-key", keyName),
  onUpdateKeys: (callback) =>
    ipcRenderer.on("update-keys", (_, keys) => callback(keys)),
  checkSshPermissions: () => ipcRenderer.invoke("check-ssh-permissions"),
  showNotification: (title, body) =>
    ipcRenderer.send("show-notification", title, body),
});
