import React from 'react'
import { Icon } from '@iconify/react'
import { ActionIcon, useMantineTheme } from '@mantine/core'

export default function DraggableRegion() {
  return (
    <div className="window-bar flex flex-row py-0.5 px-2 items-center justify-end cursor-move">
      <Icon icon="fas:grip-dots-vertical" />
    </div>
  )
}

export function WindowButtons() {
  return (
    <div className="flex flex-row items-center justify-end pr-2">
      <ActionIcon
        onClick={() => {
          window.ipcRenderer.invoke('window-minimize')
        }}>
        <Icon icon="fas:window-minimize" />
      </ActionIcon>
      <ActionIcon
        onClick={() => {
          window.open('/settings')
        }}>
        <Icon icon="fas:gear" />
      </ActionIcon>
      <ActionIcon
        onClick={() => {
          window.ipcRenderer.invoke('window-close')
        }}>
        <Icon icon="fas:xmark" />
      </ActionIcon>
    </div>
  )
}
