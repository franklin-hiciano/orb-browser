const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('orbAPI', {
  registerPage: (id) => ipcRenderer.invoke('register-page', id),
  capturePage:  () => ipcRenderer.invoke('capture-page'),
  forwardInput: (ev) => ipcRenderer.invoke('forward-input', ev)
});
