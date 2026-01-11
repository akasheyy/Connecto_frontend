import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import io from "socket.io-client";

export default function Chat() {
  const { id } = useParams();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [recordStartTime, setRecordStartTime] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const bottomRef = useRef(null);
  const socket = useRef(null);

  const token = localStorage.getItem("token");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const seenSentRef = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  };

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!token || !API_BASE_URL) return;
    socket.current = io(API_BASE_URL, { auth: { token } });

    socket.current.on("new_message", (msg) => {
      const s = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
      const r = typeof msg.receiver === "string" ? msg.receiver : msg.receiver?._id;
      if (s === id || r === id) setMessages((prev) => [...prev, msg]);
    });

    socket.current.on("typing", ({ from }) => { if (from === id) setIsTyping(true); });
    socket.current.on("stop_typing", ({ from }) => { if (from === id) setIsTyping(false); });
    socket.current.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    socket.current.on("chat_cleared", () => setMessages([]));
    socket.current.on("message_delivered", ({ messageId }) => {
      setMessages((prev) => prev.map((m) => m._id === messageId && m.status !== "seen" ? { ...m, status: "delivered" } : m));
    });
    socket.current.on("messages_seen", (ids) => {
      if (!Array.isArray(ids)) return;
      setMessages((prev) => prev.map((m) => ids.includes(m._id) ? { ...m, status: "seen" } : m));
    });

    return () => socket.current?.disconnect();
  }, [id, token, API_BASE_URL]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function load() {
      if (!token || !API_BASE_URL) return;
      try {
        const meRes = await fetch(`${API_BASE_URL}/api/user/me`, { headers: { Authorization: "Bearer " + token } });
        const meData = await meRes.json();
        setCurrentUser(meData);

        const msgRes = await fetch(`${API_BASE_URL}/api/messages/history/${id}`, { headers: { Authorization: "Bearer " + token } });
        const msgData = await msgRes.json();
        setMessages(Array.isArray(msgData) ? msgData : msgData.messages || []);

        const userRes = await fetch(`${API_BASE_URL}/api/user/profile/${id}`, { headers: { Authorization: "Bearer " + token } });
        const userData = await userRes.json();
        setOtherUser(userData.user || null);
        setTimeout(scrollToBottom, 100);
      } catch (e) { console.error(e); }
    }
    load();
  }, [id, token, API_BASE_URL]);

  useEffect(scrollToBottom, [messages.length]);

  /* ================= SEEN ================= */
  useEffect(() => {
    if (!socket.current || !currentUser) return;
    const unseen = messages.filter((m) => {
      const senderId = typeof m.sender === "string" ? m.sender : m.sender?._id;
      return senderId === id && m.status !== "seen" && !seenSentRef.current.has(m._id);
    });
    if (!unseen.length) return;
    const ids = unseen.map((m) => m._id);
    ids.forEach((i) => seenSentRef.current.add(i));
    socket.current.emit("seen_messages", { ids, from: currentUser._id });
  }, [messages, currentUser, id]);

  /* ================= SEND ACTIONS ================= */
  const sendMessage = () => {
    if (!text.trim() || !socket.current) return;
    socket.current.emit("send_message", { to: id, text });
    socket.current.emit("stop_typing", { to: id });
    clearTimeout(typingTimeoutRef.current);
    setText("");
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (!socket.current) return;
    socket.current.emit(value.trim() ? "typing" : "stop_typing", { to: id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socket.current.emit("stop_typing", { to: id }), 1500);
  };

  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await fetch(`${API_BASE_URL}/api/messages/file/${id}`, { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd });
    e.target.value = "";
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    recorder.ondataavailable = (e) => e.data.size && audioChunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const fd = new FormData();
      fd.append("audio", blob);
      fd.append("duration", recordSeconds);
      await fetch(`${API_BASE_URL}/api/messages/voice/${id}`, { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd });
      stream.getTracks().forEach((t) => t.stop());
      setRecordSeconds(0);
    };
    recorder.start();
    setIsRecording(true);
    setRecordStartTime(Date.now());
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    if (!isRecording) return;
    const i = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [isRecording]);

  const handleDeleteMessage = async (mode) => {
    setActionLoading(true);
    await fetch(`${API_BASE_URL}/api/messages/${deleteTarget._id}`, {
      method: "DELETE", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ mode })
    });
    setMessages((prev) => prev.filter((m) => m._id !== deleteTarget._id));
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setActionLoading(false);
  };

  const handleClearChat = async (mode) => {
    setActionLoading(true);
    await fetch(`${API_BASE_URL}/api/messages/clear/${id}`, {
      method: "DELETE", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ mode })
    });
    setMessages([]);
    setShowClearModal(false);
    setActionLoading(false);
  };

  /* ================= LOADING VIEW ================= */
  if (!currentUser || !otherUser) {
    return (
      <div style={uiStyles.loaderContainer}>
        <style>{`
          @keyframes bounce { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
          @keyframes pulseText { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
        <div style={uiStyles.dotWrapper}>
          <div style={{...uiStyles.dot, animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s'}}></div>
          <div style={{...uiStyles.dot, animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s'}}></div>
          <div style={{...uiStyles.dot, animation: 'bounce 1.4s infinite ease-in-out both'}}></div>
        </div>
        <h2 style={{...uiStyles.loadingText, animation: 'pulseText 2s infinite'}}>Loading your chat...</h2>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      {/* ---------------- TOP BAR ---------------- */}
      <div style={uiStyles.topBar}>
        <Link to="/dashboard" style={uiStyles.backBtn}>⬅</Link>
        <img src={otherUser.avatar || "https://via.placeholder.com/40"} alt="avatar" style={uiStyles.topAvatar} />
        <div style={{ flexGrow: 1 }}>
          <Link to={`/user/${otherUser._id}`} style={uiStyles.userNameLink}><b>{otherUser.username}</b></Link>
          <p style={{ fontSize: "12px", margin: 0, color: isTyping ? "#10b981" : "#64748b", fontWeight: isTyping ? "600" : "400" }}>
            {isTyping ? "Typing..." : "Online"}
          </p>
        </div>
        <button onClick={() => setShowClearModal(true)} style={uiStyles.iconBtn}>🗑️</button>
      </div>

      {/* ---------------- CHAT MESSAGES ---------------- */}
      <div style={uiStyles.messagesArea}>
        {messages.map((msg, index) => {
          const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
          const isMe = senderId === currentUser._id;
          const status = msg.status || "delivered";
          return (
            <div key={msg._id || index} style={{ ...uiStyles.msgRow, justifyContent: isMe ? "flex-end" : "flex-start" }}>
              {!isMe && <img src={otherUser.avatar} alt="av" style={uiStyles.msgAvatar} />}
              <div style={{ ...uiStyles.bubble, background: isMe ? "#4f46e5" : "#fff", color: isMe ? "#fff" : "#1e293b", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderBottomRightRadius: isMe ? "4px" : "18px", borderBottomLeftRadius: isMe ? "18px" : "4px" }}>
                {msg.fileUrl ? (
                  msg.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 
                  <img src={msg.fileUrl} alt="sent" style={{ maxWidth: "220px", borderRadius: "10px" }} /> :
                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: isMe ? "#fff" : "#4f46e5" }}>📄 File</a>
                ) : msg.audioUrl ? (
                  <audio controls src={msg.audioUrl} style={{ maxWidth: "200px" }} />
                ) : ( msg.text )}
                <div style={{ ...uiStyles.msgMeta, color: isMe ? "rgba(255,255,255,0.7)" : "#94a3b8" }}>
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMe && <span style={{ color: status === "seen" ? "#38bdf8" : "inherit" }}>{status === "sent" ? "✓" : "✓✓"}</span>}
                </div>
              </div>
              <button onClick={() => { setDeleteTarget(msg); setShowDeleteModal(true); }} style={uiStyles.msgMenuBtn}>⋮</button>
              {isMe && <img src={currentUser.avatar} alt="av" style={uiStyles.msgAvatar} />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ---------------- REDESIGNED INPUT AREA ---------------- */}
      <div style={uiStyles.inputFixedWrapper}>
        {isRecording && (
          <div style={uiStyles.recordingBanner}>
            <span style={uiStyles.recordingDot}></span> Recording Voice ({recordSeconds}s)
          </div>
        )}
        <div style={uiStyles.inputContainer}>
          <input type="file" id="fileInput" style={{ display: "none" }} onChange={sendFile} />
          <button onClick={() => document.getElementById("fileInput").click()} style={uiStyles.attachBtn}>+</button>
          
          <div style={uiStyles.inputFieldWrapper}>
            <input
              value={text}
              onChange={handleInputChange}
              placeholder={isRecording ? "Recording audio..." : "Type a message..."}
              disabled={isRecording}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={uiStyles.mainInput}
            />
            <button 
              onClick={isRecording ? stopRecording : startRecording} 
              style={{...uiStyles.micBtn, color: isRecording ? "#ef4444" : "#64748b"}}
            >
              {isRecording ? "■" : "🎙️"}
            </button>
          </div>

          <button
            onClick={sendMessage}
            disabled={!text.trim() || isRecording}
            style={{...uiStyles.sendBtn, background: !text.trim() || isRecording ? "#e2e8f0" : "#4f46e5"}}
          >
            ➤
          </button>
        </div>
      </div>

      {/* MODALS RENDERED HERE (Keep your existing modal code) */}
      {showDeleteModal && deleteTarget && (
         <div style={uiStyles.modalOverlay}>
            <div style={uiStyles.modalContent}>
               <p style={{marginBottom: "15px", fontWeight: "600"}}>Delete Message?</p>
               <button onClick={() => handleDeleteMessage("me")} style={uiStyles.modalBtnSec}>Delete for me</button>
               {(typeof deleteTarget.sender === "string" ? deleteTarget.sender : deleteTarget.sender?._id) === currentUser._id && (
                 <button onClick={() => handleDeleteMessage("everyone")} style={uiStyles.modalBtnDanger}>Delete for everyone</button>
               )}
               <button onClick={() => setShowDeleteModal(false)} style={uiStyles.modalBtnCancel}>Cancel</button>
            </div>
         </div>
      )}

      {showClearModal && (
         <div style={uiStyles.modalOverlay}>
            <div style={uiStyles.modalContent}>
               <p style={{marginBottom: "15px", fontWeight: "600"}}>Clear entire chat?</p>
               <button onClick={() => handleClearChat("me")} style={uiStyles.modalBtnSec}>Clear for me</button>
               <button onClick={() => setShowClearModal(false)} style={uiStyles.modalBtnCancel}>Cancel</button>
            </div>
         </div>
      )}
    </div>
  );
}

/* ================= NEW UI STYLES ================= */
const uiStyles = {
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' },
  dotWrapper: { display: 'flex', gap: '8px', marginBottom: '20px' },
  dot: { width: '14px', height: '14px', backgroundColor: '#4f46e5', borderRadius: '50%' },
  loadingText: { fontSize: '16px', color: '#64748b', fontWeight: '500' },
  topBar: { height: "70px", display: "flex", alignItems: "center", gap: "12px", padding: "0 20px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 },
  backBtn: { fontSize: "20px", textDecoration: "none", color: "#64748b" },
  topAvatar: { width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0" },
  userNameLink: { textDecoration: "none", color: "#1e293b", fontSize: "16px" },
  iconBtn: { border: "none", background: "transparent", fontSize: "18px", cursor: "pointer", opacity: 0.6 },
  messagesArea: { marginTop: "70px", marginBottom: "90px", flexGrow: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column" },
  msgRow: { display: "flex", alignItems: "flex-end", marginBottom: "16px", gap: "8px", width: "100%" },
  msgAvatar: { width: 28, height: 28, borderRadius: "50%" },
  bubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: "18px", position: "relative", fontSize: "15px", lineHeight: "1.4" },
  msgMeta: { display: "flex", justifyContent: "flex-end", gap: "5px", fontSize: "10px", marginTop: "4px" },
  msgMenuBtn: { border: "none", background: "transparent", color: "#cbd5e1", cursor: "pointer", padding: "5px" },
  inputFixedWrapper: { position: "fixed", bottom: 0, left: 0, right: 0, padding: "15px 20px", background: "linear-gradient(transparent, #f8fafc 30%)" },
  inputContainer: { display: "flex", alignItems: "center", gap: "12px", background: "#fff", padding: "8px 12px", borderRadius: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" },
  inputFieldWrapper: { flexGrow: 1, display: "flex", alignItems: "center", background: "#f1f5f9", borderRadius: "24px", padding: "0 15px" },
  mainInput: { flexGrow: 1, border: "none", background: "transparent", padding: "10px 0", outline: "none", fontSize: "15px", color: "#1e293b" },
  attachBtn: { width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f1f5f9", color: "#64748b", fontSize: "20px", cursor: "pointer" },
  micBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "18px", padding: "0 5px" },
  sendBtn: { width: 40, height: 40, borderRadius: "50%", border: "none", color: "#fff", cursor: "pointer", transition: "all 0.2s" },
  recordingBanner: { textAlign: "center", color: "#ef4444", fontSize: "12px", marginBottom: "8px", fontWeight: "600", display: "flex", justifyContent: "center", alignItems: "center", gap: "5px" },
  recordingDot: { width: 8, height: 8, background: "#ef4444", borderRadius: "50%", display: "inline-block" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" },
  modalContent: { background: "#fff", borderRadius: "20px", padding: "24px", width: "90%", maxWidth: "340px", textAlign: "center" },
  modalBtnSec: { width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "#f1f5f9", color: "#475569", fontWeight: "600", marginBottom: "8px", cursor: "pointer" },
  modalBtnDanger: { width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "#fee2e2", color: "#ef4444", fontWeight: "600", marginBottom: "8px", cursor: "pointer" },
  modalBtnCancel: { width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0", background: "none", color: "#94a3b8", fontWeight: "600", cursor: "pointer" }
};