import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import { chatbotApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, ChatResponse } from '../types';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatbotButton: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Don't render the chatbot if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Use the conversation API to maintain history
      const chatRequest: ChatMessage = {
        message: messageText,
        context: 'SmartTravel chatbot conversation',
        language: 'en' // You can make this dynamic based on user preference
      };

      const response: ChatResponse = await chatbotApi.sendMessageWithHistory(chatRequest);

      if (response.isSuccessful) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);

        // Update suggested questions if provided
        if (response.suggestedQuestions) {
          setSuggestedQuestions(response.suggestedQuestions);
        }
      } else {
        throw new Error(response.errorMessage || 'Failed to get response from chatbot');
      }
    } catch (error: unknown) {
      console.error('Chatbot API error:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble connecting right now. Please try again later.';
      
      // Handle specific error cases
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 402) {
          errorMessage = 'AI-powered recommendations require a Premium subscription. Upgrade to unlock personalized travel advice!';
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'Please log in to use the chatbot feature.';
        } else if (axiosError.response?.status === 500) {
          errorMessage = 'Our chatbot service is temporarily unavailable. Please try again in a few moments.';
        }
      }

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && inputMessage.trim()) {
      sendMessage();
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="rounded-2xl shadow-2xl border border-gray-600/50 flex flex-col backdrop-blur-sm transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4"
          style={{ 
            position: 'fixed',
            bottom: '150px', 
            right: '24px', 
            width: '380px',
            height: '500px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div 
              className="p-4 flex items-center justify-between relative z-10"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #6366f1 100%)',
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">SmartTravel AI</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-xs text-blue-100">Online • Ready to help</p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 hover:scale-110 mr-2"
              >
                <X size={20} />
              </button>
            </div>
            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
            </div>
          </div>

          {/* Messages */}
          <div 
            className="overflow-y-auto p-4 space-y-4 custom-scrollbar" 
            style={{ 
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              height: 'calc(500px - 140px)', // Fixed height: total height minus header and input areas
              minHeight: '300px',
              maxHeight: 'calc(500px - 140px)'
            }}
          >
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 mt-16 animate-fade-in">
                <h4 className="text-lg font-semibold text-white mb-2">Welcome to SmartTravel AI!</h4>
                <p className="text-sm text-white leading-relaxed max-w-xs mx-auto">
                  I'm your personal travel assistant. Ask me about destinations, tour guides, bookings, or planning tips!
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['Plan my trip', 'Find tour guides', 'Best destinations'].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-3 py-1 text-xs bg-blue-600/20 text-blue-300 rounded-full border border-blue-500/30 hover:bg-blue-600/30 transition-all duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {!message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-xs p-4 rounded-2xl text-sm shadow-lg ${
                    message.isUser
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md transform hover:scale-105 transition-transform duration-200'
                      : 'bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-bl-md border border-gray-600/50'
                  }`}
                >
                  <p className="leading-relaxed">{message.text}</p>
                  <div className={`text-xs mt-2 opacity-60 ${message.isUser ? 'text-blue-100' : 'text-gray-300'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {message.isUser && (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center ml-3 flex-shrink-0 shadow-lg">
                    <MessageCircle size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0 shadow-lg">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl rounded-bl-md p-4 shadow-lg border border-gray-600/50">
                  <div className="flex space-x-2 items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span className="text-xs text-gray-300 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && !isLoading && (
              <div className="border-t border-gray-600/50 pt-4 animate-fade-in">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles size={16} className="text-white" />
                  <p className="text-xs text-gray-400 font-medium">Suggested questions:</p>
                </div>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(question)}
                      className="block text-left text-xs text-blue-300 hover:text-blue-200 p-3 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 w-full transition-all duration-200 border border-gray-600/30 hover:border-blue-500/30"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-600/50" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
                  disabled={isLoading}
                  className="w-full p-3 pr-12 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-800/50 text-white placeholder-black disabled:bg-gray-700/50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles size={16} className="text-gray-400" />
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
            {error && (
              <div className="mt-3 text-xs text-red-300 bg-red-900/30 p-3 rounded-xl border border-red-700/50 backdrop-blur-sm animate-fade-in">
                <div className="flex items-center space-x-2">
                  <X size={14} className="text-red-400" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="w-16 h-16 text-white rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 transform"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          border: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <div className="relative">
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
      </button>

      {/* Add custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ChatbotButton;