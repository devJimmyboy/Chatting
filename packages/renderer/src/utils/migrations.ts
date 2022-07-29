import { MigrationManifest } from 'redux-persist'

export default {
  0: (state) => {
    return {
      ...state,
    }
  },
  1: (state: any) => {
    return {
      ...state,
      chat: {
        ...state?.chat,
        cycle: [],
      },
    }
  },
} as MigrationManifest
