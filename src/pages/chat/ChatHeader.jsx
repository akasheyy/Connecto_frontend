import { Link } from "react-router-dom";
import { useOnlineUsers } from "../../context/OnlineContext";

export default function ChatHeader({ user, isTyping, onClear }) {
  const onlineUsers = useOnlineUsers();
  const isOnline = onlineUsers.includes(user._id);

  const styles = {
    header: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 16px",
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      position: "sticky",
      top: 0,
      zIndex: 10
    },

    backBtn: {
      textDecoration: "none",
      fontSize: "22px",
      fontWeight: "bold",
      color: "#111"
    },

    avatar: {
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      objectFit: "cover"
    },

    userInfo: {
      textDecoration: "none",
      color: "inherit",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      lineHeight: 1.2
    },

    username: {
      margin: 0,
      fontSize: "15px",
      fontWeight: "700"
    },

    status: {
      fontSize: "12px",
      color: isTyping ? "#6d28d9" : isOnline ? "#10b981" : "#6b7280",
      fontWeight: "500"
    },

    clearBtn: {
      border: "none",
      background: "transparent",
      fontSize: "18px",
      cursor: "pointer"
    }
  };

  return (
    <header style={styles.header}>
      <Link to="/dashboard" style={styles.backBtn}>
        ←
      </Link>

      <img src={user.avatar} alt="" style={styles.avatar} />

      {/* ✅ Clickable user block */}
      <Link to={`/user/${user._id}`} style={styles.userInfo}>
        <h4 style={styles.username}>{user.username}</h4>
        <span style={styles.status}>
          {isTyping ? "typing…" : isOnline ? "Online" : "Offline"}
        </span>
      </Link>

      <button onClick={onClear} style={styles.clearBtn}>
        🗑️
      </button>
    </header>
  );
}
