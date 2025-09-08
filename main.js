// main.js
import { app, BrowserWindow, ipcMain, webContents } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let win;
let pageWCid = null;
ipcMain.handle("register-page", (_e, id) => {
  pageWCid = id;
  return true;
});

// OS passthrough: ignore mouse when *outside* the orbs
ipcMain.on("set-ignore", (e, ignore) => {
  const bw = BrowserWindow.fromWebContents(e.sender); // <-- get the right window
  if (!bw || bw.isDestroyed()) return;
  bw.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
});
app.commandLine.appendSwitch("enable-transparent-visuals"); // Linux
process.env.ELECTRON_OZONE_PLATFORM_HINT ||= "x11"; // or run with --ozone-platform-hint=x11
app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: true, // ← add this
    },
  });

  win.loadFile("index.html");
});

ipcMain.handle("capture-page", async () => {
  if (!pageWCid) return { ok: false };
  const wc = webContents.fromId(pageWCid);
  const img = await wc.capturePage();
  const png = img.toPNG();
  const { width: w, height: h } = img.getSize();
  return { ok: true, png, w, h };
});

ipcMain.handle("forward-input", (_, ev) => {
  if (!pageWCid) return;
  webContents.fromId(pageWCid).sendInputEvent(ev);
});

// main.js
// then toggle to false via IPC while cursor is inside an orb.
