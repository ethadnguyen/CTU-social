import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from '../api/axiosConfig';

export const likePost = createAsyncThunk('post/likePost', async (postId) => {
  const response = await axiosInstance.post(`/posts/like/${postId}`);
  return { postId, data: response.data };
});

export const savePost = createAsyncThunk('post/savePost', async (postId) => {
  const response = await axiosInstance.post(`/posts/save/${postId}`);
  return { postId, data: response.data };
});

export const sharePost = createAsyncThunk('post/sharePost', async (postId) => {
  const response = await axiosInstance.post(`/posts/share/${postId}`);
  return { postId, data: response.data };
});

export const reportPost = createAsyncThunk('post/reportPost', async (postId) => {
  const response = await axiosInstance.post(`/posts/report/${postId}`);
  return response.data;
});

const initialState = {
  posts: {},
  status: 'idle',
  error: null
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    getPosts(state, action) {
      state.posts = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.likes = data.likes;
        }
      })
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.saves = data.saves;
        }
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.shares = data.shares;
        }
      });
  }
});

export default postSlice.reducer;

export function SetPosts(post) {
  return (dispatch, getState) => {
    dispatch(postSlice.actions.getPosts(post));
  };
}
