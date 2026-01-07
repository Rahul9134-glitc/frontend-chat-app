import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { register } from "../slices/authSlices";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const { isSigningUp } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(formData));
  };

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-white">
      
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center items-center px-6 py-8 lg:py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="flex flex-col text-center items-center mb-8">
            <div className="bg-blue-100 p-3 rounded-xl hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mt-4 text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 mt-2">Get started with your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSigningUp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: FIXED Animated Decorative Side */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 p-12 relative overflow-hidden h-full">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-40 -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full filter blur-3xl opacity-60 -ml-20 -mb-20 animate-pulse" />

        <div className="max-w-md w-full text-center z-10">
          {/* Animated Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500
                ${(i % 2 === 0)
                  ? 'bg-blue-600 text-white animate-bounce'
                  : 'bg-white text-blue-600 border border-blue-100 animate-pulse'}
                `}
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '3s',
                }}
              >
                <MessageSquare className="w-8 h-8 lg:w-10 lg:h-10" />
              </div>
            ))}
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Experience real-time chat
          </h2>
          <p className="text-gray-500 mt-4 text-lg leading-relaxed">
            Join thousands of users communicating instantly with our secure and fast messaging platform.
          </p>
        </div>

        {/* Bottom indicator */}
        <div className="absolute bottom-8 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Register;