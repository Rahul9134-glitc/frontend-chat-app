import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getMessages,
  markMessagesAsSeen,
  updateMessageStatusLocal,
  addMessage,
  removeMessageLocal,
  deleteMessageAction,
  addReactionAction, 
  updateMessageReaction
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
  const [activeEmojiMenu, setActiveEmojiMenu] = useState(null); 
  const socket = getSocket();

  const reactionsList = ["❤️", "😂", "👍", "😮", "😢", "🙏"];

  const handleReactionSelect = (messageId, emoji) => {
    dispatch(addReactionAction({ messageId, emoji }));
    setActiveEmojiMenu(null);
  };

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
    
    socket.on("reactionUpdate", (data) => {
      dispatch(updateMessageReaction(data));
    });

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
      socket.off("reactionUpdate");
      socket.off("messagesSeenByReceiver");
      socket.off("messageDeleted");
      socket.off("displayTyping");
      socket.off("hideTyping");
    };
  }, [socket, selectedUser?._id, dispatch]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping, isSendindMessages]);

  useEffect(() => {
    const closeMenu = () => setActiveEmojiMenu(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

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
            const isLastInGroup = !messages[index + 1] || messages[index + 1].senderId !== message.senderId;
            const showDateSeparator = index === 0 || new Date(messages[index - 1].createdAt).toDateString() !== new Date(message.createdAt).toDateString();
            
            // Emoji spacing logic
            const hasReactions = message.reactions?.length > 0;

            return (
              <React.Fragment key={message._id || index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-6">
                    <span className="bg-gray-100 text-gray-500 text-[10px] px-3 py-1 rounded-full border border-gray-200 uppercase font-medium">
                      {formatSeparatorDate(message.createdAt)}
                    </span>
                  </div>
                )}

                <div className={`flex items-end group ${isAuthUser ? "justify-end" : "justify-start"} ${hasReactions ? "mb-5" : "mb-1"}`}>
                  {!isAuthUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mr-2 mb-1">
                      {isLastInGroup ? (
                        <img src={selectedUser?.avatar?.url || "/avatar.avif"} alt="avatar" className="w-full h-full rounded-full object-cover border" />
                      ) : <CornerDownRight size={14} className="text-gray-300" />}
                    </div>
                  )}

                  <div 
                    className={`relative max-w-[85%] sm:max-w-[75%] px-3 py-2 sm:px-4 sm:py-2 shadow-sm text-sm
                      ${isAuthUser 
                        ? `bg-blue-600 text-white ${isLastInGroup ? "rounded-2xl rounded-br-none" : "rounded-2xl"}` 
                        : `bg-gray-100 text-gray-800 ${isLastInGroup ? "rounded-2xl rounded-bl-none" : "rounded-2xl"}`
                      } transition-all duration-200 active:scale-[0.98] cursor-pointer`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setActiveEmojiMenu(message._id);
                    }}
                  >
                    {/* Emoji Reaction Menu */}
                    {activeEmojiMenu === message._id && (
                      <div className={`absolute -top-12 z-50 flex gap-1.5 bg-white border border-gray-200 shadow-xl p-1.5 rounded-full animate-in zoom-in duration-150 ${isAuthUser ? "right-0" : "left-0"}`}>
                        {reactionsList.map((emoji) => (
                          <button 
                            key={emoji} 
                            onClick={(e) => { e.stopPropagation(); handleReactionSelect(message._id, emoji); }} 
                            className="hover:scale-125 transition-transform px-0.5 text-lg active:opacity-60"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reaction Display - Spacing Fixed */}
                    {hasReactions && (
                      <div className={`absolute -bottom-3.5 flex -space-x-1 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 shadow-md z-10 ${isAuthUser ? "right-2" : "left-2"}`}>
                        {[...new Set(message.reactions.map(r => r.emoji))].map((emoji, i) => (
                          <span key={i} className="text-[11px] leading-none">{emoji}</span>
                        ))}
                      </div>
                    )}

                    {/* Delete Buttons */}
                    {isAuthUser && (
                      <button onClick={() => handleDelete(message._id)} className="absolute -left-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 hidden sm:block"><Trash2 size={16} /></button>
                    )}
                    {isAuthUser && (
                      <button onClick={() => handleDelete(message._id)} className="sm:hidden absolute -top-1 -left-6 p-1 text-gray-300 active:text-red-500"><Trash2 size={12} /></button>
                    )}

                    {/* Media Handling - Audio Size Fixed */}
                    {message.media?.url && (
                      <div className="mb-1 overflow-hidden rounded-lg">
                        {message.media.url.match(/\.(mp4|mov|webm)$/i) ? (
                          <video src={message.media.url} controls className="max-w-full max-h-64 rounded-lg" />
                        ) : message.media.url.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                          <div className="py-2 min-w-[200px] sm:min-w-[260px]">
                            <audio 
                              src={message.media.url} 
                              controls 
                              className={`w-full h-8 scale-90 origin-left custom-audio ${isAuthUser ? "brightness-200 contrast-100" : ""}`} 
                            />
                          </div>
                        ) : (
                          <img src={message.media.url} alt="media" className="max-w-full max-h-64 object-contain rounded-lg shadow-inner" />
                        )}
                      </div>
                    )}

                    {message.text && <p className="leading-relaxed break-words text-[13px] sm:text-sm">{message.text}</p>}

                    <div className={`flex items-center justify-end gap-1 mt-1 ${isAuthUser ? "text-blue-100" : "text-gray-400"}`}>
                      <p className="text-[9px] sm:text-[10px]">{formatMessageTime(message.createdAt)}</p>
                      {isAuthUser && <CheckCheck size={14} className={message.seen ? "text-sky-300" : "text-gray-300"} />}
                    </div>
                  </div>

                  {isAuthUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 ml-2 mb-1">
                      {isLastInGroup ? (
                        <img src={authUser?.avatar?.url || "/avatar.avif"} alt="avatar" className="w-full h-full rounded-full object-cover border" />
                      ) : <CornerDownLeft size={14} className="text-gray-300" />}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400"><p>Say hello!</p></div>
        )}

        {isSendindMessages && (
          <div className="flex justify-end mb-4 animate-pulse">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-2xl">
              <span className="text-[10px] text-blue-600 font-medium">Sending...</span>
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
            </div>
          </div>
        )}

        {isOtherUserTyping && (
           <div className="flex items-center gap-2 mt-2">
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