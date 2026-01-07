import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slices/authSlices"
import chatReducer from "../slices/chatSlices"

const store = configureStore({
    reducer : {
        auth : authReducer,
        chat : chatReducer
    }
})


export default store