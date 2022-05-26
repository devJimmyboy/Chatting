import { join } from "path"
import { app, BrowserWindow } from "electron";
import ElectronStore from "electron-store";
import { store } from './electron-store';
class Settings {
  window!: BrowserWindow;
  constructor(private store: ElectronStore) {
    app.whenReady().then(() => {
      this.window = new BrowserWindow({
        width: 400,
        height: 600,
        show: false,
        frame: false,
        icon: appIcon,
        webPreferences: {
          nodeIntegration: true,
          preload: join(__dirname, '../preload/index.cjs'),
        },
      });
      if (app.isPackaged) {
        this.window?.loadFile(join(__dirname, '../renderer/index.html'))
      } else {
        // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
        const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}/settings`

        this.window?.loadURL(url)
        // this.window?.webContents.openDevTools({ mode: "undocked" })
        // win.webContents.openDevTools()
      }
    }).catch(console.error);
  }

  toggleWindow() {
    this.window.isVisible() ? this.window.hide() : this.window.show();
  }

  set(key: string, value: any) {
    this.store.set(`settings.${key}`, value);
  }

  get(key: string) {
    return this.store.get(`settings.${key}`);
  }

}




const settings = new Settings(store);
export default settings
