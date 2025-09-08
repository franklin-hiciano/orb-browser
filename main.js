import { app, BrowserWindow, ipcMain, webContents } from "electron";
let win,
  pageWCid = null;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: true,
    frame: true, // frame:false if you want a frameless overlay
    backgroundColor: "#00000000",
    webPreferences: {
      preload: new URL("./preload.cjs", import.meta.url).pathname,
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      offscreen: false,
    },
  });
  win.loadFile("index.html");
});

ipcMain.handle("register-page", (_, id) => {
  pageWCid = id;
});

ipcMain.handle("capture-page", async () => {
  if (!pageWCid) return { ok: false };
  const wc = webContents.fromId(pageWCid);
  const img = await wc.capturePage(); // visible area @ device scale
  const { width, height } = img.getSize();
  return { ok: true, png: img.toPNG(), w: width, h: height };
});

ipcMain.handle("forward-input", (_, ev) => {
  if (!pageWCid) return;
  webContents.fromId(pageWCid).sendInputEvent(ev);
});

// main.js
win.setIgnoreMouseEvents(true, { forward: true });
// then toggle to false via IPC while cursor is inside an orb.
