import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { MarkdownRenderer } from '../utils/markdownRenderer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Good evening. I am VOYA, your luxury travel concierge. How may I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-concierge`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an issue. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#111009] border border-[rgba(201,169,110,0.4)] flex items-center justify-center hover:border-[rgba(201,169,110,0.6)] transition-all duration-300 shadow-lg z-[1000]"
        style={{ fontFamily: 'Cormorant Garamond' }}
      >
        <span className="text-[#C9A96E] text-[22px]">✦</span>
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[360px] h-[520px] bg-[#111009] border border-[rgba(201,169,110,0.2)] rounded-2xl shadow-2xl flex flex-col z-[1000]">
          <div className="bg-[#0C0A07] rounded-t-2xl px-5 py-4 flex items-center justify-between border-b border-[rgba(201,169,110,0.1)]">
            <h3 className="text-[#C9A96E] text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ fontFamily: 'Montserrat' }}>
              VOYA CONCIERGE
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#C9A96E] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[rgba(201,169,110,0.15)] text-white border border-[rgba(201,169,110,0.3)] px-4 py-3'
                      : 'bg-[#0C0A07] text-[#E5E5E5] border border-[rgba(201,169,110,0.1)] px-[18px] py-4'
                  }`}
                  style={{ fontFamily: 'Cormorant Garamond', fontSize: '15px', lineHeight: '1.7' }}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#0C0A07] px-4 py-3 rounded-lg border border-[rgba(201,169,110,0.1)]">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[#C9A96E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-[rgba(201,169,110,0.1)]">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your travel plans..."
                className="flex-1 bg-[#0C0A07] text-white px-4 py-2 rounded-lg border border-[rgba(201,169,110,0.2)] focus:outline-none focus:border-[rgba(201,169,110,0.4)] transition-colors"
                style={{ fontFamily: 'Cormorant Garamond', fontSize: '15px' }}
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 rounded-lg bg-[#C9A96E] text-[#0C0A07] flex items-center justify-center hover:bg-[#D4B574] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
