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
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        zIndex: 1050,
        padding: '1rem'
      }}
    >
      <div 
        className="bg-white rounded shadow-lg w-100 d-flex flex-column"
        style={{ maxWidth: '28rem', height: '600px' }}
      >
        {/* Header */}
        <div 
          className="d-flex align-items-center justify-content-between p-3 border-bottom text-white rounded-top"
          style={{ backgroundColor: '#0d6efd' }}
        >
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle me-2"
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: '#28a745' 
              }}
            ></div>
            <h5 className="mb-0 fw-semibold">Travel Assistant</h5>
          </div>
          <div className="d-flex align-items-center"
               style={{ gap: '0.5rem' }}>
            <button
              onClick={clearHistory}
              className="btn btn-link text-white p-1"
              title="Clear Conversation"
              style={{ border: 'none', fontSize: '1rem' }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="btn btn-link text-white p-1"
              style={{ border: 'none', fontSize: '1rem' }}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-fill overflow-auto p-3" style={{ gap: '1rem' }}>
          {messages.length === 0 && showSuggestions && (
            <div className="text-center text-muted">
              <p className="mb-3">Hello! I'm your travel assistant. How can I help you plan your trip to Vietnam?</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className="p-3 rounded"
                style={{
                  maxWidth: '80%',
                  backgroundColor: message.role === 'user' ? '#0d6efd' : '#f8f9fa',
                  color: message.role === 'user' ? 'white' : '#212529',
                  borderBottomRightRadius: message.role === 'user' ? '4px' : '1rem',
                  borderBottomLeftRadius: message.role === 'user' ? '1rem' : '4px'
                }}
              >
                <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                <p 
                  className="mb-0" 
                  style={{ 
                    fontSize: '0.75rem',
                    opacity: 0.7,
                    color: message.role === 'user' ? '#cce7ff' : '#6c757d'
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="d-flex justify-content-start mb-3">
              <div 
                className="p-3 rounded"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderBottomLeftRadius: '4px'
                }}
              >
                <div className="d-flex align-items-center">
                  <div 
                    className="spinner-border spinner-border-sm me-2"
                    style={{ width: '1rem', height: '1rem', color: '#0d6efd' }}
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="small text-muted">Typing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {showSuggestions && suggestedQuestions.length > 0 && (
            <div className="mb-3">
              <p className="small text-muted fw-medium mb-2">Try asking:</p>
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question)}
                  className="btn btn-outline-primary btn-sm w-100 text-start mb-2"
                  style={{ fontSize: '0.8rem' }}
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-top p-3">
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about Vietnam travel..."
                className="form-control"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="btn btn-primary"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};