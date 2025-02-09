const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  nativeImage,
  Tray,
} = require("electron");
import "./index.css";
import path from "node:path";
const fs = require("fs");
const fspromise = require("fs").promises;
const os = require("os");
const { exec, spawn, childProcess } = require("child_process");
import started from "electron-squirrel-startup";
import getKeysInfo from "./fetchSSHKeys";
import checkSshPermissions from "./fetchSSHpermissions";

// const trayIcon = nativeImage.createFromPath('/assets/success.png')

// const tray = new Tray(trayIcon)
const homeDir = os.homedir();
const sshDir = path.join(homeDir, ".ssh");
const configPath = path.join(sshDir, "config");
const startMarker = "# --------- BEGINNING OF SssSH CONFIG ----------";
const endMarker = "# --------- END OF SssSH CONFIG MANAGER CONFIG ----------";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// Create .ssh directory if it doesn't exist
function ensureSshDir() {
  try {
    if (!fs.existsSync(sshDir)) {
      fs.mkdirSync(sshDir, { mode: 0o700 });
    }
  } catch (error) {
    console.error("Error creating .ssh directory:", error);
  }
}

// Returns array of key names without the .pub extension
function getKeyNames() {
  ensureSshDir();
  return getKeysInfo();
}

// Refresh the list of keys on the renderer
function refreshKeys(win) {
  const keys = getKeyNames();
  win.webContents.send("update-keys", keys);
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    icon: "/public/assets/logo.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
  return mainWindow;
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const win = createWindow();

  // In macOS, re-create a window when the dock icon is clicked
  // and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Once the window is ready to show, let’s refresh the key list
  // and load config so the UI is in sync.
  win.webContents.on("did-finish-load", () => {
    refreshKeys(win);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// -------------------------- IPC HANDLERS -------------------------- //

ipcMain.on("show-notification", (_, title, body) => {
  // Let path do the directory join:
  const imagePath = path.join(__dirname, "assets", "success.png");
  const img = nativeImage.createFromPath(imagePath);

  dialog.showMessageBoxSync({
    type: "info",
    title,
    message: body,
    icon: img,
    buttons: ["OK"],
  });

  // new Notification({
  //   title: title,
  //   body: body,
  //   silent: true,
  //   icon: path.join(__dirname, 'icon.png')
  // }).show();
});

ipcMain.handle("check-ssh-permissions", async () => {
  return checkSshPermissions(fspromise, path, os);
});

ipcMain.handle("load-config", async () => {
  ensureSshDir();

  // If the config file doesn't exist, return empty string
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, "", { encoding: "utf-8", mode: 0o600 });
    return "";
  }

  // Otherwise, read the config file
  let configContent = fs.readFileSync(configPath, "utf-8");

  // Check for markers
  let startIndex = configContent.indexOf(startMarker);
  let endIndex = configContent.indexOf(endMarker);

  // If markers aren't found or are in the wrong order, append them at the end
  if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
    // Ensure there is a newline at the end of the file
    if (!configContent.endsWith("\n")) {
      configContent += "\n";
    }

    // Append the SSH Config Manager markers
    configContent += `${startMarker}\n${endMarker}\n`;

    // Write the updated config back to disk
    fs.writeFileSync(configPath, configContent, "utf-8");
  }

  // Return the (potentially) updated config file content
  return configContent;
});

ipcMain.handle("save-config", async (_, content) => {
  ensureSshDir();
  fs.writeFileSync(configPath, content, { encoding: "utf-8" });
  return true; // indicate success
});

ipcMain.handle("get-keys", async () => {
  return getKeyNames();
});

ipcMain.handle(
  "generate-key",
  async (_, keyName, passphrase, selectedEncryptionMethod, comment) => {
    ensureSshDir();
    // Optional: check if key already exists and handle accordingly
    const keyPath = path.join(sshDir, keyName);
    if (fs.existsSync(keyPath) || fs.existsSync(`${keyPath}.pub`)) {
      throw new Error(`Key "${keyName}" already exists`);
    }

    const passphraseArg = passphrase ? `-N "${passphrase}"` : '-N ""';
    const encryption = selectedEncryptionMethod;

    return new Promise((resolve, reject) => {
      // Include passphrase in command if provided:
      const command = `ssh-keygen -t ${encryption} -C "${comment}" -b 4096 -f "${keyPath}" ${passphraseArg}`;

      exec(command, (error) => {
        if (error) {
          dialog.showErrorBox("Error generating key", error.message);
          return reject(error);
        }
        resolve();
      });
    });
  }
);

ipcMain.handle("readPublicKeyFile", async (event, keyName) => {
  try {
    const keyPath = path.join(os.homedir(), ".ssh", `${keyName}.pub`);
    const content = fs.readFileSync(keyPath, "utf8");
    return content;
  } catch (error) {
    throw new Error(`Unable to read public key file: ${error.message}`);
  }
});

ipcMain.handle("runCommand", async (event, command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      // You could return stdout/stderr if you need it in the renderer.
      resolve({ stdout, stderr });
    });
  });
});

ipcMain.handle("delete-key", async (_, keyName) => {
  const privateKeyPath = path.join(sshDir, keyName);
  const publicKeyPath = path.join(sshDir, `${keyName}.pub`);

  [privateKeyPath, publicKeyPath].forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
  return true;
});

ipcMain.handle("openSSHConnection", async (event, host) => {
  console.log("ssh:", host);
  const platform = os.platform();
  console.log(platform);
  switch (platform) {
    case "darwin":
      {
        const appleScript = `
        tell application "Terminal"
          activate
          do script "ssh ${host}"
        end tell
      `;

        spawn("osascript", ["-e", appleScript], {
          detached: true,
          stdio: "ignore",
        });
      }
      break;
    default: {
      // Linux or other Unix-like: Attempt using xterm (you could also try gnome-terminal, konsole, etc. if available)
      spawn("gnome-terminal", ["--", "ssh", host], {
        detached: true,
        stdio: "ignore",
      });
      break;
    }
  }
});
