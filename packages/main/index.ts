import "source-map-support/register"
import { join } from 'path'
import { setupGlobalStateIPC } from 'electron-state-ipc';
import { app, BrowserWindow, dialog, nativeImage, NativeImage, session, shell } from 'electron'
import windowStateKeeper from "electron-window-state"
import { release } from 'os'
import "./ipc"
import './electron-store'
// import './samples/npm-esm-packages'

declare global {
  var win: BrowserWindow | null
  var appIcon: NativeImage | null
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

const state = setupGlobalStateIPC();

global.win = null
global.appIcon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.ico'))

let stateKeeper: ReturnType<typeof windowStateKeeper> | null = null
async function createWindow() {
  stateKeeper = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 300,
  })
  const ses = session.fromPartition("persist:chatting")
  win = new BrowserWindow({
    x: stateKeeper!.x,
    y: stateKeeper!.y,
    width: stateKeeper!.width,
    height: stateKeeper!.height,
    icon: appIcon || undefined,
    frame: false,
    transparent: true,
    backgroundColor: '#00000001',
    minHeight: 150,
    maxHeight: 200,
    minWidth: 300,
    maxWidth: 1000,
    alwaysOnTop: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      session: ses,
    },
  })

  stateKeeper.manage(win);
  win.setIgnoreMouseEvents(true, { forward: true })
  win.focus()
  globalThis.win = win;

  if (app.isPackaged) {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}`

    win.loadURL(url)
    win?.webContents.openDevTools({ mode: "undocked" })
    // win.webContents.openDevTools()
  }

  // Test active push message to Renderer-process
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    process.exit(0)
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  if (win) {
    win.focus()
  } else {
    createWindow()
  }
})

process.on("unhandledRejection", (reason, p) => {
  console.error(reason, p)
  dialog.showErrorBox("Unhandled Rejection", `${reason}\n${p}`)
})

process.on("uncaughtException", (err) => {
  console.error(err)
  dialog.showErrorBox("Uncaught Exception", `${err.name}:\n${err.message}\n${err.stack}`)

})
