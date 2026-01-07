import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMessages } from "../../slices/chatSlices";
import MessageSkeleton from "./MessageSkeleton";
import MessageInput from "../MessageInput";
import ChatHeader from "./ChatHeader"

const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser } = useSelector(
    (state) => state.chat
  );
  const { authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const messageEndRef = useRef(null);

  // 1. Fetch messages whenever the selected user changes
  useEffect(() => {
    console.log("selected user id ",selectedUser?._id);
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]); 

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function formatMessaging(date) {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isAuthUser = message.senderId === authUser._id;
            return (
              <div
                key={message._id || index}
                className={`flex items-end ${isAuthUser ? "justify-end" : "justify-start"}`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${isAuthUser ? "order-2 ml-3" : "mr-3"}`}>
                  <img
                    src={(isAuthUser ? authUser?.avatar?.url : selectedUser?.avatar?.url) || "/avatar.avif"}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bubble */}
                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-xl text-sm ${
                  isAuthUser ? "bg-blue-500 text-white order-1" : "bg-gray-200 text-black order-2"
                }`}>
                  {message.media && (
                    <div className="mb-2">
                      {message.media.match(/\.(mp4|webm|mov)$/) ? (
                        <video src={message.media} controls className="w-full rounded-md" />
                      ) : (
                        <img src={message.media} alt="attachment" className="w-full rounded-md" />
                      )}
                    </div>
                  )}
                  
                  {message.text && <p className="leading-relaxed">{message.text}</p>}
                  
                  <p className={`text-[10px] mt-1 ${isAuthUser ? "text-blue-100" : "text-gray-500"}`}>
                    {formatMessaging(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p>No messages yet. Say hello!</p>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;