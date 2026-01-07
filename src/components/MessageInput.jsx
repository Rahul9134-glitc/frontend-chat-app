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
    <div className="p-4 w-full bg-white border-t border-gray-100">
      {mediaPreview && (
        <div className="mb-3 flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300">
          <div className="relative">
            {mediaType === "image" && <img src={mediaPreview} alt="preview" className="w-20 h-20 object-cover rounded-lg border" />}
            {mediaType === "video" && <video src={mediaPreview} className="w-32 h-32 rounded-lg border" controls />}
            {mediaType === "audio" && (
              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm min-w-[200px]">
                <Mic className="text-blue-500" size={20} />
                <audio src={mediaPreview} controls className="h-8 w-48" />
              </div>
            )}
            <button
              onClick={removeMedia}
              disabled={isSendindMessages} // Disable delete while sending
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 disabled:bg-gray-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className={`flex-1 flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-2xl border border-gray-200 transition-all ${isSendindMessages ? "opacity-60" : "focus-within:ring-2 focus-within:ring-blue-500"}`}>
          <input type="file" accept="image/*,video/*" ref={fileInputRef} className="hidden" onChange={handleMediaChange} />

          {!isRecording ? (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSendindMessages}
                className="text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed"
              >
                <ImageIcon size={22} />
              </button>
              
              <input
                type="text"
                placeholder={isSendindMessages ? "Sending media..." : "Type a message..."}
                className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-sm text-gray-700 disabled:cursor-not-allowed"
                value={text}
                onChange={handleInputChange}
                disabled={mediaType === "audio" || isSendindMessages}
              />

              <button
                type="button"
                onClick={startRecording}
                disabled={isSendindMessages}
                className="text-gray-500 hover:text-red-500 disabled:cursor-not-allowed"
              >
                <Mic size={22} />
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-600">Recording... {formatTime(recordingTime)}</span>
              </div>
              <button type="button" onClick={stopRecording} className="text-red-600 hover:bg-red-50 p-1 rounded-full"><Square size={20} fill="currentColor" /></button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && !media) || isRecording || isSendindMessages}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
        >
          {isSendindMessages ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} className={text.trim() || media ? "ml-0.5" : ""} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;