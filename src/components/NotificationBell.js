import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { FiBell } from "react-icons/fi";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  /* ---------------- FETCH UNREAD COUNT ---------------- */
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.log("Error fetching unread count:", err);
    }
  };

  /* ---------------- SOCKET ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !API_BASE_URL) return;
    if (socketRef.current) return;

    socketRef.current = io(API_BASE_URL, {
      auth: { token }
    });

    socketRef.current.on("notification", (payload) => {
      // Increment unread count when new notification arrives
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [API_BASE_URL]);

  /* ---------------- FETCH ON MOUNT ---------------- */
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* BELL */}
      <button
        onClick={() => navigate("/notifications")}
        style={styles.bellBtn}
      >
        <FiBell size={26} />

        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>
    </div>
  );
}

/* ---------------- STYLES ---------------- */
const styles = {
  bellBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    position: "relative"
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#ef4444",
    color: "#fff",
    borderRadius: "999px",
    fontSize: 11,
    padding: "2px 6px",
    fontWeight: 600
  }
};
