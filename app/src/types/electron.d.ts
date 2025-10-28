export {}

declare global {
  interface Window {
    electron: {
      send: (channel: string, data: any) => void
      on: (channel: string, callback: (data: any) => void) => void
      once: (channel: string, callback: (data: any) => void) => void
      invoke: (channel: string, ...args: any[]) => Promise<any>
      removeListener: (channel: string, callback: (...args: any[]) => void) => void
    }
  }
}

