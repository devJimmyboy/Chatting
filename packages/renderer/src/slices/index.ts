import { combineReducers } from "@reduxjs/toolkit";
import main from './mainSlice';
import emotes from './emotes';
import chat from './chat';

const rootReducer = combineReducers({
  main,
  emotes,
  chat
})

export default rootReducer
export type RootState = ReturnType<typeof rootReducer>;
