// preload.cjs
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("orbAPI", {
  registerPage: (id) => ipcRenderer.send("orb:register", id),
  forwardInput: (ev) => ipcRenderer.send("orb:input", ev),
  setIgnore: (ignore) => ipcRenderer.send("orb:ignore", !!ignore),
  capturePage: () => ipcRenderer.invoke("orb:capture"),
});
