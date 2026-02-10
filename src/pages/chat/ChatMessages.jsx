import MessageBubble from "./MessageBubble";

export default function ChatMessages({
  messages,
  currentUser,
  otherUser,
  onDelete,
}) {
  return (
    <main className="chat-messages">
      {messages.map((msg) => {
        const senderId =
          typeof msg.sender === "string"
            ? msg.sender
            : msg.sender?._id;

        const isMe = senderId === currentUser._id;

        return (
          <MessageBubble
            key={msg._id}
            msg={msg}
            isMe={isMe}
            avatar={otherUser.avatar}
            onDelete={() => onDelete(msg)}
          />
        );
      })}
    </main>
  );
}
