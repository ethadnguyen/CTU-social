import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from '../api/axiosConfig';


const initialState = {
  user: null,
  edit: false,
  errorMessage: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      state.errorMessage = '';
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    loginFailure(state, action) {
      state.user = null;
      state.errorMessage = action.payload;
    },
    logout(state) {
      state.user = null;
      localStorage?.removeItem("user");
    },
    updateProfile(state, action) {
      state.edit = action.payload;
    },
  },
});

export const { loginSuccess, loginFailure, logout, updateProfile } = userSlice.actions;

export default userSlice.reducer;

export function loginAdmin(credentials) {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.post("/auth/admin/login", credentials);

      const { user, token } = response.data;
      localStorage.setItem("token", token);
      dispatch(loginSuccess(user));
    } catch (error) {
      const errorMessage = error.response?.message || "Đăng nhập thất bại!";
      dispatch(loginFailure(errorMessage));
    }
  };
}

export function Logout() {
  return (dispatch, getState) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(userSlice.actions.logout());
  };
}

export function UpdateProfile(val) {
  return (dispatch, getState) => {
    dispatch(userSlice.actions.updateProfile(val));
  };
}
