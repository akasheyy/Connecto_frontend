import { useState } from "react";

export default function MessageBubble({ msg, isMe, avatar, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  const time = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderTicks = () => {
    if (!isMe) return null;

    if (msg.status === "seen") {
      return <span className="tick seen">✓✓</span>;
    }

    if (msg.status === "delivered") {
      return <span className="tick delivered">✓✓</span>;
    }

    return <span className="tick sent">✓</span>;
  };

  const handleDelete = (mode) => {
    setShowActions(false);
    onDelete(msg, mode); // 👈 pass mode to parent
  };

  return (
    <>
      <div id={`msg-${msg._id}`} className={`bubble-row ${isMe ? "me" : ""}`}>
        {!isMe && <img src={avatar} alt="" />}

        <div className="bubble">
          {msg.fileUrl ? (
            <img src={msg.fileUrl} alt="attachment" />
          ) : msg.audioUrl ? (
            <audio controls src={msg.audioUrl} />
          ) : (
            msg.text
          )}

          <div className="bubble-meta">
            <span className="time">{time}</span>
            {renderTicks()}

            <button
              className="more-btn"
              onClick={() => setShowActions(true)}
            >
              ⋮
            </button>
          </div>
        </div>
      </div>

      {/* ACTION SHEET */}
      {showActions && (
        <div className="action-overlay" onClick={() => setShowActions(false)}>
          <div
            className="action-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => handleDelete("me")}>
              Delete for me
            </button>

            {isMe && (
              <button
                className="danger"
                onClick={() => handleDelete("everyone")}
              >
                Delete for everyone
              </button>
            )}

            <button onClick={() => setShowActions(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
