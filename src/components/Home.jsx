import React from 'react'
import {useSelector} from 'react-redux'
import Sidebar from './skeleten/Sidebar'
import NotChatSelected from './skeleten/NotChatSelected'
import ChatContainer from './skeleten/ChatContainer'

const Home = () => {
  const {selectedUser} = useSelector((state)=>state.chat)


  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='flex items-center justify-center pt-20 px-4'>
        <div className='bg-white rounded-lg shadow-md w-full max-w-6xl h-[calc(100vh-8rem)]'>
          <div className='flex h-full rounded-lg overflow-hidden'>
            <Sidebar/>
            {!selectedUser ? <NotChatSelected/> : <ChatContainer/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home