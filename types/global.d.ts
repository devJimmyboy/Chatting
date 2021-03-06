declare global {
  export type Events = {
    ignoringState: (state: boolean) => void;
    'main-process-message': (date: string) => void
    register: (type: "settings" | "main") => void
  }
  export type Commands = {
    setIgnoringState: (ignoringState?: boolean) => void;
    login: () => AccessToken | null
    "window-close": () => void;
    "window-settings": () => void;
    "window-minimize": () => void;
    "get-ignoring": () => boolean;
    "electron-store": (method: keyof import("electron-store"), key?: string, value?: any) => Promise<any | void>;
  }
  var ipcMain: import("electron-typed-ipc").TypedIpcMain<Events, Commands>;

}

declare module "electron" {
  interface BrowserWindow {
    webContents: import("electron-typed-ipc").TypedWebContents<Events>
  }
}
