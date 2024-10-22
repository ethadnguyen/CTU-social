import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from '../api/axiosConfig';

export const getPosts = createAsyncThunk('post/getPosts', async () => {
  const response = await axiosInstance.get('/posts');
  return response.data.posts;
});

export const getUserPosts = createAsyncThunk('post/getUserPosts', async (userId) => {
  const response = await axiosInstance.get(`/posts/${userId}`);
  return response.data.posts;
})

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
  return { postId, data: response.data };
});

const initialState = {
  posts: [],
  userPosts: [],
  status: 'idle',
  error: null
};

const postSlice = createSlice({
  name: "post",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.status = 'succeeded';
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // get user posts
      .addCase(getUserPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getUserPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userPosts = action.payload;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // like post
      .addCase(likePost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.likes = data.likes;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // save post
      .addCase(savePost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(savePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.saves = data.saves;
        }
      })
      .addCase(savePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // share post
      .addCase(sharePost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(sharePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.shares = data.shares;
        }
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // report post
      .addCase(reportPost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(reportPost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.reports = data.reports;
        }
      })
  }
});

export default postSlice.reducer;