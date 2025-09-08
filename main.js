// main.js (ESM)
import { app, BrowserWindow, ipcMain, webContents } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win;
let pageWC = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"), // preload stays CJS
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      backgroundThrottling: false,
    },
  });

  win.loadFile("index.html");

  // IMPORTANT: keep OS-level passthrough OFF by default
  win.setIgnoreMouseEvents(false);
}

// App lifecycle
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC wiring
ipcMain.on("orb:register", (_evt, id) => {
  pageWC = webContents.fromId(id);
});

ipcMain.on("orb:set-ignore", (_evt, ignore) => {
  if (win)
    win.setIgnoreMouseEvents(!!ignore, ignore ? { forward: true } : undefined);
});

ipcMain.on("orb:forward-input", (_evt, ev) => {
  if (pageWC) pageWC.sendInputEvent(ev);
});

ipcMain.handle("orb:capture", async () => {
  if (!pageWC) return { ok: false };
  const image = await pageWC.capturePage();
  const { width: w, height: h } = image.getSize();
  return { ok: true, png: image.toPNG(), w, h };
});
