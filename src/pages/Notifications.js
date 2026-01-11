import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiUserPlus, FiMessageSquare } from "react-icons/fi";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.log("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.log("Error marking as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.log("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.log("Error deleting notification:", err);
    }
  };

  const formatText = (n) => {
    const name = n.fromUserId?.username || "Someone";

    switch (n.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented: "${n.text}"`;
      case "follow":
        return `${name} started following you`;
      case "message":
        return `${name} sent you a message`;
      default:
        return "New notification";
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <FiHeart size={20} color="#ef4444" />;
      case "comment":
        return <FiMessageCircle size={20} color="#3b82f6" />;
      case "follow":
        return <FiUserPlus size={20} color="#10b981" />;
      case "message":
        return <FiMessageSquare size={20} color="#f59e0b" />;
      default:
        return <FiMessageSquare size={20} color="#6b7280" />;
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markAsRead(n._id);
    }

    if (n.type === "follow" && n.fromUserId) {
      navigate(`/user/${n.fromUserId._id}`);
    } else if ((n.type === "like" || n.type === "comment") && n.postId) {
      navigate(`/post/${n.postId._id || n.postId}`);
    } else if (n.type === "message" && n.fromUserId) {
      navigate(`/chat/${n.fromUserId._id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* LIST */}
      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>
          <p>No notifications yet</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNotificationClick(n)}
            style={{
              display: "flex",
              gap: 12,
              padding: 16,
              borderRadius: 12,
              marginBottom: 8,
              background: n.read ? "#fff" : "#f3f4f6",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              transition: "background 0.2s"
            }}
          >
            {/* AVATAR */}
            <img
              src={n.fromUserId?.avatar || "https://i.pravatar.cc/40"}
              alt=""
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                flexShrink: 0
              }}
            />

            {/* CONTENT */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                {getIcon(n.type)}
                <span style={{ fontSize: 14, color: "#374151", flex: 1 }}>
                  {formatText(n)}
                </span>
              </div>

              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {new Date(n.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </div>
            </div>

            {/* DELETE BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(n._id);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                padding: 4,
                borderRadius: 4
              }}
            >
              ✕
            </button>
          </div>
        ))
      )}
    </div>
  );
}
