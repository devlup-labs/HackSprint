import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
let socket;

const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
  }
  return socket;
};

const getDateLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const strip = (dt) =>
    new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  if (strip(d) === strip(today)) return "Today";
  if (strip(d) === strip(yesterday)) return "Yesterday";
  return d.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const showSeparator = (cur, prev) => {
  if (!prev) return true;
  const a = new Date(cur.createdAt),
    b = new Date(prev.createdAt);
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
};

const DateSep = ({ date }) => (
  <div className="flex items-center justify-center my-3">
    <span className="font-[family-name:'JetBrains_Mono',monospace] text-[0.52rem] tracking-[0.14em] uppercase text-[rgba(95,255,96,0.35)] px-3 py-1 rounded-[2px] border border-[rgba(95,255,96,0.1)] bg-[rgba(10,12,10,0.6)]">
      {getDateLabel(date)}
    </span>
  </div>
);

const ChatInterface = ({ hackathonId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatId] = useState(hackathonId);
  const [activeTab] = useState("group");
  const [currentUser, setCurrentUser] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socket = getSocket();
  const containerRef = useRef(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    function handleConnect() {
      console.log("Connected");
      setSocketConnected(true);
    }

    function handleDisconnect() {
      console.log("Disconnected");
      setSocketConnected(false);
    }

    socket.off("connect");
    socket.off("disconnect");
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("adminToken");
    if (!token) return;
    try {
      const d = jwtDecode(token);
      setCurrentUser({ ...d, _id: d._id || d.id || d.userId });
    } catch (e) {
      // console.error(e);
    }
  }, []);

  useEffect(() => {
    if (!currentChatId || !socket) return;
    if (!socket.connected) socket.connect();
    socket.emit("join_room", currentChatId);

    (async () => {
      try {
        setIsLoading(true);
        const r = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/chat/${currentChatId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (r.ok) setMessages(await r.json());
      } catch {
        // console.error("Failed to fetch messages");
      } finally {
        setIsLoading(false);
      }
    })();

    const onMsg = (msg) => {
      if (msg.chatId === currentChatId) setMessages((p) => [...p, msg]);
    };
    socket.on("receive_message", onMsg);
    return () => {
      socket.emit("leave_room", currentChatId);
      socket.off("receive_message", onMsg);
    };
  }, [currentChatId]);

  useEffect(() => {
    if (containerRef.current)
      setTimeout(() => {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }, 0);
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please login to join the discussion");
      return;
    }
    if (!newMessage.trim()) return;
    socket.emit("send_message", {
      chatId: currentChatId,
      content: newMessage,
      senderId: currentUser._id,
      type: activeTab === "group" ? "group" : "direct",
      participants: activeTab === "group" ? [] : [currentUser._id],
    });
    setNewMessage("");
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto font-[family-name:'JetBrains_Mono',monospace]">
        <div className="relative h-[70vh] sm:h-[580px] bg-[rgba(10,12,10,0.92)] border border-[rgba(95,255,96,0.12)] rounded-[4px] backdrop-blur-sm flex flex-col overflow-hidden">
          <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-t-2 border-l-2 border-[rgba(95,255,96,0.45)] z-10" />
          <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-b-2 border-r-2 border-[rgba(95,255,96,0.45)] z-10" />

          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(95,255,96,0.08)] bg-[rgba(8,10,8,0.7)] flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={14}
                className="text-[rgba(95,255,96,0.55)]"
              />
              <span className="font-[family-name:'Syne',sans-serif] font-extrabold text-white text-sm tracking-tight">
                Discussions
              </span>
            </div>
            <div
              className={`flex items-center gap-1.5 text-[0.55rem] tracking-[0.1em] uppercase ${
                socket && socket.connected
                  ? "text-[rgba(95,255,96,0.55)]"
                  : "text-[rgba(255,96,96,0.55)]"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  socket && socket.connected
                    ? "bg-[#5fff60] animate-pulse"
                    : "bg-[#ff6060]"
                }`}
              />
              {socket && socket.connected ? "Connected" : "Disconnected"}
            </div>
          </div>

          <div
            ref={containerRef}
            className="chat-scroll flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full gap-2 text-[rgba(95,255,96,0.35)]">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[0.6rem] tracking-[0.1em] uppercase">
                  Loading…
                </span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-[rgba(95,255,96,0.25)]">
                <MessageSquare size={32} />
                <p className="text-[0.6rem] tracking-[0.08em] uppercase">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <React.Fragment key={msg._id || idx}>
                  {showSeparator(msg, messages[idx - 1]) && (
                    <DateSep date={msg.createdAt} />
                  )}
                  <MessageBubble
                    message={msg}
                    isMe={
                      currentUser &&
                      msg.sender &&
                      (msg.sender._id === currentUser._id ||
                        msg.sender === currentUser._id)
                    }
                  />
                </React.Fragment>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-[rgba(95,255,96,0.08)] bg-[rgba(8,10,8,0.7)] flex-shrink-0">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts…"
                className="flex-1 bg-[rgba(18,22,18,0.7)] border border-[rgba(95,255,96,0.12)] rounded-[3px] px-3 py-2.5 text-[0.7rem] text-[#e8ffe8] placeholder-[rgba(95,255,96,0.22)] focus:outline-none focus:border-[rgba(95,255,96,0.38)] focus:shadow-[0_0_0_2px_rgba(95,255,96,0.05)] transition-all [color-scheme:dark]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="font-[family-name:'JetBrains_Mono',monospace] inline-flex items-center gap-1.5 text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2.5 rounded-[3px] border cursor-pointer transition-all duration-150 bg-[#5fff60] border-[#5fff60] text-[#050905] font-bold hover:bg-[#7fff80] hover:shadow-[0_0_16px_rgba(95,255,96,0.28)] disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Send size={12} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInterface;
