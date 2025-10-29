export interface IElectronAPI {
  send: (channel: string, data: unknown) => void
  on: (channel: string, callback: (data: unknown) => void) => void
  once: (channel: string, callback: (data: unknown) => void) => void
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}
