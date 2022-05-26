import { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import ChatInput from './components/ChatInput'
import DraggableRegion, { WindowButtons } from './components/WindowBar'
import { useAppSelector } from './hooks'

const App = () => {
  const ignoring = useAppSelector((state) => state.main.ignoring)
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
