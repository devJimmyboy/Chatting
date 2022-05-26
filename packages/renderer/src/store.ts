import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger'
import reducer from "./slices"
import { persistStore, persistReducer, FLUSH, KEY_PREFIX, PAUSE, PERSIST, PURGE, PersistConfig } from 'redux-persist'
import { RootState } from './slices';
import { emoteMiddleware } from './middleware/emoteMiddleware';


const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: window.electronStorage

}

const persistedReducer = persistReducer(persistConfig, reducer)


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, PAUSE, PERSIST, PURGE]
    }
  }).prepend(emoteMiddleware).concat(logger),
})

export const persistor = persistStore(store)
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
