// preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orbAPI", {
  registerPage: (id) => ipcRenderer.send("orb:register", id),
  setIgnore: (ignore) => ipcRenderer.send("orb:set-ignore", !!ignore),
  forwardInput: (ev) => ipcRenderer.send("orb:forward-input", ev),
  capturePage: () => ipcRenderer.invoke("orb:capture"),
});
