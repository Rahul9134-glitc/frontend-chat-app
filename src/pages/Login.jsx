import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock, MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { login } from "../slices/authSlices"; 

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { isLoggingIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    // min-h-screen ensures it works on mobile and desktop
    // overflow-y-auto allows scrolling on small mobile screens
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white overflow-y-auto lg:overflow-hidden lg:h-screen">
      
      {/* Left Side: Form */}
      <div className="flex flex-col justify-center items-center px-6 py-10 sm:py-16 lg:py-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo & Header */}
          <div className="flex flex-col text-center items-center">
            <div className="bg-blue-100 p-3 rounded-2xl hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-6 text-gray-900 tracking-tight">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Sign in to continue to Talkie</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
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
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Animated Content (Hidden on small mobile) */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gray-50 p-12 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-40 -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full filter blur-3xl opacity-60 -ml-20 -mb-20 animate-pulse" />

        <div className="max-w-md w-full text-center z-10">
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500
                ${(i % 2 === 0) ? 'bg-blue-600 text-white animate-bounce' : 'bg-white text-blue-600 border border-blue-100 animate-pulse'}`}
                style={{ animationDelay: `${i * 150}ms`, animationDuration: '3s' }}
              >
                <MessageSquare className="w-8 h-8 lg:w-10 lg:h-10" />
              </div>
            ))}
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back to Talkie
          </h2>
          <p className="text-gray-500 mt-4 text-sm lg:text-lg leading-relaxed">
            Continue your conversations and see what your friends have been up to.
          </p>
        </div>

        {/* Bottom indicator dots (Hidden on mobile) */}
        <div className="absolute bottom-8 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full ${i === 0 ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Login;