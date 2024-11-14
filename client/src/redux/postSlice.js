import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from '../api/axiosConfig';

export const getPosts = createAsyncThunk('post/getPosts', async (searchQuery) => {
  const query = searchQuery ? `?search=${searchQuery}` : '';
  const response = await axiosInstance.get(`/posts${query}`);
  return response.data.posts;
});

export const getUserPosts = createAsyncThunk('post/getUserPosts', async (userId) => {
  const response = await axiosInstance.get(`/posts/${userId}`);
  return response.data.posts;
});

export const getSavedPosts = createAsyncThunk('post/getSavedPosts', async (userId) => {
  const response = await axiosInstance.get(`/posts/saved/${userId}`);
  return response.data.savedPosts;
});

export const getGroupPosts = createAsyncThunk('post/getGroupPosts', async (groupId) => {
  const response = await axiosInstance.get(`/group/${groupId}/posts`);
  return response.data.posts;
});

export const likePost = createAsyncThunk('post/likePost', async (postId) => {
  const response = await axiosInstance.post(`/posts/like/${postId}`);
  return { postId, data: response.data.post };
});

export const savePost = createAsyncThunk('post/savePost', async (postId) => {
  const response = await axiosInstance.post(`/posts/save/${postId}`);
  return { postId, data: response.data.post };
});

export const sharePost = createAsyncThunk('post/sharePost', async (postId) => {
  const response = await axiosInstance.post(`/posts/share/${postId}`);
  console.log('sharePost response', response.data.post);
  return { postId, data: response.data.post };
});

export const reportPost = createAsyncThunk('post/reportPost', async (postId) => {
  const response = await axiosInstance.post(`/posts/report/${postId}`);
  return { postId, data: response.data.post };
});

const initialState = {
  posts: [],
  userPosts: [],
  savedPosts: [],
  groupPosts: [],
  status: 'idle',
  error: null
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    updatePosts: (state, action) => {
      state.posts = action.payload;
    },
    updateGroupPosts: (state, action) => {
      state.groupPosts = action.payload;
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex(post => post._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },
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
      //get saved posts
      .addCase(getSavedPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.savedPosts = action.payload;
      })
      .addCase(getSavedPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // group posts
      .addCase(getGroupPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getGroupPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.groupPosts = action.payload;
      })
      .addCase(getGroupPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // like post
      .addCase(likePost.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = data.likes;
          post.likedBy = data.likedBy;
        }
        state.status = 'succeeded';
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
        state.status = 'succeeded';
        const { postId, data } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.saves = data.saves;
          post.savedBy = data.savedBy;
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
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.shares = data.shares;
          post.shareBy = data.shareBy;
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
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.reports = data.reports;
        }
      })
  }
});

export const { updatePosts, updatePost, updateGroupPosts } = postSlice.actions;
export default postSlice.reducer;