import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSong: null,
  isPlaying: false,
  playlist: [],
  currentIndex: 0,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlaylist: (state, action) => {
      state.playlist = action.payload;
    },
    playSong: (state, action) => {
      state.currentSong = action.payload.song;
      state.currentIndex = action.payload.index;
      state.isPlaying = true;
    },
    pauseSong: (state) => {
      state.isPlaying = false;
    },
    resumeSong: (state) => {
      state.isPlaying = true;
    },
    nextSong: (state) => {
      if (state.currentIndex < state.playlist.length - 1) {
        state.currentIndex += 1;
        state.currentSong = state.playlist[state.currentIndex];
        state.isPlaying = true;
      }
    },
    prevSong: (state) => {
      if (state.currentIndex > 0) {
        state.currentIndex -= 1;
        state.currentSong = state.playlist[state.currentIndex];
        state.isPlaying = true;
      }
    },
  },
});

export const { setPlaylist, playSong, pauseSong, resumeSong, nextSong, prevSong } = playerSlice.actions;
export default playerSlice.reducer;
