import { useEffect, useRef } from "react";
import io from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function useChatSocket({
  token,
  chatId,
  onMessage,
  onTyping,
  onStopTyping,
  onDelete,
  onClear,
  onDelivered,
  onSeen,
}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !API_BASE) return;

    /* ✅ Prevent duplicate sockets */
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(API_BASE, {
      auth: { token },
    });

    const socket = socketRef.current;

    /* ---------------- LISTENERS ---------------- */

    socket.on("new_message", onMessage);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    socket.on("message_deleted", ({ messageId }) => {
      onDelete?.(messageId);
    });

    socket.on("chat_cleared", () => {
      onClear?.();
    });

    socket.on("message_delivered", ({ messageId }) => {
      onDelivered?.(messageId);
    });

    socket.on("messages_seen", (ids) => {
      onSeen?.(ids);
    });

    return () => {
      socket.off();
      socket.disconnect();
    };
  }, [chatId, token]);

  return {
    /* ---------------- SOCKET ACTIONS ---------------- */

    sendMessage: (to, text) =>
      socketRef.current?.emit("send_message", { to, text }),

    typing: (to) =>
      socketRef.current?.emit("typing", { to }),

    stopTyping: (to) =>
      socketRef.current?.emit("stop_typing", { to }),

    markSeen: (fromUserId) =>
      socketRef.current?.emit("seen_chat", { from: fromUserId }),

    /* ---------------- DELETE MESSAGE ---------------- */

    deleteMessage: async (msg, mode = "me") => {
      /* ✅ Optimistic UI */
      onDelete?.(msg._id);

      try {
        await fetch(`${API_BASE}/api/messages/${msg._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ mode }),
        });
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },

    /* ---------------- CLEAR CHAT ---------------- */

    clearChat: async (id, mode = "me") => {
      /* ✅ Optimistic UI */
      onClear?.();

      try {
        await fetch(`${API_BASE}/api/messages/clear/${id}`, {
          method: "DELETE",   // ✅ FIXED 🔥
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({ mode }),
        });
      } catch (err) {
        console.error("Clear chat failed:", err);
      }
    },
  };
}
