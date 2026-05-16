'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, User, Calendar, Trash2, Loader2, MessageSquare, Inbox, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setMessages(data);
    setLoading(false);
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) {
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex h-full gap-6 text-[#ededed]">
      {/* Messages List Sidebar */}
      <div className="w-1/3 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md flex flex-col overflow-hidden">
        <header className="p-4 border-b border-[#2e2e2e] flex items-center justify-between bg-[#202020]">
          <div className="flex items-center gap-2">
            <Inbox size={14} className="text-[#3ecf8e]" />
            <h1 className="text-[12px] font-bold uppercase tracking-widest text-[#ededed]">Inbox</h1>
          </div>
          <span className="text-[10px] bg-[#2e2e2e] px-2 py-0.5 rounded-full text-[#707070]">{messages.length}</span>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#707070]/30">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-[10px] uppercase tracking-widest font-bold">Loading...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#707070]/30">
              <MessageSquare size={32} />
              <p className="text-[10px] uppercase tracking-widest font-bold">No messages</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2e2e2e]">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={cn(
                    "w-full text-left p-4 transition-all hover:bg-[#252525] group",
                    selectedMessage?.id === message.id ? "bg-[#252525] border-l-2 border-l-[#3ecf8e]" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[13px] font-medium text-[#ededed] group-hover:text-[#3ecf8e] transition-colors">{message.name}</span>
                    <span className="text-[10px] text-[#707070]">{formatDate(message.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-[#707070] line-clamp-1">{message.email}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 bg-[#1c1c1c] border border-[#2e2e2e] rounded-md overflow-hidden flex flex-col">
        {selectedMessage ? (
          <>
            <header className="p-6 border-b border-[#2e2e2e] bg-[#202020]">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-medium text-[#ededed]">{selectedMessage.name}</h2>
                  <div className="flex items-center gap-3 text-[12px] text-[#707070]">
                    <span className="flex items-center gap-1.5"><Mail size={12} /> {selectedMessage.email}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(selectedMessage.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-[#707070] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </header>
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-none text-[14px] text-[#ededed] leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#707070]/30 space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#2e2e2e] flex items-center justify-center">
              <Mail size={24} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest">Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
}
