import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getMessages,
  markMessagesAsSeen,
  updateMessageStatusLocal,
  addMessage,
} from "../../slices/chatSlices";
import { getSocket } from "../../lib/socket";
import MessageSkeleton from "./MessageSkeleton";
import MessageInput from "../MessageInput";
import ChatHeader from "./ChatHeader";
import { CheckCheck, Loader2 } from "lucide-react"; // Loader2 icon import kiya

const ChatContainer = () => {
  const notificationSound = useRef(new Audio("/notification.mp3"));
  
  // 1. Redux se isSendindMessages state nikali
  const { messages, isMessagesLoading, selectedUser, isSendindMessages } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
    }
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    if (selectedUser?._id && messages.length > 0 && socket) {
      dispatch(markMessagesAsSeen(selectedUser._id));
      socket.emit("markAsSeen", {
        senderId: selectedUser._id,
        recieverId: authUser._id,
      });
    }
  }, [selectedUser?._id, messages.length, dispatch, socket, authUser._id]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      const isFromSelectedUser = newMessage.senderId === selectedUser?._id;
      const isFromMe = newMessage.senderId === authUser?._id;
      const isDuplicate = messages.some((m) => m._id === newMessage._id);

      if (isFromSelectedUser && !isFromMe && !isDuplicate) {
        dispatch(addMessage(newMessage));
        notificationSound.current.play().catch(() => {});
      }
    };

    const handleSeen = ({ recieverId }) => {
      if (recieverId === selectedUser?._id) {
        dispatch(updateMessageStatusLocal(recieverId));
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeenByReceiver", handleSeen);
    socket.on("displayTyping", (data) => {
      if (data.senderId === selectedUser?._id) setIsOtherUserTyping(true);
    });
    socket.on("hideTyping", () => setIsOtherUserTyping(false));

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeenByReceiver", handleSeen);
      socket.off("displayTyping");
      socket.off("hideTyping");
    };
  }, [socket, selectedUser?._id, authUser?._id, messages, dispatch]);

  // Loader aur typing ke time auto-scroll ke liye isSendindMessages ko dependency mein dala
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOtherUserTyping, isSendindMessages]);

  const formatSeparatorDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

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
      <ChatHeader isTyping={isOtherUserTyping} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isAuthUser = message.senderId === authUser._id;
            const currentMsgDate = new Date(message.createdAt).toDateString();
            const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
            const showDateSeparator = currentMsgDate !== prevMsgDate;

            return (
              <React.Fragment key={message._id || index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6">
                    <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full border border-gray-200 uppercase font-medium">
                      {formatSeparatorDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-end ${isAuthUser ? "justify-end" : "justify-start"}`}
                  ref={index === messages.length - 1 ? messageEndRef : null}
                >
                  <div className={`w-8 h-8 rounded-full overflow-hidden border shrink-0 ${isAuthUser ? "order-2 ml-2" : "mr-2"}`}>
                    <img
                      src={(isAuthUser ? authUser?.avatar?.url : selectedUser?.avatar?.url) || "/avatar.avif"}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                      isAuthUser ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {message.media && (
                      <div className="mb-2">
                        {message.media.match(/\.(webm|mp3|wav|ogg|m4a)$/i) || message.media.includes("video/upload") && message.media.endsWith(".webm") ? (
                          <audio src={message.media} controls className="max-w-full w-48 h-10 lg:w-64" />
                        ) : 
                        message.media.match(/\.(mp4|mov)$/i) ? (
                          <video src={message.media} controls className="max-w-full rounded-lg" />
                        ) : (
                          <img src={message.media} alt="attachment" className="max-w-full rounded-lg" />
                        )}
                      </div>
                    )}

                    {message.text && <p className="leading-relaxed break-words">{message.text}</p>}

                    <div className={`flex items-center justify-end gap-1 mt-1 ${isAuthUser ? "text-blue-100" : "text-gray-400"}`}>
                      <p className="text-[10px]">{formatMessageTime(message.createdAt)}</p>
                      {isAuthUser && (
                        <CheckCheck size={14} className={message.seen ? "text-sky-300" : "text-gray-300"} />
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <p>No messages yet. Say hello!</p>
          </div>
        )}

        {/* --- 2. SENDING LOADER UI --- */}
        {isSendindMessages && (
          <div className="flex justify-end mb-4 animate-pulse">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-2xl shadow-sm">
              <span className="text-xs text-blue-600 font-medium">Sending...</span>
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            </div>
          </div>
        )}

        {isOtherUserTyping && (
           <div className="flex items-center gap-2 animate-fade-in">
             <div className="w-8 h-8 rounded-full overflow-hidden border shrink-0">
               <img src={selectedUser?.avatar?.url || "/avatar.avif"} alt="avatar" className="w-full h-full object-cover" />
             </div>
             <div className="bg-gray-100 px-3 py-2 rounded-2xl flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
          </div>
        )}

        {/* Anchor point for auto-scroll */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;