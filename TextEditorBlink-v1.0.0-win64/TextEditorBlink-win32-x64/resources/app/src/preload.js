const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  saveCollection: (collection) => ipcRenderer.invoke('save-collection', collection),
  exportCollection: (data) => ipcRenderer.invoke('export-collection', data),
  openCollection: () => ipcRenderer.invoke('open-collection'),
  
  // Listen for menu events
  onNewFile: (callback) => ipcRenderer.on('menu-new-file', callback),
  onOpenFile: (callback) => ipcRenderer.on('menu-open-file', callback),
  onSaveFile: (callback) => ipcRenderer.on('menu-save-file', callback),
  onSaveAsFile: (callback) => ipcRenderer.on('menu-save-as-file', callback),
  onToggleDarkMode: (callback) => ipcRenderer.on('menu-toggle-dark-mode', callback),
  onIncreaseFont: (callback) => ipcRenderer.on('menu-increase-font', callback),
  onDecreaseFont: (callback) => ipcRenderer.on('menu-decrease-font', callback),
  onResetFont: (callback) => ipcRenderer.on('menu-reset-font', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});