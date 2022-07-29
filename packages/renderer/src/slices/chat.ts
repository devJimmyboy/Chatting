import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PrivateMessage } from '@twurple/chat'
import { AccessToken } from '@twurple/auth'
import { Emote } from '../utils/emotes'
import { ChattersList } from '@twurple/api/lib'
interface ChatState {
  chatters: ChattersList | null
  channel: string
  messages: PrivateMessage[]
  history: string[]
  index: number
  input: string
  token: AccessToken | null
  commands: Command[]
  cycle: (string | Emote)[]
}
export interface Command {
  available: boolean
  code: string
  description: string
  onExecute?: (input: string) => void
}

const initialState: ChatState = {
  cycle: [],
  chatters: null,
  channel: '',
  input: '',
  history: [],
  index: -1,
  messages: [],
  commands: [
    {
      available: !window.token,
      code: 'login',
      description: 'Login to twitch chat',
    },
    {
      available: true,
      code: 'join',
      description: 'Join a channel',
    },
  ],
  token: window.token,
}

export const login = createAsyncThunk('chat/login', async (arg, api) => {
  const token = await window.ipcRenderer.invoke('login')

  return token
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    updateInput: (state, action: PayloadAction<string>) => {
      state.input = action.payload
    },
    addMessage: (state, action: PayloadAction<PrivateMessage>) => {
      state.messages.push(action.payload)
    },
    updateChatters: (state, action: PayloadAction<ChattersList>) => {
      state.chatters = action.payload
    },
    histUp: (state) => {
      if (state.history.length === 0 || state.index === 0) return
      if (state.index === -1) {
        state.index = state.history.length - 1
      } else state.index--
      const next = state.history[state.index]
      state.input = next
    },
    histDown: (state) => {
      if (state.history.length === 0) return
      if (state.index === -1) return
      state.index++
      if (state.index === state.history.length) {
        state.index = -1
        state.input = ''
      } else {
        const next = state.history[state.index]
        state.input = next
      }
    },
    setToken: (state, action: PayloadAction<AccessToken | null>) => {
      state.token = action.payload
      const loginIndex = state.commands.findIndex((cmd) => cmd.code === 'login')
      if (loginIndex !== -1 && action.payload) state.commands[loginIndex].available = false
    },
    joinChannel: (state, action: PayloadAction<string>) => {
      client.join(action.payload)
      state.channel = action.payload
      state.input = ''
    },
    sendMessage: (state) => {
      if (state.channel.length === 0) return
      state.history.push(state.input)
      if (state.history.length > 50) state.history.shift()
      client.say(state.channel, state.input)
      state.input = ''
      state.index = -1
    },
    updateCycle: (state, action: PayloadAction<(string | Emote)[]>) => {
      state.cycle = action.payload
    },
    turnCycle: (state) => {
      if (state.cycle.length === 0) return
      const inputApp = state.input.split(' ')
      const query = inputApp.pop()
      console.debug(query)
      if (!query) return
      const index = state.cycle.findIndex((c) => (typeof c === 'string' ? c === query : c.emoteName === query))

      const next = state.cycle[(index + 1) % state.cycle.length]
      const toAppend = typeof next === 'string' ? next : next.emoteName
      const first = inputApp.join(' ').length === 0 ? '' : `${inputApp.join(' ')} `
      state.input = first + toAppend
    },
    clearCycle: (state) => {
      state.cycle = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(login.fulfilled, (state, action) => {
      state.token = action.payload
      const loginIndex = state.commands.findIndex((cmd) => cmd.code === 'login')
      if (loginIndex !== -1 && action.payload) state.commands[loginIndex].available = false
    })
  },
})

export default chatSlice.reducer

export const { updateInput, addMessage, setToken, joinChannel, histUp, sendMessage, histDown, clearCycle, turnCycle, updateCycle, updateChatters } = chatSlice.actions
