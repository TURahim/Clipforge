import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // IPC communication methods
  send: (channel: string, data: any) => {
    // Whitelist channels
    const validChannels = [
      'import-video',
      'export-video',
      'get-video-metadata',
      'generate-thumbnail',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
  
  on: (channel: string, callback: (data: any) => void) => {
    const validChannels = [
      'import-video-complete',
      'export-progress',
      'export-complete',
      'export-error',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_event, data) => callback(data))
    }
  },
  
  once: (channel: string, callback: (data: any) => void) => {
    const validChannels = [
      'import-video-complete',
      'export-complete',
      'export-error',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (_event, data) => callback(data))
    }
  },
  
  invoke: async (channel: string, ...args: any[]) => {
    const validChannels = [
      'import-video',
      'export-video',
      'get-video-metadata',
      'generate-thumbnail',
      'open-file-dialog',
      'save-file-dialog',
    ]
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, ...args)
    }
  },
  
  removeListener: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'import-video-complete',
      'export-progress',
      'export-complete',
      'export-error',
    ]
    if (validChannels.includes(channel)) {
      ipcRenderer.removeListener(channel, callback)
    }
  },
})

// Type declaration for TypeScript
declare global {
  interface Window {
    electron: {
      send: (channel: string, data: any) => void
      on: (channel: string, callback: (data: any) => void) => void
      once: (channel: string, callback: (data: any) => void) => void
      invoke: (channel: string, data?: any) => Promise<any>
      removeListener: (channel: string, callback: (...args: any[]) => void) => void
    }
  }
}

