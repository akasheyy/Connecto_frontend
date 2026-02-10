import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useOnlineUsers } from "../context/OnlineContext";

/* ================= LOADER STYLES ================= */
const uiStyles = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#f8fafc"
  },
  dotWrapper: { display: "flex", gap: "8px", marginBottom: "20px" },
  dot: {
    width: "14px",
    height: "14px",
    backgroundColor: "#4f46e5",
    borderRadius: "50%"
  },
  loadingText: { fontSize: "16px", color: "#64748b", fontWeight: "500" }
};

/* ================= CARD STYLES ================= */
const styles = {
  container: {
    padding: "80px 20px 40px",
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  },
  title: { fontSize: "28px", fontWeight: "800", margin: 0 },
  card: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    background: "#fff",
    marginBottom: "16px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    textDecoration: "none",
    color: "inherit"
  },
  avatarContainer: { position: "relative", marginRight: "16px" },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    objectFit: "cover"
  },
  onlineBadge: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "14px",
    height: "14px",
    backgroundColor: "#4ade80",
    border: "3px solid #fff",
    borderRadius: "50%"
  },
  content: { flexGrow: 1 },
  username: { fontSize: "16px", fontWeight: "700" },
  message: {
  margin: "4px 0 0",
  color: "#6b7280",
  fontSize: "14px",

  display: "-webkit-box",
  WebkitLineClamp: 1,       // 👈 LIMIT TO 1 LINE
  WebkitBoxOrient: "vertical",

  overflow: "hidden",
  textOverflow: "ellipsis",
  wordBreak: "break-all"    // 👈 prevents overflow for long words
}

};

export default function Dashboard() {
  const API_BASE = process.env.REACT_APP_API_BASE_URL;
  const token = localStorage.getItem("token");

  // ✅ CORRECT ONLINE USERS HOOK
  const onlineUsers = useOnlineUsers();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD CHATS ================= */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/messages/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          setConversations([]);
          return;
        }

        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Inbox Load Error:", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    }

    if (token && API_BASE) load();
  }, [API_BASE, token]);

  /* ================= LOADER ================= */
  if (loading)
    return (
      <div style={uiStyles.loaderContainer}>
        <div style={uiStyles.dotWrapper}>
          <div style={uiStyles.dot} />
          <div style={uiStyles.dot} />
          <div style={uiStyles.dot} />
        </div>
        <h2 style={uiStyles.loadingText}>Loading…</h2>
      </div>
    );

  /* ================= UI ================= */
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        <div>{conversations.length} Chats</div>
      </header>

      {conversations.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          No messages yet.
        </p>
      ) : (
        conversations.map((chat) => {
          const u = chat.user;
          if (!u) return null;

          // ✅ REAL ONLINE CHECK
          const isOnline = onlineUsers.includes(u._id);

          return (
            <Link to={`/chat/${u._id}`} key={u._id} style={styles.card}>
              <div style={styles.avatarContainer}>
                <img
                  src={
                    u.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                  }
                  alt=""
                  style={styles.avatar}
                />
                {isOnline && <div style={styles.onlineBadge} />}
              </div>

              <div style={styles.content}>
                <span style={styles.username}>{u.username}</span>
                <p style={styles.message}>
                  {chat.lastMessage || "Start a conversation"}
                </p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}
