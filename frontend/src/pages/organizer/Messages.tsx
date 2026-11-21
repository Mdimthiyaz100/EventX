import { useState } from "react";
import { Search, Send, CheckCheck } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "customer" | "organizer";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  customerName: string;
  listingTitle: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export default function Messages() {
  const [conversations] = useState<Conversation[]>([
    {
      id: "c1",
      customerName: "Karthik Raja",
      listingTitle: "Smash Sports Arena",
      lastMessage: "Is turf football boot allowed on ground A?",
      time: "10:14 AM",
      unread: 2,
    },
    {
      id: "c2",
      customerName: "Vimal Kumar",
      listingTitle: "Gully Cricket Club",
      lastMessage: "Confirmed my slot for tomorrow evening.",
      time: "Yesterday",
      unread: 1,
    },
    {
      id: "c3",
      customerName: "Sneha Reddy",
      listingTitle: "Chennai Music Fest",
      lastMessage: "What is the entry gate for Fan Pit?",
      time: "2 days ago",
      unread: 1,
    },
  ]);

  const [activeId, setActiveId] = useState<string>("c1");
  const [inputText, setInputText] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: "m1",
      sender: "customer",
      text: "Hi, I booked Turf A for 7 PM today. Are studs or football boots allowed on the artificial turf?",
      time: "10:12 AM",
    },
    {
      id: "m2",
      sender: "organizer",
      text: "Hello Karthik! Artificial turf studs and rubber sneakers are completely allowed. Metal studs are strictly prohibited to prevent turf wear.",
      time: "10:13 AM",
    },
    {
      id: "m3",
      sender: "customer",
      text: "Perfect! Thanks for the prompt reply. See you guys at 7.",
      time: "10:14 AM",
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "organizer",
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatHistory([...chatHistory, newMsg]);
    setInputText("");
  };

  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
          Customer Inquiries & Messages
        </h1>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          Direct messaging with customers regarding slot bookings, venue queries, and ticketing assistance.
        </p>
      </div>

      {/* Main Messaging Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 rounded-2xl border border-[#292929] bg-[#141414] min-h-[560px] overflow-hidden">
        {/* Left: Conversation List */}
        <div className="md:col-span-4 border-r border-[#292929] flex flex-col">
          <div className="p-4 border-b border-[#292929]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-[#292929] bg-[#1A1A1A] py-2 pl-9 pr-3 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
              />
            </div>
          </div>

          <div className="divide-y divide-[#1F1F1F] overflow-y-auto flex-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full p-4 text-left transition flex items-start justify-between gap-2 ${
                  activeId === c.id ? "bg-[#1A1A1A]" : "hover:bg-[#1A1A1A]/40"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[#F51D2B]/10 text-[#F51D2B] font-bold text-xs">
                    {c.customerName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{c.customerName}</p>
                    <p className="text-[10px] text-[#F51D2B] truncate">{c.listingTitle}</p>
                    <p className="text-[11px] text-[#777777] truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className="text-[10px] text-[#777777]">{c.time}</span>
                  {c.unread > 0 && (
                    <span className="grid size-4 place-items-center rounded-full bg-[#F51D2B] text-[9px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className="md:col-span-8 flex flex-col justify-between">
          {/* Chat Header */}
          <div className="flex items-center justify-between border-b border-[#292929] p-4 bg-[#141414]">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-[#F51D2B] font-bold text-xs text-white">
                {activeConv?.customerName.charAt(0) || "C"}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{activeConv?.customerName}</p>
                <p className="text-[10px] text-[#A1A1AA]">{activeConv?.listingTitle}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              Online
            </span>
          </div>

          {/* Messages Feed */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[380px]">
            {chatHistory.map((msg) => {
              const isMe = msg.sender === "organizer";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                      isMe
                        ? "bg-[#F51D2B] text-white rounded-br-none"
                        : "bg-[#1A1A1A] text-white border border-[#292929] rounded-bl-none"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                        isMe ? "text-white/70" : "text-[#777777]"
                      }`}
                    >
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck size={11} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <div className="border-t border-[#292929] p-3 flex items-center gap-2 bg-[#141414]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message to customer..."
              className="flex-1 rounded-xl border border-[#292929] bg-[#1A1A1A] px-4 py-2 text-xs text-white placeholder-[#777777] outline-none focus:border-[#F51D2B]"
            />
            <button
              onClick={handleSend}
              className="grid size-9 place-items-center rounded-xl bg-[#F51D2B] text-white hover:bg-[#ff2b39] transition"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
