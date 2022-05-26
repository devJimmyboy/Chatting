import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit"

export const getIgnore = createAsyncThunk("main/get-ignore", async () => {
  const ignoring = await window.ipcRenderer.invoke("get-ignoring");
  return ignoring;
})

interface MainState {
  ignoring: boolean
}

const initialState: MainState = {
  ignoring: true
}

const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setIgnoreState: (state, action: PayloadAction<boolean>) => {
      state.ignoring = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(getIgnore.fulfilled, (state, action) => {
      state.ignoring = action.payload
    })
  }
})

export default mainSlice.reducer

export const { setIgnoreState } = mainSlice.actions
