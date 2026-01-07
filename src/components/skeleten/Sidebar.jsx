import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import SideBarSkeleton from "./SideBarSkeleton";
import { getUsers, setSelectedUser } from "../../slices/chatSlices";
import { Users } from "lucide-react";

const Sidebar = () => {
  const [showOnlineUsers, setShowOnlineUsers] = React.useState(false);
  const { users, selectedUser, isUsersLoading } = useSelector(
    (state) => state.chat
  );

  const { onlineUsers = [] } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

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
          <span className="font-medium hidden lg:block text-gray-800">
            Contacts
          </span>
        </div>

        {/* Online Filter */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOnlineUsers}
              onChange={(e) => setShowOnlineUsers(e.target.checked)}
              className="h-4 w-4 border-gray-300 text-blue-600 rounded focus:ring-blue-500"
            />
            Online Users Only
          </label>
          <span className="text-xs text-gray-500">
            ({onlineUsers.length - 1 > 0 ? onlineUsers.length - 1 : 0} online)
          </span>
        </div>
      </div>

      {/* Users List */}
      <div className="overflow-y-auto w-full py-3">
        {filterOnlineUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => dispatch(setSelectedUser(user))} 
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors
              ${selectedUser?._id === user._id ? "bg-gray-100 ring-1 ring-gray-200" : ""}
            `}
          >
            {/* User Avatar */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user?.avatar?.url || "/avatar.avif"}
                alt={user?.fullname}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-500 shadow-sm" />
              )}
            </div>

            {/* User Info - Hidden on mobile */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium text-gray-800 truncate">
                {user.fullname}
              </div>
              <div className="text-xs text-gray-500">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filterOnlineUsers.length === 0 && (
          <div className="text-center text-gray-500 py-10 px-4">
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;