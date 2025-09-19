import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatbotApi } from '../services/api';
import type { ChatResponse, ChatHistoryItem } from '../types';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose, language = 'en' }) => {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationHistory = useCallback(async () => {
    try {
      const history = await chatbotApi.getHistory();
      setMessages(history.messages || []);
      setShowSuggestions(history.messages.length === 0);
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, []);

  const loadSuggestedQuestions = useCallback(async () => {
    try {
      const questions = await chatbotApi.getSuggestedQuestions(language);
      setSuggestedQuestions(questions);
    } catch (error) {
      console.error('Failed to load suggested questions:', error);
    }
  }, [language]);

  // Load conversation history and suggested questions when component mounts
  useEffect(() => {
    if (isOpen) {
      loadConversationHistory();
      loadSuggestedQuestions();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, loadConversationHistory, loadSuggestedQuestions]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatHistoryItem = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response: ChatResponse = await chatbotApi.sendMessageWithHistory({
        message,
        language
      });

      if (response.isSuccessful) {
        const assistantMessage: ChatHistoryItem = {
          role: 'assistant',
          content: response.response,
          timestamp: response.timestamp
        };
        setMessages(prev => [...prev, assistantMessage]);

        // Update suggested questions if provided
        if (response.suggestedQuestions && response.suggestedQuestions.length > 0) {
          setSuggestedQuestions(response.suggestedQuestions);
        }
      } else {
        // Handle error response
        const errorMessage: ChatHistoryItem = {
          role: 'assistant',
          content: response.errorMessage || 'No response received',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatHistoryItem = {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleSuggestedQuestionClick = (question: string) => {
    sendMessage(question);
  };

  const clearHistory = async () => {
    try {
      await chatbotApi.clearHistory();
      setMessages([]);
      setShowSuggestions(true);
      loadSuggestedQuestions();
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
            <h3 className="text-lg font-semibold">Travel Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearHistory}
              className="text-white hover:text-gray-200 p-1"
              title="Clear Conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && showSuggestions && (
            <div className="text-center text-gray-500">
              <p className="mb-4">Hello! I'm your travel assistant. How can I help you plan your trip to Vietnam?</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Typing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {showSuggestions && suggestedQuestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Try asking:</p>
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question)}
                  className="w-full text-left p-2 bg-blue-50 hover:bg-blue-100 rounded border text-blue-700 text-sm transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about Vietnam travel..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};