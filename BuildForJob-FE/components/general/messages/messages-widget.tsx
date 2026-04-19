"use client";
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, UserRound, ArrowLeft } from 'lucide-react';
import { useMessaging } from '@/providers/messaging-provider';
import { useAppSelector } from '@/store/hooks';
import { formatDistanceToNow } from 'date-fns';

export function MessagesWidget() {
  const { user } = useAppSelector(s => s.auth);
  const { isWidgetOpen, setWidgetOpen, activeChatUser, setActiveChatUser, inbox, activeChatHistory, sendMessage, unreadTotal } = useMessaging();
  
  const [inputText, setInputText] = React.useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setWidgetOpen(!isWidgetOpen)}
        className="fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <MessageSquare size={24} />
        {unreadTotal > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#13131a]">
            {unreadTotal}
          </span>
        )}
      </button>

      {/* Messaging Panel */}
      <AnimatePresence>
        {isWidgetOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[350px] lg:w-[400px] h-[550px] max-h-[80vh] bg-white dark:bg-[#13131a] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-purple-600 text-white shrink-0">
              {activeChatUser ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveChatUser(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1">
                    <ArrowLeft size={18} />
                  </button>
                  <img src={activeChatUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${activeChatUser.firstName}`} alt="" className="w-8 h-8 rounded-full border border-white/30" />
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{activeChatUser.firstName} {activeChatUser.lastName}</h3>
                    {activeChatUser.jobTitle && <p className="text-[10px] opacity-80 leading-tight line-clamp-1">{activeChatUser.jobTitle}</p>}
                  </div>
                </div>
              ) : (
                <h3 className="font-bold flex items-center gap-2">
                  <MessageSquare size={18} /> Messages
                </h3>
              )}
              
              <button onClick={() => setWidgetOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0f0f13] relative">
              {!activeChatUser ? (
                // INBOX VIEW
                <div className="divide-y divide-gray-100 dark:divide-white/5">
                  {inbox.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500 mt-20">
                      <UserRound size={40} className="mb-3 opacity-20" />
                      <p className="text-sm">No messages yet.</p>
                      <p className="text-xs mt-1">Connect with founders or applicants to start chatting.</p>
                    </div>
                  ) : (
                    inbox.map((chat) => (
                      <button
                        key={chat.otherUser.id}
                        onClick={() => setActiveChatUser(chat.otherUser)}
                        className="w-full p-4 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left relative"
                      >
                        <img src={chat.otherUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${chat.otherUser.firstName}`} className="w-12 h-12 rounded-full mt-0.5 pointer-events-none" alt="" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between pointer-events-none">
                            <h4 className={`text-sm tracking-tight line-clamp-1 ${chat.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-800 dark:text-gray-200'}`}>
                              {chat.otherUser.firstName} {chat.otherUser.lastName}
                            </h4>
                            <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                              {formatDistanceToNow(new Date(chat.latestMessage.createdAt), { addSuffix: true }).replace('about ', '')}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 pointer-events-none ${chat.unreadCount > 0 ? 'font-medium text-gray-900 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                            {chat.latestMessage.senderId === user?.id ? 'You: ' : ''}{chat.latestMessage.content}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full shrink-0 mt-1 pointer-events-none"></div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // CHAT VIEW
                <div className="p-4 space-y-4">
                  {activeChatHistory.map((msg, i) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {msg.contextType && (
                          <span className="text-[10px] text-purple-500 font-bold mb-1 ml-1 tracking-wider uppercase">System • {msg.contextType}</span>
                        )}
                        <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] break-words ${
                          msg.contextType 
                           ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-100 border border-purple-500/30 font-medium'
                           : isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[9px] text-gray-400 mt-1 px-1">
                          {formatDistanceToNow(new Date(msg.createdAt))} ago
                        </span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input Footer */}
            {activeChatUser && (
              <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#13131a] shrink-0">
                <div className="flex items-center gap-2 relative">
                  <input
                    autoFocus
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-gray-50 dark:bg-[#0f0f13] border border-gray-200 dark:border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white"
                  />
                  <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-purple-600"
                  >
                    <Send size={14} className="ml-0.5" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
