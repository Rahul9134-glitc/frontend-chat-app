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


export const deleteMessageAction = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, thunkAPI) => {
    try {
      await axiosInstance.delete(`/message/delete/${messageId}`);
      return messageId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
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
      const newMessage = action.payload;
      const isDuplicate = state.messages.some((m) => m._id === newMessage._id);

      if (!isDuplicate) {
        // 1. Aapka purana message push logic
        if (
          state.selectedUser?._id === newMessage.senderId ||
          state.selectedUser?._id === newMessage.recieverId
        ) {
          state.messages.push(newMessage);
        }

        // 2. SORTING LOGIC (Hamesha chalega chahe chat open ho ya nahi)
        // Partner Id dhundo (Jo message bhej raha hai)
        const partnerId = newMessage.senderId;
        const userIndex = state.users.findIndex((u) => u._id === partnerId);

        if (userIndex !== -1) {
          const userObj = state.users.splice(userIndex, 1)[0];
          state.users.unshift(userObj); // User ko top par le aaye
        }
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

    removeMessageLocal: (state, action) => {
     const messageId = action.payload;
     state.messages = state.messages.filter((m) => m._id !== messageId);
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
          // 1. Duplicate check
          const isDuplicate = state.messages.some(
            (m) => m._id === newMessage._id
          );

          if (!isDuplicate) {
            state.messages.push(newMessage);
          }

          // --- RECENT CHAT SORTING LOGIC FOR SENDER ---
          // Jab aapne message bheja, toh receiver (jisne message receive kiya)
          // usko sidebar mein sabse upar laana hai.
          const receiverId = newMessage.recieverId;
          const userIndex = state.users.findIndex((u) => u._id === receiverId);

          if (userIndex !== -1) {
            const userObj = state.users.splice(userIndex, 1)[0];
            state.users.unshift(userObj);
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
      })
      .addCase(deleteMessageAction.fulfilled, (state, action) => {
        const deletedMessageId = action.payload;
        state.messages = state.messages.filter((m) => m._id !== deletedMessageId);
      });
  },
});

export const {
  setSelectedUser,
  addMessage,
  updateMessageStatusLocal,
  incrementUnreadCount,
  resetUnreadCount,
  removeMessageLocal
} = chatAppSlice.actions;

export default chatAppSlice.reducer;
