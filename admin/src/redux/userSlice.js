import { createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosConfig";
import { user } from "../assets/data";

const initialState = {
  user: JSON.parse(window?.localStorage.getItem("user")) ?? user,
  edit: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload;
      state.error = null;
    },
    logout(state) {
      state.user = null;
      localStorage?.removeItem("token");
      localStorage?.removeItem("user");
    },
    updateProfile(state, action) {
      state.edit = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    }
  },
});
export default userSlice.reducer;

export const { login, logout, updateProfile, setError } = userSlice.actions;

export function UserAdminLogin(credentials) {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.post("/auth/admin/login", credentials);
      const { user, token } = response.data;
      console.log(response.data)
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(login(user));
    } catch (error) {
      const errMess = error.response?.data.message || "Đăng nhập thất bại";
      dispatch(setError(errMess));
      console.error(errMess);
    }
  };
}

export function Logout() {
  return (dispatch, getState) => {
    dispatch(userSlice.actions.logout());
    window.location.reload();
  };
}

export function UpdateProfile(val) {
  return (dispatch, getState) => {
    dispatch(userSlice.actions.updateProfile(val));
  };
}
