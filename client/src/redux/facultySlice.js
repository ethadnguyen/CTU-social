import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosConfig';

const initialState = {
    faculties: [],
    majors: [],
    status: 'idle',
    error: null,
};

export const fetchFaculties = createAsyncThunk('faculty/fetchFaculties', async () => {
    const response = await axiosInstance.get('/faculties');
    return response.data;
});

export const fetchMajors = createAsyncThunk('faculty/fetchMajors', async (facultyId) => {
    const response = await axiosInstance.get(`/faculties/${facultyId}/majors`);
    return response.data;
});

const facultySlice = createSlice({
    name: 'faculty',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFaculties.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFaculties.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.faculties = action.payload;
            })
            .addCase(fetchFaculties.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchMajors.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMajors.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.majors = action.payload;
            })
            .addCase(fetchMajors.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default facultySlice.reducer;