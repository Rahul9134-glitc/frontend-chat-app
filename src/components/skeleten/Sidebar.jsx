import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import SideBarSkeleton from "./SideBarSkeleton";
import { 
  getUsers, 
  setSelectedUser, 
  incrementUnreadCount, 
  resetUnreadCount 
} from "../../slices/chatSlices";
import { getSocket } from "../../lib/socket";
import { Users } from "lucide-react";

const Sidebar = () => {
  const dispatch = useDispatch();
  const socket = getSocket();
  
  // 1. Audio reference for notifications
  const notificationSound = useRef(new Audio("/notification.mp3"));

  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  
  // Get data from Redux Store
  const { users, selectedUser, isUsersLoading, unreadCounts } = useSelector(
    (state) => state.chat
  );
  const { onlineUsers = [], authUser } = useSelector((state) => state.auth);

  // 2. Initial fetch of users
  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  // 3. Reset count when a user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(resetUnreadCount(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  // 4. Socket listener for real-time sidebar updates
  useEffect(() => {
    if (!socket || !authUser?._id) return;
      
    const handleNewMessage = (newMessage) => {
      const isFromMe = newMessage.senderId === authUser._id;
      const isChatNotOpen = selectedUser?._id !== newMessage.senderId;

      if (isChatNotOpen && !isFromMe) {
        // Play sound
        notificationSound.current.play().catch((e) => console.log("Sound error:", e));
        
        // Increment badge count
        dispatch(incrementUnreadCount(newMessage.senderId));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser?._id, authUser?._id, dispatch]);

  // Filter logic
  const filterOnlineUsers = showOnlineUsers
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SideBarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-gray-200 flex flex-col transition-all duration-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-700" />
          <span className="font-medium hidden lg:block text-gray-800">Contacts</span>
        </div>

        {/* Online Toggle (Hidden on mobile to keep it clean) */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOnlineUsers}
              onChange={(e) => setShowOnlineUsers(e.target.checked)}
              className="h-4 w-4 border-gray-300 text-blue-600 rounded"
            />
            Online Only
          </label>
          <span className="text-xs text-gray-500">
            ({Math.max(0, onlineUsers.length - 1)} online)
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3">
        {filterOnlineUsers.map((user) => {
          const count = unreadCounts?.[user._id] || 0;

          return (
            <button
              key={user._id}
              onClick={() => dispatch(setSelectedUser(user))}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors relative
                ${selectedUser?._id === user._id ? "bg-gray-100 ring-1 ring-gray-200" : ""}
              `}
            >
              {/* --- Avatar Container --- */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user?.avatar?.url || "/avatar.avif"}
                  alt={user?.fullname}
                  className="w-12 h-12 lg:w-10 lg:h-10 rounded-full object-cover border border-gray-200"
                />
                
                {/* Online Status Dot */}
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500 shadow-sm" />
                )}

                {/* --- MOBILE BADGE (On top of Avatar) --- */}
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 lg:hidden bg-blue-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-md">
                    {count}
                  </span>
                )}
              </div>

              {/* --- User Details (Hidden on mobile) --- */}
              <div className="hidden lg:block text-left min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-800 truncate">
                    {user.fullname}
                  </div>
                  
                  {/* --- DESKTOP BADGE (Beside Name) --- */}
                  {count > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse shadow-sm">
                      {count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          );
        })}

        {filterOnlineUsers.length === 0 && (
          <div className="text-center text-gray-500 py-10">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;