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
  onDelivered, // 👈 NEW
  onSeen,      // 👈 FIXED
}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !API_BASE) return;

    socketRef.current = io(API_BASE, {
      auth: { token },
    });

    /* ---------------- LISTENERS ---------------- */

    socketRef.current.on("new_message", onMessage);

    socketRef.current.on("typing", onTyping);
    socketRef.current.on("stop_typing", onStopTyping);

    socketRef.current.on("message_deleted", ({ messageId }) =>
      onDelete(messageId)
    );

    socketRef.current.on("chat_cleared", onClear);

    // ✅ DELIVERED
    socketRef.current.on("message_delivered", ({ messageId }) => {
      onDelivered?.(messageId);
    });

    // ✅ SEEN (backend sends array of IDs)
    socketRef.current.on("messages_seen", (ids) => {
      onSeen?.(ids);
    });

    return () => {
      socketRef.current.off();
      socketRef.current.disconnect();
    };
  }, [chatId, token]);

  return {
    /* ---------------- EMITS ---------------- */

    sendMessage: (to, text) =>
      socketRef.current?.emit("send_message", { to, text }),

    typing: (to) =>
      socketRef.current?.emit("typing", { to }),

    stopTyping: (to) =>
      socketRef.current?.emit("stop_typing", { to }),

    // ✅ MUST MATCH BACKEND
    markSeen: (fromUserId) =>
      socketRef.current?.emit("seen_chat", {
        from: fromUserId,
      }),

    /* ---------------- REST ---------------- */

   deleteMessage: async (msg, mode = "me") => {
  await fetch(`${API_BASE}/api/messages/${msg._id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ mode }),
  });
},


    clearChat: async (id) => {
      await fetch(`${API_BASE}/api/messages/clear/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ mode: "everyone" }),
      });
    },
  };
}
