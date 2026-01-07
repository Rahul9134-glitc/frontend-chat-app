import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios";
import { connectSocket, disconnectSocket } from "../lib/socket";
import { toast } from "react-toastify";

export const getUser = createAsyncThunk("users/me", async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get("/users/me");

    if (response.data.user) {
      connectSocket(response.data.user._id);
    }

    return response.data.user;
  } catch (error) {
    console.log("Error fetching user:", error);
    return thunkAPI.rejectWithValue(error.response?.data || "Server Error");
  }
});

export const Logout = createAsyncThunk("users/sign-out", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/users/sign-out");
    disconnectSocket();
    toast.success("Logged out successfully");
    return null;
  } catch (error) {
    toast.error("Error logging out");
    return thunkAPI.rejectWithValue(error.response?.data);
  }
});

export const login = createAsyncThunk(
  "users/sign-in",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("users/sign-in", data);
      if (response.data.user) {
        connectSocket(response.data.user._id);
      }

      toast.success("Logged in successfully");
      return response.data.user; 
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const register = createAsyncThunk(
  "users/sign-up",
  async (data, thunkAPI) => {
    try {
      const response = await axiosInstance.post("users/sign-up", data);
      if (response.data.user) {
        connectSocket(response.data.user._id);
      }

      toast.success("SignUp in successfully");
      return response.data.user; 
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      toast.error(errorMsg);
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);


 export const updateProfile = createAsyncThunk("update/profile" , async(profileData , thunkAPI) => {
  try {
    const response = await axiosInstance.put('/users/update-profile' , profileData);
    toast.success("Profile updated successfully");
    return response.data.user;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to update profile";
    toast.error(errorMessage);
    return thunkAPI.rejectWithValue(errorMessage);
  }
});


const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuthStatus: true,
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setLogout: (state) => {
      state.authUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.isCheckingAuthStatus = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isCheckingAuthStatus = false;
      })
      .addCase(getUser.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuthStatus = false;
      })
      .addCase(Logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(Logout.rejected, (state) => {
        state.authUser = state.authUser;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(register.pending, (state) => {
        state.isSigningUp = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigningUp = false;
      })
      .addCase(register.rejected, (state) => {
        state.isSigningUp = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});

export const { setOnlineUsers, setLogout } = authSlice.actions;
export default authSlice.reducer;
