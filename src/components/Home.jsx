import React from 'react'
import {useSelector} from 'react-redux'
import Sidebar from './skeleten/Sidebar'
import NotChatSelected from './skeleten/NotChatSelected'
import ChatContainer from './skeleten/ChatContainer'

const Home = () => {
  const {selectedUser} = useSelector((state) => state.chat)

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-white rounded-lg shadow-md w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden relative'>
            
            {/* --- SIDEBAR --- */}
            {/* Mobile: Agar user select hai toh hidden, warna block */}
            {/* Desktop (lg): Hamesha block (lg:block) */}
            <div className={`h-full w-full lg:w-72 border-r border-gray-200 
              ${selectedUser ? "hidden" : "block"} lg:block`}>
              <Sidebar />
            </div>

            {/* --- CHAT SECTION --- */}
            {/* Mobile: Agar user select NAHI hai toh hidden, selected hai toh block */}
            {/* Desktop (lg): Hamesha flex (lg:flex) */}
            <div className={`flex-1 h-full 
              ${!selectedUser ? "hidden" : "block"} lg:block`}>
              
              {!selectedUser ? (
                <NotChatSelected />
              ) : (
                <ChatContainer />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Home