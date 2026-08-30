import React, { useState } from "react";
import { Trash2, Ban } from "lucide-react";

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
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex max-w-[82%] items-end gap-2 ${
          isMe ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {!isMe && (
          <div className="flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border border-[rgba(95,255,96,0.2)]">
            {message.sender?.profilePicture ? (
              <img
                src={message.sender.profilePicture}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[rgba(95,255,96,0.07)] flex items-center justify-center font-[family-name:'Syne',sans-serif] font-extrabold text-[0.65rem] text-[#5fff60]">
                {message.sender?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>
        )}

        <div
          className={`relative px-3.5 py-2.5 backdrop-blur-sm border rounded-[4px]
          ${
            message.isDeleted
              ? "bg-[rgba(20,20,20,0.5)] border-[rgba(120,120,120,0.15)]"
              : isMe
              ? "bg-[rgba(95,255,96,0.08)] border-[rgba(95,255,96,0.28)] rounded-tr-none"
              : "bg-[rgba(10,12,10,0.85)] border-[rgba(95,255,96,0.12)] rounded-tl-none"
          }`}
        >
          {!isMe && !message.isDeleted && (
            <p className="font-[family-name:'Syne',sans-serif] font-extrabold text-[0.65rem] text-[#5fff60] tracking-tight mb-1 max-w-[120px] truncate">
              {message.sender?.name || "Unknown"}
            </p>
          )}

          {message.isDeleted ? (
            <p className="flex items-center gap-1.5 font-[family-name:'JetBrains_Mono',monospace] text-[0.68rem] italic text-[rgba(180,180,180,0.4)]">
              <Ban size={11} className="flex-shrink-0" />
              This message was deleted
            </p>
          ) : (
            <p className="font-[family-name:'JetBrains_Mono',monospace] text-[0.7rem] text-[rgba(232,255,232,0.85)] leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 mt-1.5">
            {isMe && !message.isDeleted && onDelete && (
              confirming ? (
                <span className="flex items-center gap-1.5 font-[family-name:'JetBrains_Mono',monospace] text-[0.55rem] tracking-[0.04em]">
                  <span className="text-[rgba(255,150,150,0.6)]">Delete?</span>
                  <button
                    onClick={() => {
                      onDelete(message._id);
                      setConfirming(false);
                    }}
                    className="text-[rgba(255,120,120,0.85)] hover:text-[#ff6060] underline underline-offset-2 cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-[rgba(180,220,180,0.5)] hover:text-[rgba(180,220,180,0.8)] underline underline-offset-2 cursor-pointer"
                  >
                    No
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  title="Delete this message"
                  className="flex items-center gap-1 font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.04em] text-[rgba(255,120,120,0.35)] hover:text-[rgba(255,120,120,0.75)] transition-colors cursor-pointer"
                >
                  <Trash2 size={10} />
                  Delete
                </button>
              )
            )}
            <span
              className="font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.06em] text-[rgba(95,255,96,0.3)] hover:text-[rgba(95,255,96,0.55)] transition-colors cursor-help"
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
