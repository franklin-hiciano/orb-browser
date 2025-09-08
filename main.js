// main.js (ESM)
import { app, BrowserWindow, ipcMain, webContents } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let win, pageWC;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    transparent: true,
    frame: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      webviewTag: true, // <-- REQUIRED
    },
  });
  win.setIgnoreMouseEvents(false, { forward: true });
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

ipcMain.on("orb:register", (_evt, id) => {
  pageWC = webContents.fromId(id);
  console.log("registered webview wc id:", id);
});

ipcMain.on("orb:ignore", (_evt, ignore) => {
  if (win) win.setIgnoreMouseEvents(!!ignore, { forward: true });
});

ipcMain.on("orb:input", (_evt, ev) => {
  if (pageWC && !pageWC.isDestroyed()) pageWC.sendInputEvent(ev);
});

ipcMain.handle("orb:capture", async () => {
  if (!pageWC || pageWC.isDestroyed()) return { ok: false, why: "no-pageWC" };
  const img = await pageWC.capturePage(); // no rect; grab visible
  const { width: dipW, height: dipH } = img.getSize(); // DIP size
  const dpr = await pageWC.executeJavaScript("window.devicePixelRatio||1");
  const w = Math.round(dipW * dpr),
    h = Math.round(dipH * dpr);
  return { ok: w > 8 && h > 8, w, h, png: img.toPNG() };
});
win?.on?.("focus", () => win.setIgnoreMouseEvents(false, { forward: true }));
