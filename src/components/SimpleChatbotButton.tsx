import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Card, Button, Form, InputGroup } from 'react-bootstrap';
import { chatbotApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ChatMessage, ChatResponse } from '../types';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const SimpleChatbotButton: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      const chatRequest: ChatMessage = {
        message: messageText,
        context: 'SmartTravel chatbot conversation',
        language: 'en'
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
      } else {
        throw new Error(response.errorMessage || 'Failed to get response from chatbot');
      }
    } catch (error: unknown) {
      console.error('Chatbot API error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ position: 'relative', zIndex: 9999 }}>
      {/* Chat Panel */}
      {isOpen && (
        <Card 
          className="position-fixed"
          style={{ 
            bottom: '100px', 
            right: '24px', 
            width: '350px',
            height: '450px',
            zIndex: 9999,
            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Header */}
          <Card.Header 
            className="d-flex align-items-center justify-content-between bg-primary text-white"
            style={{ borderRadius: 'var(--bs-border-radius) var(--bs-border-radius) 0 0' }}
          >
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center me-2"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <Bot size={16} color="white" />
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">SmartTravel AI</h6>
                <small className="text-white-50">Online</small>
              </div>
            </div>
            <Button
              variant="link"
              onClick={toggleChat}
              className="text-white p-1"
              style={{ border: 'none' }}
            >
              <X size={18} />
            </Button>
          </Card.Header>

          {/* Messages */}
          <Card.Body 
            className="overflow-auto p-3" 
            style={{ 
              height: 'calc(450px - 140px)',
              backgroundColor: '#f8f9fa'
            }}
          >
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted mt-4">
                <h6 className="mb-2">Welcome to SmartTravel AI!</h6>
                <p className="small mb-0">
                  Ask me about destinations, tours, or travel planning!
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex mb-3 ${message.isUser ? 'justify-content-end' : 'justify-content-start'}`}
              >
                {!message.isUser && (
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#0d6efd'
                    }}
                  >
                    <Bot size={16} color="white" />
                  </div>
                )}
                <div
                  className="p-2 rounded"
                  style={{
                    maxWidth: '75%',
                    backgroundColor: message.isUser ? '#0d6efd' : '#e9ecef',
                    color: message.isUser ? 'white' : '#212529',
                    fontSize: '0.9rem'
                  }}
                >
                  <p className="mb-1">{message.text}</p>
                  <div 
                    className="text-end"
                    style={{ 
                      fontSize: '0.7rem',
                      opacity: 0.7
                    }}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="d-flex justify-content-start mb-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#0d6efd'
                  }}
                >
                  <Bot size={16} color="white" />
                </div>
                <div className="p-2 rounded bg-light">
                  <div className="d-flex align-items-center">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small className="text-muted">AI is typing...</small>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </Card.Body>

          {/* Input */}
          <Card.Footer className="p-3">
            <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <InputGroup>
                <Form.Control
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isLoading ? "AI is typing..." : "Type your message..."}
                  disabled={isLoading}
                  size="sm"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                >
                  <Send size={16} />
                </Button>
              </InputGroup>
              {error && (
                <div className="text-danger small mt-2">
                  {error}
                </div>
              )}
            </Form>
          </Card.Footer>
        </Card>
      )}

      {/* Chat Button */}
      <Button
        onClick={toggleChat}
        className="position-fixed rounded-circle p-0 d-flex align-items-center justify-content-center"
        style={{
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          zIndex: 9999,
          backgroundColor: '#0d6efd',
          borderColor: '#0d6efd',
          boxShadow: '0 0.5rem 1rem rgba(13, 110, 253, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
    </div>
  );
};

export default SimpleChatbotButton;