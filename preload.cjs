const { contextBridge, ipcRenderer } = require("electron");
// … expose orbAPI …

contextBridge.exposeInMainWorld("orbAPI", {
  setIgnore: (b) => ipcRenderer.send("set-ignore", b),
  forwardInput: (ev) => ipcRenderer.invoke("forward-input", ev),
  registerPage: (id) => ipcRenderer.invoke("register-page", id),
});
