import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-toastify";

// Fetch all users for the sidebar
export const getUsers = createAsyncThunk(
  "chat/getUsers",
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get("/message/users");
      return response.data.users;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue("Failed to fetch users");
    }
  }
);

// Fetch conversation history with a specific user
export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
      return thunkAPI.rejectWithValue("Failed to fetch messages");
    }
  }
);

// Mark messages as seen in Database
export const markMessagesAsSeen = createAsyncThunk(
  "chat/markMessagesAsSeen",
  async (userId, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/message/seen/${userId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

// Send a new message (Handles both Text and Media)
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, messageData }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `/message/send/${receiverId}`,
        messageData
      );
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send message";
      toast.error(errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const chatAppSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSendindMessages: false,
    unreadCounts: {},
  },

  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },

    addMessage: (state, action) => {
      const isDuplicate = state.messages.some(
        (m) => m._id === action.payload._id
      );
      if (!isDuplicate) {
        state.messages.push(action.payload);
      }
    },

    updateMessageStatusLocal: (state, action) => {
      const receiverId = action.payload;
      state.messages = state.messages.map((msg) =>
        msg.recieverId === receiverId ? { ...msg, seen: true } : msg
      );
    },

    incrementUnreadCount: (state, action) => {
      const userId = action.payload;
      if (!state.unreadCounts) state.unreadCounts = {};
      state.unreadCounts[userId] = (state.unreadCounts[userId] || 0) + 1;
    },

    resetUnreadCount: (state, action) => {
      const userId = action.payload;
      if (!state.unreadCounts) state.unreadCounts = {};
      state.unreadCounts[userId] = 0;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.isUsersLoading = false;
      })
      .addCase(getUsers.rejected, (state) => {
        state.isUsersLoading = false;
      })

      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages || [];
        state.isMessagesLoading = false;
      })
      .addCase(getMessages.rejected, (state) => {
        state.isMessagesLoading = false;
      })

      .addCase(sendMessage.pending, (state) => {
        state.isSendindMessages = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendindMessages = false; 
        if (!Array.isArray(state.messages)) state.messages = [];
        const newMessage = action.payload.newMessage;
        if (newMessage) {
          const isDuplicate = state.messages.some(
            (m) => m._id === newMessage._id
          );
          if (!isDuplicate) {
            state.messages.push(newMessage);
          }
        }
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isSendindMessages = false;
      })

      .addCase(markMessagesAsSeen.fulfilled, (state) => {
        state.messages = state.messages.map((msg) =>
          msg.senderId === state.selectedUser?._id
            ? { ...msg, seen: true }
            : msg
        );
      });
  },
});

export const {
  setSelectedUser,
  addMessage,
  updateMessageStatusLocal,
  incrementUnreadCount,
  resetUnreadCount,
} = chatAppSlice.actions;

export default chatAppSlice.reducer;
