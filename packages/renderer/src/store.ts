import { configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import reducer from './slices'
import { persistStore, persistReducer, FLUSH, KEY_PREFIX, PAUSE, PERSIST, PURGE, PersistConfig, createMigrate } from 'redux-persist'
import { RootState } from './slices'
import { emoteMiddleware } from './middleware/emoteMiddleware'
import migrations from './utils/migrations'

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 1,
  storage: window.electronStorage,
  migrate: createMigrate(migrations, { debug: true }),
}

const persistedReducer = persistReducer(persistConfig, reducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, PAUSE, PERSIST, PURGE],
      },
    })
      .prepend(emoteMiddleware)
      .concat(logger),
})

if (import.meta.hot) {
  import.meta.hot.accept('./slices/index', () => {
    // This fetch the new state of the above reducers.
    import('./slices/index').then((module) => {
      store.replaceReducer(persistReducer(persistConfig, module.default))
    })
  })
}

export const persistor = persistStore(store)
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
