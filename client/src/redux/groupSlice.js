import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";

export const getGroupsByQuery = createAsyncThunk("group/getGroupsByQuery",
    async (searchQuery) => {
        if (!searchQuery) {
            return [];
        }
        const query = searchQuery ? `?search=${searchQuery}` : '';
        const response = await axiosInstance.get(`/group${query}`);
        return response.data.groups;
    }
);

const groupSlice = createSlice({
    name: "group",
    initialState: {
        groups: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getGroupsByQuery.pending, (state) => {
                state.loading = true;
            })
            .addCase(getGroupsByQuery.fulfilled, (state, action) => {
                state.groups = action.payload;
                state.loading = false;
            })
            .addCase(getGroupsByQuery.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default groupSlice.reducer;
