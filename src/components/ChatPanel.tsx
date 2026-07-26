import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, FileText, User, Volume2, RefreshCw } from 'lucide-react';
import { PdfDocument, ChatMessage, Language } from '../types/pdf';
import { chatWithPdf } from '../services/geminiService';
import { speechService, startVoiceRecognition } from '../services/speechService';

interface ChatPanelProps {
  pdf: PdfDocument | null;
  selectedLanguage: Language;
  onOpenApiKeyModal: () => void;
}

const QUICK_PROMPTS = [
  'Summarize key points',
  'What are the main findings?',
  'List risks and challenges',
  'Explain main conclusion',
];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  pdf,
  selectedLanguage,
  onOpenApiKeyModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognitionRef, setRecognitionRef] = useState<{ stop: () => void } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputText;
    if (!textToSend.trim() || !pdf || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInputText('');
    setLoading(true);

    try {
      const answer = await chatWithPdf(pdf.base64, messages, textToSend, selectedLanguage.code);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Notice: ${err?.message || 'Failed to generate response.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening && recognitionRef) {
      recognitionRef.stop();
      setIsListening(false);
      setRecognitionRef(null);
      return;
    }

    setIsListening(true);
    const rec = startVoiceRecognition(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
        setRecognitionRef(null);
      },
      (error) => {
        console.error('Voice dictation error:', error);
        setIsListening(false);
        setRecognitionRef(null);
      },
      selectedLanguage.code
    );

    if (rec) {
      setRecognitionRef(rec);
    } else {
      setIsListening(false);
    }
  };

  const handleSpeakMessage = (text: string) => {
    speechService.speak(text, selectedLanguage.code);
  };

  if (!pdf) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <p>Load a PDF document to ask questions.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '12px' }}>
      {/* Quick Prompts */}
      <div>
        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
          DOCUMENT SUGGESTIONS
        </span>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#334155',
                borderRadius: '4px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingRight: '4px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            color: '#64748b',
            maxWidth: '300px',
          }}>
            <FileText size={32} color="#475569" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#0f172a', marginBottom: '4px', fontSize: '0.95rem' }}>Ask Questions About Document</h4>
            <p style={{ fontSize: '0.82rem' }}>
              Type your query below or tap the microphone to dictate your question.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                {!isUser && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    background: '#1e293b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <FileText size={14} />
                  </div>
                )}

                <div
                  style={{
                    background: isUser ? '#1e293b' : '#ffffff',
                    border: isUser ? 'none' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: isUser ? '#ffffff' : '#0f172a',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                    fontSize: '0.7rem',
                    color: isUser ? 'rgba(255, 255, 255, 0.7)' : '#64748b',
                  }}>
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <button
                        onClick={() => handleSpeakMessage(msg.text)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: 0,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      >
                        <Volume2 size={12} /> Listen
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    background: '#e2e8f0',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <User size={14} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: '#1e293b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={14} />
            </div>
            <div style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#475569',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching document...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Controls */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* Voice Dictation Button */}
        <button
          onClick={handleToggleVoiceInput}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '6px',
            background: isListening ? '#fef2f2' : '#ffffff',
            border: isListening ? '1px solid #fca5a5' : '1px solid #cbd5e1',
            color: isListening ? '#dc2626' : '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isListening ? 'Stop voice recording' : 'Dictate question'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? 'Listening...' : `Ask a question in ${selectedLanguage.name}...`}
          style={{
            flex: 1,
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#0f172a',
            fontFamily: 'inherit',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />

        {/* Send Button */}
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || loading}
          className="btn-primary"
          style={{
            padding: '8px 14px',
            opacity: !inputText.trim() || loading ? 0.5 : 1,
            cursor: !inputText.trim() || loading ? 'not-allowed' : 'pointer',
          }}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
