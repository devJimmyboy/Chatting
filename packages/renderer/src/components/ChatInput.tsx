import { Command, histUp, joinChannel, login, sendMessage, setToken, updateInput, histDown } from '@/slices/chat'
import { Icon } from '@iconify/react'
import { Box, FloatingTooltip, List, ListItem, Popover, Popper, TextInput, Tooltip } from '@mantine/core'
import { useBooleanToggle } from '@mantine/hooks'
import React from 'react'
import { useAppSelector, useAppDispatch } from '../hooks'
import DraggableRegion, { WindowButtons } from './WindowBar'
import { Emote } from '@/utils/emotes'
import { emotesSelectors } from '../slices/emotes'

type Props = {}

export default function ChatInput({}: Props) {
  // const [channelOpen, toggleChannel] = useBooleanToggle(true)
  const emotes = useAppSelector((state) => emotesSelectors.selectIds(state)) as string[]
  const curChannel = useAppSelector((state) => state.chat.channel)
  const ignoring = useAppSelector((state) => state.main.ignoring)
  const input = useAppSelector((state) => state.chat.input)
  const dispatch = useAppDispatch()
  const commands = useAppSelector((state) => (state.chat.input.startsWith('/') ? state.chat.commands.filter((c) => c.available && c.code.startsWith(state.chat.input.split(' ')[0].substring(1))) : []))
  const cycle = React.useRef<string[]>([])
  const keyHandler = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.repeat && !e.key.match(/(Tab|Backspace)/)) {
        e.preventDefault()
        return
      }
      switch (e.key) {
        case 'Backspace':
          cycle.current = []
          break
        case 'Tab':
          e.preventDefault()
          if (commands.length > 0) dispatch(updateInput(input + commands[0].code.substring(input.length - 1)))
          else {
            const inputApp = input.split(' ')
            const query = inputApp.pop()
            if (!query) return
            if (cycle.current.length === 0) cycle.current = emotes.filter((e) => e.match(new RegExp(`^${query}`, 'i')))
            if (cycle.current.length === 0) return
            const index = cycle.current.findIndex((c) => c === query)
            const toAppend = cycle.current[(index + 1) % cycle.current.length]
            const first = inputApp.join(' ').length === 0 ? '' : `${inputApp.join(' ')} `
            dispatch(updateInput(first + toAppend))
          }
          break
        case 'Enter':
          e.preventDefault()
          cycle.current = []
          if (commands.length > 0) {
            const cmd = commands[0]
            switch (cmd.code) {
              case 'login':
                console.log(cmd)
                dispatch(login())
                break
              case 'join':
                const channel = input.split(' ')[1]
                dispatch(joinChannel(channel))
                break
            }
          } else {
            // console.log('not a command')
            dispatch(sendMessage())
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          dispatch(histUp())
          break
        case 'ArrowDown':
          e.preventDefault()
          dispatch(histDown())
          break
        case 'Escape':
          e.preventDefault()
          window.ipcRenderer.invoke('setIgnoringState', !ignoring)
      }
    },
    [commands, curChannel, input]
  )

  return (
    <>
      <Box id="channel-display" className="rounded-t-md ml-8 px-2 py-1 text-sm font-semibold w-fit h-fit select-none shadow-inner" sx={(theme) => ({ background: theme.colors.dark[8] })}>
        Channel: {curChannel || 'none'}
      </Box>

      <Popover
        className="w-full"
        trapFocus={false}
        width="100%"
        target={
          <TextInput
            variant="default"
            styles={{
              rightSection: {
                width: '5rem',
              },
              input: {
                paddingLeft: '1rem',
              },
            }}
            id="main-input"
            className="chat-input"
            placeholder={`Send a message...`}
            rightSection={<WindowButtons />}
            icon={<DraggableRegion />}
            value={input}
            onChange={(e) => dispatch(updateInput(e.target.value))}
            onKeyDown={keyHandler}
          />
        }
        position="bottom"
        placement="start"
        opened={!ignoring && commands.length > 0}>
        <List spacing="sm" className="flex flex-col px-4 w-full">
          {commands.map((com, i) => (
            <CommandView command={com} key={i} />
          ))}
        </List>
      </Popover>
    </>
  )
}
interface CommandProps {
  command: Command
}

function CommandView({ command }: CommandProps) {
  return (
    <List.Item className="flex flex-row h-4 rounded-md font-bold w-full">
      <span>{'/' + command.code}</span>
      <span className="ml-2 font-normal">{command.description}</span>
    </List.Item>
  )
}
