import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { combineReducers, createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Emote } from '@/utils/emotes';

const emotesAdapter = createEntityAdapter<Emote>({
  selectId: (emote) => emote.emoteName,
})

const emotesSlice = createSlice({
  name: 'emotes',
  initialState: emotesAdapter.getInitialState({
    // channels: [] as string[],
  }),
  reducers: {
    setEmotes: emotesAdapter.setAll,
    addEmote: emotesAdapter.addOne,
    removeEmote: emotesAdapter.removeOne,
    removeMany: emotesAdapter.removeMany,
    emotesReceived(state, action: PayloadAction<Emote[]>) {
      emotesAdapter.removeAll(state)
      emotesAdapter.addMany(state, action.payload)
    }
  }
})

export default emotesSlice.reducer

export const { addEmote, emotesReceived, removeEmote, removeMany, setEmotes } = emotesSlice.actions

export const emotesSelectors = emotesAdapter.getSelectors<RootState>((state) => state.emotes)
