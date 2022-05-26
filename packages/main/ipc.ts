import { config } from "dotenv"
config()
// import { AccessToken } from '@twurple/auth';
import { ElectronAuthProvider } from "@twurple/auth-electron"
import { ipcMain as ipc, globalShortcut, app } from 'electron';
import settings from "./settings";


globalThis.ipcMain = ipc;

var ignoring = true;

console.log("VITE_CLIENT_ID:", import.meta.env.VITE_CLIENT_ID)
console.log("VITE_CLIENT_ID:", import.meta.env.VITE_REDIRECT_URI)
const auth = new ElectronAuthProvider({ clientId: import.meta.env.VITE_CLIENT_ID, redirectUri: import.meta.env.VITE_REDIRECT_URI }, {

})

app.whenReady().then(() => {
  const ret = globalShortcut.register('F9', () => {
    console.log('F9 was pressed');
    if (win) {
      win.setIgnoreMouseEvents(!ignoring, { forward: true });
      ignoring = !ignoring;
      win.webContents.send("ignoringState", ignoring);
      if (ignoring) win.blur()
      else win.focus()
    }
    else console.log('win is null')
  });
  if (!ret) {
    console.log('registration failed');
  }
})

ipcMain.handle("login", async (e) => {
  const token = await auth.getAccessToken(["chat:read", "chat:edit"])
  return token
})

ipcMain.handle("get-ignoring", (e) => {
  return ignoring
})

ipcMain.handle("setIgnoringState", (e, state = !ignoring) => {
  if (win) {
    win.setIgnoreMouseEvents(state, { forward: true });
    ignoring = state;
    win.webContents.send("ignoringState", ignoring);
    if (state) win.blur()
    else win.focus()
  }

})

ipcMain.handle("window-close", (e) => {
  if (win) win.close()
})

ipcMain.handle("window-minimize", (e) => {
  if (win && win.minimizable) win.minimize()
})

ipcMain.handle("window-settings", (e) => {
  settings.toggleWindow();
})

