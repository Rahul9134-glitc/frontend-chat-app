import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
// FIX: Import the action from your slice
import { setSelectedUser } from "../../slices/chatSlices"; 

const ChatHeader = () => {
  const { selectedUser } = useSelector((state) => state.chat);
  const { onlineUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Safety check: if for some reason this renders without a user, return null
  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-3 border-b bg-white border-gray-200">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* Avatar with Status Indicator */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={selectedUser?.avatar?.url || "/avatar.avif"}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online Green Dot */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          {/* Name and Status Text */}
          <div>
            <h3 className="font-medium text-sm text-gray-900 leading-tight">
              {selectedUser?.fullname}
            </h3>
            <p className={`text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          // FIX: Use the imported action creator here
          onClick={() => dispatch(setSelectedUser(null))} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;