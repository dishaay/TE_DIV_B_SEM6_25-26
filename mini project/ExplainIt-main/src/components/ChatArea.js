import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, ExternalLink, BookOpen, Video, X } from 'lucide-react';

function ChatArea({ selectedDoc, messages, setMessages, startQuiz }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const messagesEndRef = useRef(null);
  
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setResources(null);
    setShowResources(false);
  }, [selectedDoc]);

  // Lock body scroll when modal opens
  useEffect(() => {
    if (showResources) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showResources]);

  const handleQuery = async () => {
    if (!query.trim() || !selectedDoc) return;
    
    const userMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      let apiMessages;
      
      if (selectedDoc.imageData) {
        apiMessages = [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                imageData: selectedDoc.imageData,
                mimeType: selectedDoc.type
              },
              {
                type: 'text',
                text: `This is a document image. Please answer the following question based on what you can see in the image: ${query}`
              }
            ]
          }
        ];
      } else {
        apiMessages = [
          {
            role: 'user',
            content: `Based on the following document, please answer this question: ${query}\n\nDocument content:\n${selectedDoc.content}`
          }
        ];
      }

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessages,
          selectedDoc: selectedDoc
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const assistantMessage = {
        role: 'assistant',
        content: data.content
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getResources = async () => {
    if (!selectedDoc || !selectedDoc.content) return;
    
    setLoadingResources(true);
    try {
      const response = await fetch('http://localhost:5000/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: selectedDoc.content })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResources(data);
      setShowResources(true);
    } catch (error) {
      console.error('Error fetching resources:', error);
      alert(`Failed to get resources: ${error.message}\n\nMake sure Python server is running on port 5000!`);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  if (!selectedDoc) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <MessageSquare size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a document to start asking questions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{selectedDoc.name}</h2>
            <p className="text-sm text-gray-500">Ask questions about this document</p>
          </div>
          <div>
            <button
                onClick={startQuiz}
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                }}
  >
    Start Quiz
  </button>
          </div>
          <button
            onClick={getResources}
            disabled={loadingResources}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ 
              background: loadingResources ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <ExternalLink size={16} />
            {loadingResources ? 'Loading...' : 'Get Learning Resources'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                Start a conversation
              </h3>
              <p className="text-gray-500">
                Ask questions about your document and I'll help you understand it better
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                  style={{ 
                    border: msg.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : undefined
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg px-4 py-3 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                  <Loader2 size={20} className="animate-spin" style={{ color: '#667eea' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this document..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ border: '1px solid #d1d5db' }}
            disabled={loading}
          />
          <button
            onClick={handleQuery}
            disabled={!query.trim() || loading}
            className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ border: 'none', background: !query.trim() || loading ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Resources Modal - FIXED POSITION */}
      {showResources && resources && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999
          }}
          onClick={() => setShowResources(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header - Does NOT Scroll */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                  Learning Resources
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  Topic: <span style={{ fontWeight: '500', color: '#9333ea' }}>{resources.topic}</span>
                </p>
              </div>
              <button
                onClick={() => setShowResources(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content - ONLY THIS SCROLLS */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              {/* Articles Section */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BookOpen size={20} style={{ color: '#2563eb' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    Articles & Websites
                  </h4>
                </div>
                {resources.articles && resources.articles.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {resources.articles.map((article, idx) => (
                      <a
                        key={idx}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#60a5fa';
                          e.currentTarget.style.backgroundColor = '#eff6ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{
                            flexShrink: 0,
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#dbeafe',
                            color: '#2563eb',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {idx + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ 
                              fontWeight: '500', 
                              color: '#111827', 
                              marginBottom: '4px',
                              margin: 0
                            }}>
                              {article.title}
                            </p>
                            <p style={{ 
                              fontSize: '14px', 
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              margin: 0
                            }}>
                              {article.link}
                            </p>
                          </div>
                          <ExternalLink size={16} style={{ flexShrink: 0, color: '#9ca3af' }} />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>No articles found for this topic.</p>
                )}
              </div>

              {/* Videos Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Video size={20} style={{ color: '#dc2626' }} />
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                    YouTube Videos
                  </h4>
                </div>
                {resources.videos && resources.videos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {resources.videos.map((video, idx) => (
                      <a 
                        key={idx}
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#f87171';
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <span style={{
                            flexShrink: 0,
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {idx + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ 
                              fontWeight: '500', 
                              color: '#111827', 
                              marginBottom: '4px',
                              margin: 0
                            }}>
                              {video.title}
                            </p>
                            <p style={{ 
                              fontSize: '14px', 
                              color: '#6b7280',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              margin: 0
                            }}>
                              {video.link}
                            </p>
                          </div>
                          <ExternalLink size={16} style={{ flexShrink: 0, color: '#9ca3af' }} />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>No videos found for this topic.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatArea;