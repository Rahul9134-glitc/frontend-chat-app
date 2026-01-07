import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../slices/authSlices";
import { Camera, User, Mail, Loader2 } from "lucide-react";

const Profile = () => {
  const { isUpdatingProfile, authUser } = useSelector((state) => state.auth);

  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    fullname: authUser?.fullname,
    email: authUser?.email,
    avatar: authUser?.avatar?.url, // Fixed: Added optional chaining
  });

  const dispatch = useDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader(); // Fixed: new FileReader()
    reader.readAsDataURL(file); // Fixed: readAsDataURL()

    reader.onload = () => {
      const base64Image = reader.result;
      setImage(base64Image);
      setFormData({ ...formData, avatar: file }); // Fixed: formData (lowercase)
    };
  };

  const handleUpdateProfile = () => {
    const data = new FormData(); 
    data.append("fullname", formData.fullname);
    data.append("email", formData.email);
    if (image) {
      data.append("avatar", formData.avatar);
    }

    dispatch(updateProfile(data));
  };

  return (
    <div>
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 space-y-8">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
              <p className="mt-2 text-gray-500">Your profile information</p>
            </div>

            {/* avatar upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={image || formData.avatar || "/avatar.avif"}
                  alt="avatar"
                  className="h-32 w-32 rounded-full object-cover object-top border-4 border-gray-200"
                />
                <label
                  htmlFor="update-avatar"
                  className={`absolute bottom-0 right-0 bg-gray-800 hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                    isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                  }`}
                >
                  <Camera className="w-5 h-5 text-white" />
                </label>
                <input
                  type="file"
                  id="update-avatar"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUpdatingProfile}
                />
              </div>

              <p className="text-sm text-gray-400">
                {isUpdatingProfile
                  ? "Updating avatar..."
                  : "Click the icon to change avatar"}
              </p>
            </div>

            {/* user info */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </div>
                <input
                  type="text"
                  value={formData.fullname}
                  onChange={(e) =>
                    setFormData({ ...formData, fullname: e.target.value }) // Fixed: formData
                  }
                  className="px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1.5">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </div>
                <input
                  type="text"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value }) // Fixed: formData
                  }
                  className="px-4 py-2.5 bg-gray-100 rounded-lg border border-gray-300 text-gray-800 w-full focus:outline-none"
                />
              </div>
            </div>

            {/* update Button */}
            <button
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium rounded-md transition duration-200 flex justify-center items-center gap-2"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </button>

            {/* Account Info */}
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Account Information
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span>Member Since</span>
                  <span>
                    {new Date(authUser?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 ">
                  <span>Account Status</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;