import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Loader } from "lucide-react";
import { getUser, setOnlineUsers } from "./slices/authSlices";
import { connectSocket, disconnectSocket } from "./lib/socket";
import { Route, Routes, Navigate } from "react-router-dom"; 
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./components/Profile";
import { ToastContainer } from "react-toastify";

const App = () => {
  const dispatch = useDispatch();
  const { authUser, isCheckingAuthStatus } = useSelector((state) => state.auth);

  // 1. Check if user is logged in on app load
  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // 2. Handle Socket Connection
  useEffect(() => {
    if (authUser) {
      // Initialize socket connection using the Singleton helper we made
      const socket = connectSocket(authUser._id);
      
      // Listen for online users updates
      socket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      // Cleanup: Remove listener and disconnect on unmount or logout
      return () => {
        socket.off("getOnlineUsers");
        disconnectSocket();
      };
    }
  }, [authUser, dispatch]);

  // 3. Loading State
  // Improved logic: If we are checking, show loader regardless of authUser state
  if (isCheckingAuthStatus && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Loader className="size-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <Routes>
        <Route 
            path="/" 
            element={authUser ? <Home/> : <Navigate to={"/login"}/>}
        />
        
        <Route 
          path="/register" 
          element={!authUser ? <Register /> : <Navigate to="/" />} 
        />
        <Route 
          path="/login" 
          element={!authUser ? <Login /> : <Navigate to="/" />} 
        />
        
        {/* FIX WAS HERE: Before, you had '!authUser' which meant only logged-OUT users could see profile */}
        <Route 
          path="/profile" 
          element={authUser ? <Profile /> : <Navigate to="/login" />} 
        />
      </Routes>
      <ToastContainer position="bottom-right" theme="light"/>
    </div>
  );
};

export default App;