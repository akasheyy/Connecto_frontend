import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// 1. ADDED UI STYLES FOR THE LOADER
const uiStyles = {
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh', 
    background: '#f8fafc' 
  },
  dotWrapper: { display: 'flex', gap: '8px', marginBottom: '20px' },
  dot: { width: '14px', height: '14px', backgroundColor: '#4f46e5', borderRadius: '50%' },
  loadingText: { fontSize: '16px', color: '#64748b', fontWeight: '500' },
};

const styles = {
  container: {
    padding: "80px 20px 40px 20px", 
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#f8f9fa", 
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a1a1a",
    margin: 0,
  },
  card: {
    display: "flex",
    alignItems: "center",
    padding: "16px",
    background: "#ffffff",
    marginBottom: "16px",
    borderRadius: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
  },
  avatarContainer: {
    position: "relative",
    marginRight: "16px",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "18px", 
    objectFit: "cover",
  },
  onlineBadge: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "14px",
    height: "14px",
    backgroundColor: "#4ade80",
    border: "3px solid #fff",
    borderRadius: "50%",
  },
  content: {
    flexGrow: 1,
    minWidth: 0, 
  },
  username: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#111",
    display: "block",
  },
  message: {
    margin: "2px 0 0",
    color: "#6b7280",
    fontSize: "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  time: {
    fontSize: "12px",
    color: "#9ca3af",
    marginLeft: "10px",
  }
};

export default function Dashboard() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");
        if (!token || !API_BASE_URL) return;
        const res = await fetch(`${API_BASE_URL}/api/messages/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : data.conversations || []);
      } catch (err) {
        console.error("Inbox Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [API_BASE_URL]);

  if (loading) return (
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
      <h2 style={{...uiStyles.loadingText, animation: 'pulseText 2s infinite'}}>Loading...</h2>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Messages</h2>
        <div style={{ background: '#e0e7ff', padding: '8px 16px', borderRadius: '20px', color: '#4338ca', fontSize: '14px', fontWeight: '600' }}>
          {conversations.length} Chats
        </div>
      </header>

      {conversations.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666", marginTop: "40px" }}>No messages yet.</p>
      ) : (
        conversations.map((chat) => {
          const u = chat.user;
          // Null check u
          if (!u) return null;
          
          const isOnline = u?.lastActive && (new Date() - new Date(u.lastActive) < 300000);

          return (
            <Link 
              to={`/chat/${u._id}`} 
              key={u._id} 
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 25px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
              }}
            >
              <div style={styles.avatarContainer}>
                <img 
                  src={u.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + u.username} 
                  alt="avatar" 
                  style={styles.avatar} 
                />
                {isOnline && <div style={styles.onlineBadge} />}
              </div>

              <div style={styles.content}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={styles.username}>{u.username}</span>
                  <span style={styles.time}>
                    {u.lastActive ? new Date(u.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </span>
                </div>
                <p style={styles.message}>{chat.lastMessage || "Start a conversation"}</p>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}