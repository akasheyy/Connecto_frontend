import { useState, useRef } from "react";
import useRecorder from "./useRecorder";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ChatInput({ socket, chatId }) {
  const [text, setText] = useState("");
  const fileRef = useRef(null);

  const { start, stop, isRecording } = useRecorder(async (blob) => {
    const form = new FormData();
    form.append("audio", blob);

    await fetch(`${API_BASE}/api/messages/voice/${chatId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: form,
    });
  });

  // 🔥 FILE UPLOAD
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    await fetch(`${API_BASE}/api/messages/file/${chatId}`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: form,
    });

    e.target.value = ""; // reset input
  };

  const send = () => {
    if (!text.trim()) return;
    socket.sendMessage(chatId, text);
    socket.stopTyping(chatId);
    setText("");
  };

  return (
    <footer className="chat-input">
      {/* FILE INPUT */}
      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />

      <button onClick={() => fileRef.current.click()}>📎</button>

      {/* TEXT INPUT */}
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          socket.typing(chatId);
        }}
        onKeyDown={(e) => e.key === "Enter" && send()}
        placeholder="Message"
      />

      {!text && (
        <button onClick={isRecording ? stop : start}>
          {isRecording ? "■" : "🎙️"}
        </button>
      )}

      {text && <button onClick={send}>➤</button>}
    </footer>
  );
}
