import './styles/index.css'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Loader, MantineProvider } from '@mantine/core'
import { Provider } from 'react-redux'
import { ElectronStateIPCContextProvider, useElectronStateIPC } from 'electron-state-ipc/react'

import App from './App'
import { persistor, store } from './store'
import './samples/electron-store'
import './samples/preload-module'
import { getIgnore, setIgnoreState } from './slices/mainSlice'
import { theme } from './theme'
import { ChatClient } from '@twurple/chat'
import { StaticAuthProvider } from '@twurple/auth'
import { setToken } from './slices/chat'
import { HashRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import React from 'react'
import { ApiClient } from '@twurple/api'

// window.addEventListener('mouseenter', () => window.ipcRenderer.send('mouse-enter'))
// window.addEventListener('mouseleave', () => window.ipcRenderer.send('mouse-leave'))

window.ipcRenderer.on('ignoringState', (e, ignoring) => {
  store.dispatch(setIgnoreState(ignoring as boolean))
  if (!ignoring) {
    document.getElementById('main-input')!.focus()
  }
})

window.onload = () => {
  initChat()
  store.dispatch(getIgnore())
}
async function initChat() {
  const token = await window.tokenPromise
  window.token = token
  store.dispatch(setToken(token))
  if (token) {
    const auth = new StaticAuthProvider(import.meta.env.VITE_CLIENT_ID, token?.accessToken, ['chat:read', 'chat:edit'], 'user')
    window.client = new ChatClient({ authProvider: auth })
    window.api = new ApiClient({ authProvider: auth })
  } else {
    window.client = new ChatClient({ logger: { minLevel: 'debug' } })
  }
  client.connect()
}

const root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <React.Suspense fallback={<Loader />}>
      <ElectronStateIPCContextProvider>
        <Root />
      </ElectronStateIPCContextProvider>
    </React.Suspense>
  </StrictMode>
)

function Root() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loader />} persistor={persistor}>
        <MantineProvider theme={theme} withGlobalStyles>
          <HashRouter>
            <App />
          </HashRouter>
        </MantineProvider>
      </PersistGate>
    </Provider>
  )
}
window.removeLoading()
