import { Link } from "react-router-dom";
import { useOnlineUsers } from "../../context/OnlineContext";

export default function ChatHeader({ user, isTyping, onClear }) {
  const onlineUsers = useOnlineUsers();
  const isOnline = onlineUsers.includes(user._id);

  return (
    <header className="chat-header">
      <Link to="/dashboard">←</Link>

      <img src={user.avatar} alt="" />

      <div>
        <h4>{user.username}</h4>
        <span>
          {isTyping
            ? "typing…"
            : isOnline
            ? "Online"
            : "Offline"}
        </span>
      </div>

      <button onClick={onClear}>🗑️</button>
    </header>
  );
}
