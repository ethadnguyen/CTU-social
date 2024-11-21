import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosConfig';

const initialState = {
    faculties: [],
    majors: [],
    status: 'idle',
    error: null,
};
// faculty actions
export const fetchFaculties = createAsyncThunk('faculty/fetchFaculties', async () => {
    const response = await axiosInstance.get('/admin/faculties');
    return response.data;
});


export const addFaculty = createAsyncThunk('faculty/addFaculty', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post('/admin/create-faculty', { ...data });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const updateFaculty = createAsyncThunk('faculty/updateFaculty', async ({ facultyId, name }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/admin/update-faculty/${facultyId}`, { name });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteFaculty = createAsyncThunk('faculty/deleteFaculty', async (facultyId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/admin/delete-faculty/${facultyId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

// major actions

export const fetchMajors = createAsyncThunk('faculty/fetchMajors', async (facultyId) => {
    const response = await axiosInstance.get(`/admin/majors/${facultyId}`);
    return response.data.majors;
});

export const addMajor = createAsyncThunk('faculty/addMajor', async (data, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/admin/create-major`, { ...data });
        return response.data;
    } catch (error) {
        console.log(error);
        return rejectWithValue(error.response.data.message);
    }
});

export const updateMajor = createAsyncThunk('faculty/updateMajor', async ({ majorId, data }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/admin/update-major/${majorId}`, { ...data });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteMajor = createAsyncThunk('faculty/deleteMajor', async (majorId, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.delete(`/admin/delete-major/${majorId}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

// course actions

export const addCourse = createAsyncThunk('faculty/addCourse', async ({ majorId, course }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post(`/admin/add-course/${majorId}`, { course });
        console.log(response.data);
        return response.data;
    } catch (error) {
        if (error.response && error.response.data) {
            return rejectWithValue(error.response.data.message);
        } else {
            return rejectWithValue('An error occurred. Please try again later');
        }
    }
});

export const updateCourse = createAsyncThunk('faculty/updateCourse', async ({ majorId, course }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.put(`/admin/update-course/${majorId}`, { course });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});

export const deleteCourse = createAsyncThunk('faculty/deleteCourse', async ({ majorId, course }, { rejectWithValue }) => {
    try {
        console.log('course', course);
        const response = await axiosInstance.delete(`/admin/delete-course/${majorId}?course=${course}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data.message);
    }
});


const facultySlice = createSlice({
    name: 'faculty',
    initialState,
    reducers: {
        setMajors: (state, action) => {
            state.majors = action.payload;
        }
    },
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
            })
            .addCase(addFaculty.fulfilled, (state, action) => {
                state.faculties.push(action.payload.faculty);
            })
            .addCase(updateFaculty.fulfilled, (state, action) => {
                const { _id } = action.payload.faculty;
                let existingFaculty = state.faculties.find((faculty) => faculty._id === _id);
                if (existingFaculty) {
                    existingFaculty = action.payload.faculty;
                }
            })
            .addCase(deleteFaculty.fulfilled, (state, action) => {
                const { _id } = action.payload.faculty;
                const existingFaculty = state.faculties.find((faculty) => faculty._id === _id);
                if (existingFaculty) {
                    existingFaculty.isDeleted = true;
                    state.majors.forEach((major) => {
                        if (major.faculty === _id) {
                            major.isFacultyDeleted = true;
                        }
                    });
                }
            })
            .addCase(addMajor.fulfilled, (state, action) => {
                state.majors.push(action.payload.major);
            })
            .addCase(updateMajor.fulfilled, (state, action) => {
                const { _id } = action.payload.major;
                let existingMajor = state.majors.find((major) => major._id === _id);
                if (existingMajor) {
                    existingMajor = action.payload.major;
                }
            })
            .addCase(deleteMajor.fulfilled, (state, action) => {
                const { _id } = action.payload.major;
                const existingMajor = state.majors.find((major) => major._id === _id);
                if (existingMajor) {
                    existingMajor.isDeleted = true;
                }
            })
            .addCase(addCourse.fulfilled, (state, action) => {
                const { _id } = action.payload.major;
                const existingMajor = state.majors.find((major) => major._id === _id);
                if (existingMajor) {
                    existingMajor.academicYear.push(action.payload.course);
                }
            })
            .addCase(addCourse.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                const { _id } = action.payload.major;
                const { course } = action.payload;
                const existingMajor = state.majors.find((major) => major._id === _id);
                if (existingMajor) {
                    let existingCourse = existingMajor.academicYear.find((c) => c === course);
                    if (existingCourse) {
                        existingCourse = action.payload;
                    }
                }
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                const { _id } = action.payload.major;
                const { course } = action.payload;
                const existingMajor = state.majors.find((major) => major._id === _id);
                if (existingMajor) {
                    existingMajor.courses = existingMajor.academicYear.filter((c) => c !== course);
                }
            });

    },
});

export default facultySlice.reducer;