const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  addApp: (app) => ipcRenderer.send('add-app', app),
  installApp: (installUrl) => ipcRenderer.send('install-app', installUrl),
  uninstallApp: (uninstallUrl) => ipcRenderer.send('uninstall-app', uninstallUrl),
  onCommandReply: (callback) => ipcRenderer.on('command-reply', (_event, value) => callback(value)),
  onAppListUpdate: (callback) => ipcRenderer.on('app-list-update', (_event, value) => callback(value))
});