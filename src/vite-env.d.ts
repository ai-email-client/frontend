/// <reference types="vite/client" />
interface Window {
  __API_BASE__: string
  electronAPI: {
    getApiPort: () => Promise<number>
    onOAuthCallback: (callback: (code: string) => void) => void
    on: (channel: string, listener: (...args: unknown[]) => void) => void
    off: (channel: string, listener: (...args: unknown[]) => void) => void
    send: (channel: string, ...args: unknown[]) => void
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  }
}