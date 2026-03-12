"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/api";

type Message = {
    _id: string;
    senderId: {
        _id: string;
        name: string;
        photos?: string[];
    };
    text: string;
    createdAt: string;
};

export default function ChatModal({
    bookingId,
    currentUserId,
    onClose,
}: {
    bookingId: string;
    currentUserId: string;
    onClose: () => void;
}) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling every 5s
        return () => clearInterval(interval);
    }, [bookingId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        if (!token) return;
        try {
            const res = await fetch(`${API_URL}/api/bookings/${bookingId}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !token) return;

        setSending(true);
        try {
            const res = await fetch(`${API_URL}/api/bookings/${bookingId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: newMessage }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages((prev) => [...prev, data]);
                setNewMessage("");
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col h-[600px] max-h-full">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Messages</h3>
                        <p className="text-xs font-semibold text-emerald-600">Secure connect</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                                <Send className="w-8 h-8 text-emerald-200" />
                            </div>
                            <p className="text-gray-500 font-medium">No messages yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Start the conversation below!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId?._id === currentUserId;
                            return (
                                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : "items-start"}`}>
                                        <div className="flex items-end gap-2 mb-1">
                                            {!isMe && (
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 shrink-0 flex items-center justify-center text-[10px] font-bold text-emerald-700 overflow-hidden">
                                                    {msg.senderId?.photos?.length ? (
                                                        <img src={msg.senderId.photos[0]} className="w-full h-full object-cover" alt="avatar" />
                                                    ) : (
                                                        msg.senderId?.name?.charAt(0) || "U"
                                                    )}
                                                </div>
                                            )}
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl text-[15px] ${isMe
                                                    ? "bg-emerald-600 text-white rounded-br-sm"
                                                    : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400 font-medium px-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={sendMessage} className="flex items-end gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 fill-current" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
