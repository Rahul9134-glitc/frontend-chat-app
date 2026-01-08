import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getMessages,
  markMessagesAsSeen,
  updateMessageStatusLocal,
  addMessage,
  removeMessageLocal,
  deleteMessageAction,
} from "../../slices/chatSlices";
import { getSocket } from "../../lib/socket";
import MessageSkeleton from "./MessageSkeleton";
import MessageInput from "../MessageInput";
import ChatHeader from "./ChatHeader";
import { CheckCheck, Loader2, Trash2, CornerDownRight, CornerDownLeft } from "lucide-react";

const ChatContainer = () => {
  const notificationSound = useRef(new Audio("/notification.mp3")); 
  const sendSound = useRef(new Audio("/sending.mp3")); 
  
  const { messages, isMessagesLoading, selectedUser, isSendindMessages } = useSelector((state) => state.chat);
  const { authUser } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();
  const messageEndRef = useRef(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const socket = getSocket();

  // Logic for Sending Sound
  useEffect(() => {
    if (isSendindMessages) {
      sendSound.current.play().catch(() => {});
    }
  }, [isSendindMessages]);

  useEffect(() => {
    if (selectedUser?._id) dispatch(getMessages(selectedUser._id));
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    if (selectedUser?._id && messages.length > 0 && socket) {
      dispatch(markMessagesAsSeen(selectedUser._id));
      socket.emit("markAsSeen", { senderId: selectedUser._id, recieverId: authUser._id });
    }
  }, [selectedUser?._id, messages.length, dispatch, socket, authUser._id]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId === selectedUser?._id) {
        dispatch(addMessage(newMessage));
        notificationSound.current.play().catch(() => {});
      }
    };
    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeenByReceiver", ({ recieverId }) => {
      if (recieverId === selectedUser?._id) dispatch(updateMessageStatusLocal(recieverId));
    });
    socket.on("messageDeleted", (id) => dispatch(removeMessageLocal(id)));
    socket.on("displayTyping", (data) => {
      if (data.senderId === selectedUser?._id) setIsOtherUserTyping(true);
    });
    socket.on("hideTyping", () => setIsOtherUserTyping(false));

    return () => {
      socket.off("newMessage");
      socket.off("messagesSeenByReceiver");
      socket.off("messageDeleted");
      socket.off("displayTyping");
      socket.off("hideTyping");
    };
  }, [socket, selectedUser?._id, dispatch]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping, isSendindMessages]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure delete your message for everyone?")) {
      dispatch(deleteMessageAction(id)).then((res) => {
        if (!res.error) socket.emit("deleteMessage", { messageId: id, receiverId: selectedUser._id });
      });
    }
  };

  const formatSeparatorDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  };

  const formatMessageTime = (date) => new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  if (isMessagesLoading) return <div className="flex-1 flex flex-col overflow-auto"><ChatHeader /><MessageSkeleton /><MessageInput /></div>;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      <ChatHeader isTyping={isOtherUserTyping} />

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
        {messages.length > 0 ? (
          messages.map((message, index) => {
            const isAuthUser = message.senderId === authUser._id;
            const isLastMessage = index === messages.length - 1;
            const nextMessage = messages[index + 1];
            const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;

            const currentMsgDate = new Date(message.createdAt).toDateString();
            const prevMsgDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
            const showDateSeparator = currentMsgDate !== prevMsgDate;

            return (
              <React.Fragment key={message._id || index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6">
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-3 py-1 rounded-full border border-gray-200 uppercase font-medium">
                      {formatSeparatorDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex items-end group ${isAuthUser ? "justify-end" : "justify-start"} 
                  ${isLastMessage ? (isAuthUser ? "animate-slide-right" : "animate-slide-left") : ""}`}
                >
                  {/* Left Side (Selected User) */}
                  {!isAuthUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mr-2 mb-1">
                      {isLastInGroup ? (
                        <img src={selectedUser?.avatar?.url || "/avatar.avif"} alt="avatar" className="w-full h-full rounded-full object-cover border" />
                      ) : (
                        <CornerDownRight size={14} className="text-gray-300" />
                      )}
                    </div>
                  )}

                  <div className={`relative max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2 shadow-sm text-sm mb-1
                    ${isAuthUser 
                      ? `bg-blue-600 text-white ${isLastInGroup ? "rounded-2xl rounded-br-none" : "rounded-2xl"}` 
                      : `bg-gray-100 text-gray-800 ${isLastInGroup ? "rounded-2xl rounded-bl-none" : "rounded-2xl"}`
                    }`}
                  >
                    {/* Responsive Delete Button */}
                    {isAuthUser && (
                      <button 
                        onClick={() => handleDelete(message._id)} 
                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-all 
                        opacity-0 group-hover:opacity-100 hidden sm:block" /* Desktop: Hover par dikhega */
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    
                    {/* Mobile Specific Delete Icon (Visible but subtle) */}
                    {isAuthUser && (
                      <button 
                        onClick={() => handleDelete(message._id)} 
                        className="sm:hidden absolute -top-1 -left-6 p-1 text-gray-300 active:text-red-500" /* Mobile: Side me chota dikhega */
                      >
                        <Trash2 size={12} />
                      </button>
                    )}

                    {message.media?.url && (
                      <div className="mb-2 overflow-hidden rounded-lg">
                        {message.media.url.match(/\.(mp4|mov|webm)$/i) ? (
                          <video src={message.media.url} controls className="max-w-full max-h-64 rounded-lg" />
                        ) : <img src={message.media.url} alt="media" className="max-w-full max-h-64 object-contain rounded-lg shadow-inner" />}
                      </div>
                    )}

                    {message.text && <p className="leading-relaxed break-words text-[13px] sm:text-sm">{message.text}</p>}

                    <div className={`flex items-center justify-end gap-1 mt-1 ${isAuthUser ? "text-blue-100" : "text-gray-400"}`}>
                      <p className="text-[9px] sm:text-[10px]">{formatMessageTime(message.createdAt)}</p>
                      {isAuthUser && <CheckCheck size={14} className={message.seen ? "text-sky-300" : "text-gray-300"} />}
                    </div>
                  </div>

                  {/* Right Side (Auth User) */}
                  {isAuthUser && (
                     <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 ml-2 mb-1">
                     {isLastInGroup ? (
                       <img src={authUser?.avatar?.url || "/avatar.avif"} alt="avatar" className="w-full h-full rounded-full object-cover border" />
                     ) : (
                       <CornerDownLeft size={14} className="text-gray-300" />
                     )}
                   </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400"><p>Say hello!</p></div>
        )}

        {/* Sending Loader */}
        {isSendindMessages && (
          <div className="flex justify-end mb-4 animate-pulse">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-2xl">
              <span className="text-[10px] text-blue-600 font-medium">Sending...</span>
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isOtherUserTyping && (
           <div className="flex items-center gap-2 animate-fade-in mt-2">
             <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border">
               <img src={selectedUser?.avatar?.url || "/avatar.avif"} alt="avatar" className="w-full h-full object-cover" />
             </div>
             <div className="bg-gray-100 px-3 py-2 rounded-2xl flex gap-1 items-center">
               <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
               <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
               <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;