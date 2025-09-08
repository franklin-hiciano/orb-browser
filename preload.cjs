// preload.cjs
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("orbAPI", {
  setIgnore: (ignore) => ipcRenderer.send("set-ignore", ignore),
});
