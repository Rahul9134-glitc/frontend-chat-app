import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { sendMessage } from "../slices/chatSlices";
import { getSocket } from "../lib/socket";
import { X, Send, Image as ImageIcon, Mic, Square, Trash2, Loader2 } from "lucide-react"; // Loader2 add kiya

const MessageInput = () => {
  const [media, setMedia] = useState(null);
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  // --- GET SENDING STATUS FROM REDUX ---
  const { selectedUser, isSendindMessages } = useSelector((state) => state.chat);
  const auth = useSelector((state) => state.auth);
  const authUser = auth?.user || auth?.authUser;
  const socket = getSocket();

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
        setMedia(audioFile);
        setMediaType("audio");
        setMediaPreview(URL.createObjectURL(audioBlob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Microphone access denied or not found");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (!socket || !selectedUser?._id || !authUser?._id) return;

    if (!isTyping && value.trim().length > 0) {
      setIsTyping(true);
      socket.emit("typing", { receiverId: selectedUser._id, senderId: authUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedUser?._id) socket.emit("stopTyping", { receiverId: selectedUser._id });
      setIsTyping(false);
    }, 2000);
  };

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
    if ((!text.trim() && !media) || isSendindMessages) return; // Prevent double send

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", { receiverId: selectedUser._id });
    setIsTyping(false);

    const formData = new FormData();
    formData.append("text", text.trim());
    if (media) formData.append("media", media);

    dispatch(sendMessage({ receiverId: selectedUser._id, messageData: formData }));
    setText("");
    removeMedia();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
   <div className="p-2 md:p-4 w-full bg-white border-t border-gray-100">
      {/* Media Preview Section - isko flexible banaya taaki mobile pe na fate */}
      {mediaPreview && (
        <div className="mb-2 flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-dashed border-gray-300 overflow-x-auto">
          <div className="relative shrink-0">
            {mediaType === "image" && <img src={mediaPreview} alt="preview" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border" />}
            {mediaType === "video" && <video src={mediaPreview} className="w-24 h-24 md:w-32 md:h-32 rounded-lg border" controls />}
            {mediaType === "audio" && (
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm min-w-[180px]">
                <Mic className="text-blue-500" size={18} />
                <audio src={mediaPreview} controls className="h-8 w-40" />
              </div>
            )}
            <button
              onClick={removeMedia}
              disabled={isSendindMessages}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 md:gap-2 max-w-full">
        <div className={`flex-1 flex items-center gap-1 md:gap-2 bg-gray-50 px-2 md:px-3 py-1 rounded-2xl border border-gray-200 transition-all min-w-0 ${isSendindMessages ? "opacity-60" : "focus-within:ring-2 focus-within:ring-blue-500"}`}>
          
          <input type="file" accept="image/*,video/*" ref={fileInputRef} className="hidden" onChange={handleMediaChange} />

          {!isRecording ? (
            <>
              {/* Image Picker Icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSendindMessages}
                className="p-1 text-gray-500 hover:text-blue-600 shrink-0"
              >
                <ImageIcon size={20} className="md:w-[22px]" />
              </button>
              
              {/* Input Field - min-w-0 is key here */}
              <input
                type="text"
                placeholder={isSendindMessages ? "Sending..." : "Message..."}
                className="flex-1 min-w-0 bg-transparent py-2 px-1 focus:outline-none text-[15px] md:text-sm text-gray-700 disabled:cursor-not-allowed"
                value={text}
                onChange={handleInputChange}
                disabled={mediaType === "audio" || isSendindMessages}
              />

              {/* Mic Icon */}
              <button
                type="button"
                onClick={startRecording}
                disabled={isSendindMessages}
                className="p-1 text-gray-500 hover:text-red-500 shrink-0"
              >
                <Mic size={20} className="md:w-[22px]" />
              </button>
            </>
          ) : (
            /* Recording State */
            <div className="flex-1 flex items-center justify-between py-2 min-w-0">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                <span className="text-xs md:text-sm font-medium text-gray-600 truncate">
                  Recording {formatTime(recordingTime)}
                </span>
              </div>
              <button type="button" onClick={stopRecording} className="text-red-600 p-1 shrink-0"><Square size={18} fill="currentColor" /></button>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !media) || isRecording || isSendindMessages}
          className="w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-md active:scale-95 disabled:opacity-50"
        >
          {isSendindMessages ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} className="md:w-[20px] ml-0.5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;