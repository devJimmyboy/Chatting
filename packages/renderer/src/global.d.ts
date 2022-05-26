export { }


declare global {
  interface Window {
    // Expose some Api through preload script
    fs: typeof import('fs')
    ipcRenderer: import('electron-typed-ipc').TypedIpcRenderer<Events, Commands>
    removeLoading: () => void
    tokenPromise: Promise<import("@twurple/auth").AccessToken | null>
    token: import("@twurple/auth").AccessToken | null
    electronStorage: import('redux-persist-electron-storage')

  }
  var client: import("@twurple/chat").ChatClient
}

