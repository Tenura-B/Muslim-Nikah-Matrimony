'use client';

import { useEffect, useState, useRef } from 'react';
import { profileApi, chatApi } from '@/services/api';

export default function ChatPage() {
  const [myProfiles, setMyProfiles] = useState<any[]>([]);
  const [selectedMyProfile, setSelectedMyProfile] = useState<string>('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const [startId, setStartId] = useState<string | null>(null);
  const [startName, setStartName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      setStartId(p.get('start'));
      setStartName(p.get('name'));
    }
  }, []);

  useEffect(() => {
    profileApi.getMyProfiles().then((r) => {
      const active = (r.data ?? []).filter((p: any) => p.status === 'ACTIVE');
      setMyProfiles(active);
      if (active[0]) setSelectedMyProfile(active[0].id);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedMyProfile) return;
    chatApi.conversations(selectedMyProfile).then((r) => {
      const all = [
        ...(r.data?.sent ?? []).map((m: any) => ({ id: m.receiverProfileId, name: m.receiverProfile?.name ?? 'Unknown' })),
        ...(r.data?.received ?? []).map((m: any) => ({ id: m.senderProfileId, name: m.senderProfile?.name ?? 'Unknown' })),
      ];
      if (startId && startName) {
        all.unshift({ id: startId, name: startName });
      }
      // deduplicate
      const seen = new Set();
      setConversations(all.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }));
      if (startId) setSelectedChat(startId);
    });
  }, [selectedMyProfile, startId, startName]);

  useEffect(() => {
    if (!selectedMyProfile || !selectedChat) return;
    
    const fetchHistory = () => {
      chatApi.history(selectedMyProfile, selectedChat).then((r) => {
        setMessages((prev) => {
          if (prev.length !== (r.data?.length || 0)) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
          }
          return r.data ?? [];
        });
      });
    };

    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, [selectedChat, selectedMyProfile]);

  const send = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    try {
      await chatApi.send({ senderProfileId: selectedMyProfile, receiverProfileId: selectedChat, content: newMsg.trim() });
      setNewMsg('');
      const r = await chatApi.history(selectedMyProfile, selectedChat);
      setMessages(r.data ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  if (myProfiles.length === 0) {
    return (
      <div className="font-poppins text-center py-20 text-gray-400">
        <p className="text-4xl mb-3">💬</p>
        <p className="font-medium">No active profiles</p>
        <p className="text-sm mt-1">You need an active profile to use chat</p>
      </div>
    );
  }

  return (
    <div className="font-poppins">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-500 text-sm mt-0.5">Chat with matches. Contact info is shared when both agree — otherwise chat is always available.</p>
      </div>

      {/* Profile selector */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 block mb-1">Chatting as:</label>
        <select value={selectedMyProfile} onChange={(e) => setSelectedMyProfile(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 outline-none">
          {myProfiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex h-[500px] overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <p>No conversations yet</p>
                <p className="text-xs mt-1">Browse profiles to start chatting</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button key={c.id} onClick={() => setSelectedChat(c.id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition border-b border-gray-50 ${selectedChat === c.id ? 'bg-green-50' : ''}`}>
                  <div className="w-9 h-9 bg-[#1B6B4A]/10 rounded-full flex items-center justify-center text-[#1B6B4A] font-semibold text-sm shrink-0">
                    {c.name[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!selectedChat ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <p className="text-3xl mb-2">💬</p>
                <p>Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-semibold text-gray-700">
                  {conversations.find((c) => c.id === selectedChat)?.name ?? 'Chat'}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map((m) => {
                  const isMine = m.senderProfileId === selectedMyProfile;
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-[#1B6B4A] text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                        {m.content}
                        <p className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1B6B4A]/15 focus:border-[#1B6B4A] outline-none" />
                <button onClick={send} disabled={sending || !newMsg.trim()}
                  className="bg-[#1B6B4A] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#155a3d] transition disabled:opacity-50">
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
