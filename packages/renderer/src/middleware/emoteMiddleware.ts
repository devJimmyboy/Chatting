import { createListenerMiddleware, isAnyOf, Middleware, TypedStartListening } from '@reduxjs/toolkit'

import { joinChannel, updateChatters, updateCycle, updateInput } from '@/slices/chat'
import { AppDispatch } from '@/store'
import { RootState } from '@/slices'
import { Emote, fetchEmotesForChannel } from '@/utils/emotes'
import { emotesReceived } from '@/slices/emotes'

export const emoteMiddleware: Middleware<{}, RootState> = (storeApi) => (next) => (action) => {
  const state = storeApi.getState()
  const dispatch = storeApi.dispatch
  if (joinChannel.match(action)) {
    const channel = action.payload.replace('#', '')
    api.unsupported.getChatters(channel).then((chatters) => {
      dispatch(updateChatters(chatters))
    })
    fetchEmotesForChannel(channel).then((emotes) => {
      dispatch(emotesReceived(emotes))
    })
    return next(action)
  } else if (updateInput.match(action)) {
    const query = action.payload.split(' ').pop()
    if (!query || query.length < 3) return next(action)
    const toSearch = [...state.emotes.ids, ...(state.chat.chatters?.allChatters || [])]
    if (state.chat.cycle.length === 0)
      dispatch(updateCycle(toSearch.filter((e) => e.toString().match(new RegExp(`^${query}`, 'i'))).map((e) => (state.emotes.ids.includes(e) ? (state.emotes.entities[e] as Emote) : (e as string)))))
    return next(action)
  } else return next(action)
}
