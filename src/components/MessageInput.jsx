import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { sendMessage, addMessage } from "../slices/chatSlices"; // Use addMessage
import { getSocket } from "../lib/socket";
import { X, Send, Image as ImageIcon } from "lucide-react";

const MessageInput = () => {
  const [media, setMedia] = useState(null);
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("");

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.chat);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMedia(file);
    const type = file.type;

    if (type.startsWith("image/")) {
      setMediaType("image");
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (type.startsWith("video/")) {
      setMediaType("video");
      setMediaPreview(URL.createObjectURL(file));
    } else {
      toast.error("Please select a valid image or video file");
      removeMedia();
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaPreview(null);
    setMediaType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    // Use FormData for file uploads
    const formData = new FormData();
    formData.append("text", text.trim());
    if (media) formData.append("media", media);

    // Pass an object to the thunk containing the ID and the Data
    dispatch(sendMessage({ receiverId: selectedUser._id, messageData: formData }));

    // Reset UI immediately
    setText("");
    removeMedia();
  };

  // Keep this only if you don't have a listener in ChatContainer
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedUser) return;

    const handleMessage = (newMessage) => {
      // Only push if the message is part of this specific conversation
      if (newMessage.senderId === selectedUser._id) {
        dispatch(addMessage(newMessage)); // Use the real action creator
      }
    };

    socket.on("newMessage", handleMessage);
    return () => socket.off("newMessage", handleMessage);
  }, [selectedUser?._id, dispatch]);

  return (
    <div className="p-4 w-full bg-white border-t border-gray-100">
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            {mediaType === "image" ? (
              <img src={mediaPreview} alt="preview" className="w-20 h-20 object-cover rounded-lg border" />
            ) : (
              <video src={mediaPreview} className="w-32 h-32 rounded-lg border" controls />
            )}
            <button
              onClick={removeMedia}
              className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-800 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleMediaChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              media ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <ImageIcon size={20} />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={!text.trim() && !media}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;