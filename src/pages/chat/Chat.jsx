import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import useChatSocket from "./useChatSocket";
import "./chat.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function Chat() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const messagesRef = useRef(null); // 👈 scroll container
  const bottomRef = useRef(null);
  const lastSeenRef = useRef(null);
  const initialScrollDone = useRef(false);

  /* ================= SOCKET ================= */
  const socket = useChatSocket({
    token,
    chatId: id,

    onMessage: (msg) => {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    },

    onTyping: () => setIsTyping(true),
    onStopTyping: () => setIsTyping(false),

    onDelete: (messageId) =>
      setMessages((prev) => prev.filter((m) => m._id !== messageId)),

    onClear: () => setMessages([]),

    onDelivered: (messageId) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, status: "delivered" } : m
        )
      );
    },

    onSeen: (ids) => {
      setMessages((prev) =>
        prev.map((m) =>
          ids.includes(m._id) ? { ...m, status: "seen" } : m
        )
      );
    }
  });

  /* ================= SCROLL DETECTION ================= */
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setAutoScroll(nearBottom);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= INITIAL SCROLL ================= */
  useLayoutEffect(() => {
    if (!messages.length || initialScrollDone.current) return;

    // Find last seen message
    const lastSeen = [...messages].reverse().find(msg => msg.status === "seen");
    if (lastSeen) {
      const el = document.getElementById(`msg-${lastSeen._id}`);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "center" });
      }
    } else {
      // If no seen message, scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
    initialScrollDone.current = true;
  }, [messages]);

  /* ================= SMART AUTO SCROLL ================= */
  useEffect(() => {
    if (!autoScroll) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, autoScroll]);

  /* ================= MARK AS SEEN ================= */
  useEffect(() => {
    if (!currentUser || !messages.length) return;

    const unseen = messages.filter((m) => {
      const senderId =
        typeof m.sender === "string" ? m.sender : m.sender?._id;
      return senderId === id && m.status !== "seen";
    });

    if (!unseen.length) return;

    const lastId = unseen[unseen.length - 1]._id;
    if (lastSeenRef.current === lastId) return;

    lastSeenRef.current = lastId;
    socket.markSeen(id);
  }, [messages, id, currentUser, socket]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function load() {
      const headers = { Authorization: "Bearer " + token };

      const me = await fetch(`${API_BASE}/api/user/me`, { headers }).then((r) =>
        r.json()
      );

      const msgs = await fetch(
        `${API_BASE}/api/messages/history/${id}`,
        { headers }
      ).then((r) => r.json());

      const other = await fetch(
        `${API_BASE}/api/user/profile/${id}`,
        { headers }
      ).then((r) => r.json());

      setCurrentUser(me);
      setMessages(msgs);
      setOtherUser(other.user);
    }

    load();
  }, [id, token]);

  if (!currentUser || !otherUser) {
    return <div className="loading">Loading…</div>;
  }

  const handleDelete = async (msg, mode) => {
    await socket.deleteMessage(msg, mode);
    if (mode === "me") {
      setMessages((prev) => prev.filter((m) => m._id !== msg._id));
    }
  };

  /* ================= UI ================= */
  return (
    <div className="chat-page">
      <ChatHeader
        user={otherUser}
        isTyping={isTyping}
        onClear={() => socket.clearChat(id)}
      />

      {/* 🔥 SCROLL CONTAINER */}
      <main className="chat-messages" ref={messagesRef}>
        <ChatMessages
          messages={messages}
          currentUser={currentUser}
          otherUser={otherUser}
          onDelete={handleDelete}
        />
        <div ref={bottomRef} />
      </main>

      <ChatInput socket={socket} chatId={id} />
    </div>
  );
}
