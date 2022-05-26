import fs from 'fs'
import { exposeStateIPC } from 'electron-state-ipc';
import { contextBridge, ipcRenderer } from 'electron'
import { domReady } from './utils'
import { useLoading } from './loading'
import ElectronStore from 'electron-store';
import createElectronStorage from 'redux-persist-electron-storage';

const electronStore = new ElectronStore({ name: "redux-store" })
const electronStorage = createElectronStorage({
  electronStore,
})



const { appendLoading, removeLoading } = useLoading()

  ; (async () => {
    await domReady()

    appendLoading()
  })()

// --------- Expose some API to the Renderer process. ---------
contextBridge.exposeInMainWorld("electronStorage", electronStorage)
contextBridge.exposeInMainWorld('fs', fs)
contextBridge.exposeInMainWorld('removeLoading', removeLoading)
contextBridge.exposeInMainWorld('ipcRenderer', withPrototype(ipcRenderer))
contextBridge.exposeInMainWorld("tokenPromise", ipcRenderer.invoke("login").then(token => token || null))


// `exposeInMainWorld` can't detect attributes and methods of `prototype`, manually patching it.
function withPrototype(obj: Record<string, any>) {
  const protos = Object.getPrototypeOf(obj)

  for (const [key, value] of Object.entries(protos)) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) continue

    if (typeof value === 'function') {
      // Some native APIs, like `NodeJS.EventEmitter['on']`, don't work in the Renderer process. Wrapping them into a function.
      obj[key] = function (...args: any) {
        return value.call(obj, ...args)
      }
    } else {
      obj[key] = value
    }
  }
  return obj
}

exposeStateIPC();
