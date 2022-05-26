import { createListenerMiddleware, isAnyOf, Middleware, TypedStartListening } from "@reduxjs/toolkit";

import { joinChannel } from "@/slices/chat";
import { AppDispatch } from "@/store";
import { RootState } from "@/slices";
import { fetchEmotesForChannel } from "@/utils/emotes";
import { emotesReceived } from "@/slices/emotes";


export const emoteMiddleware: Middleware<{}, RootState> = storeApi => next => action => {
  const state = storeApi.getState();
  const dispatch = storeApi.dispatch;
  if (joinChannel.match(action)) {
    const channel = action.payload.replace("#", "");
    fetchEmotesForChannel(channel).then(emotes => {
      dispatch(emotesReceived(emotes))
    })
  }

  next(action)

}
