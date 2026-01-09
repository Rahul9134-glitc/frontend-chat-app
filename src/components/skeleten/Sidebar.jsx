import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SideBarSkeleton from "./SideBarSkeleton";
import {
  getUsers,
  setSelectedUser,
  incrementUnreadCount,
  resetUnreadCount,
  addMessage,
} from "../../slices/chatSlices";
import { getSocket } from "../../lib/socket";
import { Users, MessageSquarePlus } from "lucide-react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const socket = getSocket();
  const notificationSound = useRef(new Audio("/notification.mp3"));

  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  const { users, selectedUser, isUsersLoading, unreadCounts } = useSelector(
    (state) => state.chat
  );
  const { onlineUsers = [], authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(resetUnreadCount(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    if (!socket || !authUser?._id) return;

    const handleNewMessage = (newMessage) => {
      const isFromMe = newMessage.senderId === authUser._id;
      dispatch(addMessage(newMessage));

      if (selectedUser?._id !== newMessage.senderId && !isFromMe) {
        notificationSound.current.play().catch((e) => console.log("Sound error:", e));
        dispatch(incrementUnreadCount(newMessage.senderId));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser?._id, authUser?._id, dispatch]);

  // Format Time Function
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  let displayUsers = [...users];
  if (selectedUser && !users.find((u) => u._id === selectedUser._id)) {
    displayUsers = [selectedUser, ...users];
  }

  const filteredUsers = showOnlineUsers
    ? displayUsers.filter((user) => onlineUsers.includes(user._id))
    : displayUsers; 

  if (isUsersLoading) return <SideBarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-72 border-r border-gray-200 flex flex-col transition-all duration-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 w-full p-5 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-800 tracking-tight">Chats</span>
          </div>
          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">
            {Math.max(0, onlineUsers.length - 1)} Live
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlineUsers}
              onChange={(e) => setShowOnlineUsers(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-2 text-xs font-medium text-gray-600">Online Only</span>
          </label>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full flex-1">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const count = unreadCounts?.[user._id] || user.unreadCount || 0;
            const isSelected = selectedUser?._id === user._id;
            
            // Logic: Kya last message maine bheja hai?
            const isLastMessageFromMe = user.lastMessage?.senderId === authUser?._id;

            return (
              <button
                key={user._id}
                onClick={() => dispatch(setSelectedUser(user))}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all duration-200 border-b border-gray-50
                  ${isSelected ? "bg-blue-50/80 border-r-4 border-blue-600" : "hover:bg-gray-50 border-r-4 border-transparent"}
                `}
              >
                <div className="relative shrink-0">
                  <img
                    src={user?.avatar?.url || "/avatar.avif"}
                    alt={user?.fullname}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-0.5 right-0.5 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500" />
                  )}
                </div>

                <div className="text-left min-w-0 flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className={`font-semibold text-sm truncate ${isSelected ? "text-blue-900" : "text-gray-800"}`}>
                      {user.fullname}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {user.lastMessageTime ? formatTime(user.lastMessageTime) : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    {/* Latest Message Preview with "You:" logic */}
                    <p className={`text-xs truncate flex-1 ${count > 0 ? "text-gray-900 font-bold" : "text-gray-500"}`}>
                      {isLastMessageFromMe && (
                        <span className="text-gray-400 font-normal mr-1">You:</span>
                      )}
                      {user.lastMessage?.text ? (
                        user.lastMessage.text
                      ) : user.lastMessage?.media ? (
                        <span className="italic">📷 Photo</span>
                      ) : (
                        "No messages"
                      )}
                    </p>
                    
                    {count > 0 && (
                      <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <MessageSquarePlus className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-gray-500 text-xs">No conversations yet</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;