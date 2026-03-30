import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import useRecorder from "./useRecorder";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function ChatInput({ socket, chatId }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);
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

  // 📎 FILE
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

    e.target.value = "";
  };

  // 📏 AUTO GROW TEXTAREA
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [text]);

  // 😀 EMOJI SELECT
  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const send = () => {
    if (!text.trim()) return;
    socket.sendMessage(chatId, text);
    socket.stopTyping(chatId);
    setText("");
  };

  return (
    <footer className="chat-input">
      <style>
        {`
       /* ROOT */
.chat-input {
  position: relative;
  padding: 12px 16px;
  background: #ffffff;
  border-top: 1px solid #eeeeee;
}

/* INPUT WRAPPER */
.chat-input .input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #f1f3f4;
  padding: 10px 14px;
  border-radius: 28px;
  border: 1px solid transparent;
  transition: all 0.25s ease;
}

/* FOCUS EFFECT */
.chat-input .input-row:focus-within {
  background: #ffffff;
  border-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* TEXTAREA */
.chat-input textarea {
  flex: 1;
  background: transparent;
  color: #202124;
  border: none;
  outline: none;
  resize: none;
  font-size: 15px;
  line-height: 1.5;
  max-height: 140px;
  padding: 4px 0;
}

/* PLACEHOLDER */
.chat-input textarea::placeholder {
  color: #70757a;
}

/* BUTTONS */
.chat-input button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  font-size: 20px;
  border-radius: 50%;
  color: #5f6368;
  min-width: 40px;
  min-height: 40px;
  transition: all 0.2s ease;
}

/* BUTTON HOVER */
.chat-input button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #202124;
}

/* SEND BUTTON */
.chat-input .send-btn {
  color: #1a73e8;
}

/* RECORDING STATE */
.chat-input .recording {
  color: #d93025 !important;
  background: #fce8e6;
}

/* EMOJI PICKER */
.chat-input .emoji-box {
  position: absolute;
  bottom: 70px;
  left: 10px;
  z-index: 100;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
} `}
      </style>
      {/* FILE INPUT */}
      <input
        ref={fileRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />

      {/* EMOJI PICKER */}
      {showEmoji && (
        <div className="emoji-box">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <div className="input-row">
        <button onClick={() => setShowEmoji((s) => !s)}>😊</button>

        <button onClick={() => fileRef.current.click()}>📎</button>

        {/* TEXTAREA */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            socket.typing(chatId);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message"
        />

        {!text && (
          <button onClick={isRecording ? stop : start}>
            {isRecording ? "■" : "🎙️"}
          </button>
        )}

        {text && <button onClick={send}>➤</button>}
      </div>
    </footer>
  );
}
