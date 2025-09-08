const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("orbAPI", {
  setIgnore: (b) => ipcRenderer.send("set-ignore", b),
  forwardInput: (ev) => ipcRenderer.invoke("forward-input", ev),
  registerPage: (id) => ipcRenderer.invoke("register-page", id),
  capturePage: () => ipcRenderer.invoke("capture-page"),
});
