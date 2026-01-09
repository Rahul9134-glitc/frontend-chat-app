import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// 1. ChevronLeft icon add kiya
import { X, Search, Loader2, ChevronLeft } from "lucide-react"; 
import { setSelectedUser, searchUsersAction } from "../../slices/chatSlices";

const ChatHeader = ({ isTyping }) => {
  const { selectedUser, searchResults, isSearchLoading } = useSelector((state) => state.chat);
  const { onlineUsers } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Search local states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  // Debounce Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchUsersAction(searchQuery));
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!selectedUser && !showSearch) return null;

  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <div className="p-3 border-b bg-white border-gray-200 relative z-[100]">
      <div className="flex items-center justify-between gap-2">
        
        {/* User Info & Back Button */}
        <div className={`flex items-center gap-2 sm:gap-3 ${showSearch ? "hidden sm:flex" : "flex"}`}>
          
          {/* --- 2. MOBILE BACK BUTTON (Sirf Mobile pe dikhega) --- */}
          <button 
            onClick={() => dispatch(setSelectedUser(null))}
            className="lg:hidden p-1 -ml-1 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border">
              <img
                src={selectedUser?.avatar?.url || "/avatar.avif"}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-medium text-sm text-gray-900 leading-tight truncate max-w-[120px] sm:max-w-none">
              {selectedUser?.fullname || "Search User"}
            </h3>
            {isTyping ? (
              <p className="text-[10px] sm:text-xs text-blue-500 font-medium animate-pulse">typing...</p>
            ) : (
              <p className={`text-[10px] sm:text-xs ${isOnline ? "text-green-500" : "text-gray-400"}`}>
                {isOnline ? "Online" : "Offline"}
              </p>
            )}
          </div>
        </div>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end" ref={searchRef}>
          {showSearch ? (
            <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 w-full max-w-[250px] animate-in fade-in slide-in-from-right-4">
              <input
                autoFocus
                type="text"
                placeholder="Search users..."
                className="bg-transparent border-none outline-none text-xs w-full text-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            >
              <Search size={20} />
            </button>
          )}

          {/* Search Dropdown Results */}
          {showSearch && (searchQuery.length > 0 || isSearchLoading) && (
            <div className="absolute top-14 right-0 w-full sm:w-80 bg-white border border-gray-200 shadow-2xl rounded-xl mt-2 overflow-hidden">
              {isSearchLoading ? (
                <div className="p-4 flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin text-blue-500" size={16} />
                  <span className="text-xs text-gray-400">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto p-2">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        dispatch(setSelectedUser(user));
                        setShowSearch(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <img src={user.avatar?.url || "/avatar.avif"} className="w-8 h-8 rounded-full object-cover border" alt="" />
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-semibold text-gray-800">{user.fullname}</span>
                        <span className="text-[10px] text-gray-400 truncate">{user.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-gray-400">No users found</div>
              )}
            </div>
          )}

          {/* Close Header Button (Desktop pe X icon, Mobile pe ye hide rahega unki Back button hai) */}
          {!showSearch && (
            <button
              onClick={() => dispatch(setSelectedUser(null))}
              className="hidden lg:block p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;