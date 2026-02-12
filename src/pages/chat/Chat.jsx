import { useEffect, useState, useRef, useLayoutEffect, useCallback } from "react";
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

  /* ---------------- STATE ---------------- */

  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [loading, setLoading] = useState(true);

  // ✅ NEW → Clear Chat Modal
  const [showClearModal, setShowClearModal] = useState(false);

  /* ---------------- REFS ---------------- */

  const containerRef = useRef(null);
  const messagesRef = useRef(null);
  const bottomRef = useRef(null);
  const lastSeenRef = useRef(null);
  const initialScrollDone = useRef(false);

  /* ---------------- VIEWPORT FIX ---------------- */

 useEffect(() => {
  const viewport = window.visualViewport;

  if (!viewport) return;

  const handleKeyboard = () => {
    const keyboardHeight = window.innerHeight - viewport.height;

    document.documentElement.style.setProperty(
      "--keyboard-height",
      `${keyboardHeight}px`
    );
  };

  viewport.addEventListener("resize", handleKeyboard);

  return () => viewport.removeEventListener("resize", handleKeyboard);
}, []);

  /* ---------------- SOCKET ---------------- */

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
    },
  });

  /* ---------------- ACTIONS ---------------- */

  const handleDelete = useCallback(
    async (msg, mode) => {
      await socket.deleteMessage(msg, mode);

      if (mode === "me") {
        setMessages((prev) => prev.filter((m) => m._id !== msg._id));
      }
    },
    [socket]
  );

  // ✅ CLEAR CHAT ONLY FOR ME
  const handleClearChatForMe = async () => {
    try {
      await socket.clearChat(id, "me"); // IMPORTANT 🔥
      setMessages([]);
    } catch (err) {
      console.error("Clear chat failed", err);
    } finally {
      setShowClearModal(false);
    }
  };

  /* ---------------- DATA INIT ---------------- */

  useEffect(() => {
    async function initChat() {
      setLoading(true);

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [me, msgs, other] = await Promise.all([
          fetch(`${API_BASE}/api/user/me`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/api/messages/history/${id}`, { headers }).then((r) => r.json()),
          fetch(`${API_BASE}/api/user/profile/${id}`, { headers }).then((r) => r.json()),
        ]);

        setCurrentUser(me);
        setMessages(msgs);
        setOtherUser(other.user);
      } catch (err) {
        console.error("Failed to load chat data", err);
      } finally {
        setLoading(false);
      }
    }

    initChat();
  }, [id, token]);

  /* ---------------- SCROLL DETECTION ---------------- */

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;

    const handleScroll = () => {
      const isAtBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 150;

      setAutoScroll(isAtBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------- INITIAL SCROLL ---------------- */

  useLayoutEffect(() => {
    if (!messages.length || initialScrollDone.current || loading) return;

    bottomRef.current?.scrollIntoView({ behavior: "auto" });

    initialScrollDone.current = true;
  }, [messages, loading]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    if (autoScroll && !loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, autoScroll, loading]);

  /* ---------------- READ RECEIPTS ---------------- */

  useEffect(() => {
    if (!currentUser || !messages.length) return;

    const unseenIds = messages.filter((m) => {
      const senderId =
        typeof m.sender === "string" ? m.sender : m.sender?._id;

      return senderId === id && m.status !== "seen";
    });

    if (unseenIds.length > 0) {
      const lastId = unseenIds[unseenIds.length - 1]._id;

      if (lastSeenRef.current !== lastId) {
        lastSeenRef.current = lastId;
        socket.markSeen(id);
      }
    }
  }, [messages, id, currentUser, socket]);

  if (loading)
    return <div className="chat-loading-screen">Loading Chat...</div>;

  return (
    <div className="chat-container" ref={containerRef}>
      <style>
        {`
          body, html {
            margin: 0;
            padding: 0;
            width: 100vw;
            height: 100dvh;
            overflow: hidden;
          }

          .chat-container {
            display: flex;
            flex-direction: column;
            width: 100vw;
            height: 100dvh;
            background: #fff;
          }

          .chat-messages-viewport {
            flex: 1;
            overflow-y: auto;
            background: #f0f2f5;
          }

          .messages-inner-wrapper {
            padding: 10px;
          }

          /* ✅ CLEAR CHAT MODAL */
          .clear-chat-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999;
          }

          .clear-chat-box {
            background: white;
            padding: 22px;
            border-radius: 16px;
            width: 90%;
            max-width: 320px;
            text-align: center;
          }

          .clear-chat-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
          }

          .clear-chat-actions button {
            flex: 1;
            padding: 10px;
            border-radius: 10px;
            border: none;
            font-weight: bold;
            cursor: pointer;
          }

          .clear-btn {
            background: #ef4444;
            color: white;
          }

          .cancel-btn {
            background: #e5e7eb;
          }
            .chat-input-section {
  position: sticky;
  bottom: 0;
  background: white;

  padding-bottom: env(safe-area-inset-bottom);
  transform: translateY(calc(-1 * var(--keyboard-height, 0px)));
  transition: transform 0.25s ease;
}

        `}
      </style>

      {/* ✅ MODAL */}
      {showClearModal && (
        <div className="clear-chat-overlay">
          <div className="clear-chat-box">
            <h3>Clear Chat</h3>
            <p>This will remove messages only for you.</p>

            <div className="clear-chat-actions">
              <button className="clear-btn" onClick={handleClearChatForMe}>
                Clear Chat
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <header>
        <ChatHeader
          user={otherUser}
          isTyping={isTyping}
          onClear={() => setShowClearModal(true)} // 🔥 UPDATED
        />
      </header>

      <main className="chat-messages-viewport" ref={messagesRef}>
        <div className="messages-inner-wrapper">
          <ChatMessages
            messages={messages}
            currentUser={currentUser}
            otherUser={otherUser}
            onDelete={handleDelete}
          />
          <div ref={bottomRef} style={{ height: "1px" }} />
        </div>
      </main>

      <footer>
        <ChatInput socket={socket} chatId={id} />
      </footer>
    </div>
  );
}
