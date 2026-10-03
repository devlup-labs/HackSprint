import React, { useState } from "react";
import { Trash2, Ban } from "lucide-react";

// Splits on "@word" tokens so mentions render highlighted, WhatsApp-style,
// without needing a participant-search endpoint to back a real autocomplete.
const renderContent = (text) => {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-primary font-semibold">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const MessageBubble = ({ message, isMe, onDelete }) => {
  const [confirming, setConfirming] = useState(false);
  const d = new Date(message.createdAt);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2.5`}>
      <div className={`flex max-w-[82%] items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        {!isMe && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden bg-accent">
            {message.sender?.profilePicture ? (
              <img src={message.sender.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-bold text-xs text-primary">
                {message.sender?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        )}

        <div
          className={`relative px-3.5 py-2.5 rounded-2xl shadow-sm ${
            message.isDeleted
              ? "bg-secondary/60"
              : isMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border rounded-bl-md"
          }`}
        >
          {!isMe && !message.isDeleted && (
            <p className="font-display font-bold text-xs text-primary mb-1 max-w-[140px] truncate">
              {message.sender?.name || "Unknown"}
            </p>
          )}

          {message.isDeleted ? (
            <p className="flex items-center gap-1.5 text-xs italic text-muted-foreground">
              <Ban size={11} className="flex-shrink-0" />
              This message was deleted
            </p>
          ) : (
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap ${
                isMe ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              {renderContent(message.content)}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 mt-1">
            {isMe && !message.isDeleted && onDelete && (
              confirming ? (
                <span className="flex items-center gap-1.5 text-[0.65rem]">
                  <span className="opacity-80">Delete?</span>
                  <button
                    onClick={() => {
                      onDelete(message._id);
                      setConfirming(false);
                    }}
                    className="underline underline-offset-2 cursor-pointer hover:opacity-80"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="underline underline-offset-2 cursor-pointer opacity-70 hover:opacity-100"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  title="Delete this message"
                  className={`flex items-center gap-1 text-[0.65rem] cursor-pointer transition-opacity opacity-50 hover:opacity-90 ${
                    isMe ? "text-primary-foreground" : "text-destructive"
                  }`}
                >
                  <Trash2 size={10} />
                </button>
              )
            )}
            <span
              className={`text-[0.65rem] cursor-help ${
                isMe ? "text-primary-foreground/70" : "text-muted-foreground"
              }`}
              title={`${date} at ${time}`}
            >
              {time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
