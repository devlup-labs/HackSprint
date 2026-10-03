import React from "react";

const FriendMessageBubble = ({ message, isMe, friend, status, waiting, onRetry, onDiscard }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`flex max-w-[82%] items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        {!isMe && (
          <div className="flex-shrink-0 w-6 h-6 rounded-full overflow-hidden bg-accent">
            {friend?.image?.url ? (
              <img src={friend.image.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display font-bold text-[0.6rem] text-primary">
                {friend?.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
        )}

        <div
          className={`relative px-3 py-2 rounded-2xl shadow-sm ${status ? "opacity-70" : ""} ${
            isMe
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border rounded-bl-md"
          }`}
        >
          <p
            className={`text-[0.8rem] leading-relaxed whitespace-pre-wrap ${
              isMe ? "text-primary-foreground" : "text-foreground"
            }`}
          >
            {message.content}
          </p>
          <span
            className={`block text-right text-[0.6rem] mt-0.5 ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {status === "failed" ? (
              <span className="inline-flex items-center gap-2">
                <span>Not sent</span>
                <button onClick={onRetry} className="underline cursor-pointer">Retry</button>
                <button onClick={onDiscard} className="underline cursor-pointer">Remove</button>
              </span>
            ) : status === "sending" ? (
              waiting ? "Waiting for connection…" : "Sending…"
            ) : (
              time
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FriendMessageBubble;
