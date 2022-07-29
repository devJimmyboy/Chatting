import { useElectronStateIPC } from 'electron-state-ipc/react'
import { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import ChatInput from './components/ChatInput'
import DraggableRegion, { WindowButtons } from './components/WindowBar'
import { useAppSelector } from './hooks'

const App = () => {
  const state = useElectronStateIPC()
  const ignoring = useAppSelector((state) => state.main.ignoring)
  if (!state.initialized) return null

  return (
    <div className={`transition-opacity w-full h-full ${ignoring ? 'ignoring' : ''}`}>
      <Routes>
        <Route index element={<ChatInput />} />
        <Route path="settings" element={<div />} />
      </Routes>
    </div>
  )
}

export default App
