import React from 'react';
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Logout } from '../slices/authSlices'; 

const Navbar = () => {
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
     dispatch(Logout())  
  };

  return (
    <header className='fixed top-0 w-full z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm'>
      <div className='container mx-auto px-4 h-16'>
        <div className='flex items-center justify-between h-full'>
          
          {/* LEFT SIDE: Logo */}
          <div className='flex items-center gap-8'>
            <Link to="/" className='flex items-center gap-2.5 hover:opacity-80 transition-all'>
              <div className='w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center'>
                <MessageSquare className='w-5 h-5 text-white' />
              </div>
              <h1 className='text-lg font-bold text-gray-900 tracking-tight'>GupShup</h1>
            </Link>
          </div>

          {/* RIGHT SIDE: Actions */}
          <div className='flex items-center gap-4'>
            {authUser && (
              <>
                <Link to="/profile" className='btn btn-ghost flex items-center gap-2 transition-colors hover:text-blue-600'>
                  <User className='w-4 h-4' />
                  <span className='hidden sm:inline'>Profile</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className='flex items-center gap-2 pl-2 border-l border-gray-200 text-red-500 hover:text-red-700 transition-colors'
                >
                  <LogOut className='w-4 h-4' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;