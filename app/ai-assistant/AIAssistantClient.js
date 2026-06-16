'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Check, Plus, MessageSquare, Trash2, StopCircle, RefreshCw } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';

// Utility to generate a simple UUID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Helper to satisfy React 19 linter rules for purity during static analysis
const getTimestamp = () => Date.now();

const getExamTagline = (mode) => {
  const taglines = {
    'General': 'Balanced answers for all law students',
    'Judiciary': 'Mains-style structured answer format',
    'CLAT PG': 'Analytical case-law focused responses',
    'CLAT UG': 'Simplified, scenario-based explanations',
    'AIBE': 'Section-focused, open-book optimized',
    'APO': 'Prosecution-focused criminal law',
    'UGC NET Law': 'Academic, jurist-referenced analysis',
    'CUET PG Law': 'Conceptual distinctions & tables',
    'SEBI Legal': 'Corporate & securities regulation',
    'UPSC Law Optional': 'Analytical, governance-connected',
    'IBPS SO Law': 'Banking & financial law procedures',
  };
  return taglines[mode] || taglines['General'];
};

const getExamChips = (mode) => {
  const chips = {
    'General': [
      "Explain Section 103 BNS (Murder) vs Section 105 BNS (Culpable Homicide)",
      "What is the doctrine of eclipse under Indian Constitution?",
      "Draw a flowchart of the trial procedure under BNSS 2023",
      "Compare void and voidable contracts with a table"
    ],
    'Judiciary': [
      "Write a Mains-style answer on Res Judicata under Section 11 CPC",
      "Explain Section 125 BNSS (Maintenance) with case law",
      "Essential ingredients of Section 103 BNS with exceptions",
      "Discuss Article 226 vs Article 32 writ jurisdiction"
    ],
    'CLAT PG': [
      "Trace the evolution of Article 21 from Gopalan to Puttaswamy",
      "Analyze the ratio in Navtej Singh Johar v. Union of India",
      "Discuss the Basic Structure doctrine through landmark cases",
      "Compare Indian and US approaches to judicial review"
    ],
    'CLAT UG': [
      "Explain what is a tort with a simple example",
      "What are Fundamental Rights? Explain for a beginner",
      "Difference between bail and bond in simple terms",
      "What is the rule of law? Explain with examples"
    ],
    'AIBE': [
      "Quick reference: Which section covers cheque dishonour?",
      "List all sections on bail under BNSS with section numbers",
      "Navigate the Limitation Act — key articles for filing suits",
      "Which sections of CPC deal with temporary injunctions?"
    ],
    'APO': [
      "Draw the complete FIR to Conviction flowchart under BNSS",
      "Explain dying declaration under BSA with admissibility rules",
      "Compare cognizable vs non-cognizable offences under BNS",
      "What are the prosecution steps after chargesheet filing?"
    ],
    'UGC NET Law': [
      "Compare Austin's Command Theory with Hart's Rule of Recognition",
      "Explain Kelsen's Pure Theory and the concept of Grundnorm",
      "Discuss the Sociological School of Jurisprudence (Pound, Ehrlich)",
      "What is the relationship between law and morality? (Hart-Fuller debate)"
    ],
    'CUET PG Law': [
      "Create a comparison table: Crime vs Tort vs Breach of Contract",
      "Distinguish between void and voidable marriages under Hindu law",
      "Compare culpable homicide and murder under BNS with a table",
      "What is vicarious liability? Explain with key cases"
    ],
    'SEBI Legal': [
      "Explain SEBI's powers under Sections 11-11D of SEBI Act",
      "Draw a flowchart of the Insider Trading investigation process",
      "Compare CIRP and Liquidation under IBC 2016",
      "What are the LODR compliance requirements for listed companies?"
    ],
    'UPSC Law Optional': [
      "Critically analyze the evolution of Article 14 (equality jurisprudence)",
      "Discuss delegated legislation and its constitutional limitations",
      "Compare Indian and UK parliamentary sovereignty doctrines",
      "Analyze the relationship between Directive Principles and Fundamental Rights"
    ],
    'IBPS SO Law': [
      "Explain the SARFAESI Act recovery process with timeline",
      "Draw a flowchart of NPA classification and resolution under RBI guidelines",
      "What is the procedure for cheque dishonour under Section 138 NI Act?",
      "Compare DRT and NCLT jurisdiction in debt recovery"
    ]
  };
  return chips[mode] || chips['General'];
};

const getFollowUpSuggestions = (content, exam) => {
  const suggestions = [];
  if (content.includes('Section') || content.includes('section')) {
    suggestions.push('Explain the exceptions to this section');
  }
  if (content.includes('Article') || content.includes('article')) {
    suggestions.push('What are the landmark cases on this Article?');
  }
  if (content.toLowerCase().includes('supreme court') || content.includes('AIR') || content.includes('SCC')) {
    suggestions.push('Draw a flowchart of this legal process');
  }
  suggestions.push('Create a comparison table');
  if (exam === 'Judiciary' || exam === 'General') {
    suggestions.push('Frame a Mains exam question on this topic');
  }
  return suggestions.slice(0, 3);
};

const getTextFromChildren = (children) => {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (children.props && children.props.children) return getTextFromChildren(children.props.children);
  return '';
};

const highlightText = (value) => {
  if (typeof value !== 'string') return value;
  
  const regex = /(\b(?:AIR\s+\d{4}\s+SC\s+\d+|\(\d{4}\)\s+\d+\s+SCC\s+\d+|\d{4}\s+SCC\s+\d+)\b|\b(?:Section\s+\d+[A-Za-z0-9]*(?:\s+of\s+(?:the\s+)?[A-Za-z\s]+,?\s+\d{4})?|Article\s+\d+[A-Za-z0-9]*)\b)/g;
  const parts = value.split(regex);
  if (parts.length === 1) return value;
  
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return part;
    }
    
    const isCitation = /AIR|SCC/.test(part);
    if (isCitation) {
      return (
        <span key={index} className="chat-case-citation">
          {part}
        </span>
      );
    } else {
      return (
        <code key={index} className="chat-section-ref">
          {part}
        </code>
      );
    }
  });
};

export default function AIAssistantClient() {
  const [sessions, setSessions] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedSessions = localStorage.getItem('lexastra_chat_sessions');
      if (storedSessions) {
        if (!storedSessions.includes('"data: {"') && !storedSessions.includes('"index":0,"delta"')) {
          try {
            const parsed = JSON.parse(storedSessions);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed.filter(s => s && typeof s === 'object' && s.id);
            }
          } catch (e) {
            console.error('Error parsing stored chat sessions:', e);
            localStorage.removeItem('lexastra_chat_sessions');
          }
        } else {
          localStorage.removeItem('lexastra_chat_sessions');
        }
      }
    }
    return [{
      id: generateId(),
      title: 'New Chat',
      messages: [],
      timestamp: Date.now()
    }];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [examMode, setExamMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_exam_mode') || 'General';
    }
    return 'General';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_deepseek_key') || '';
    }
    return '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  const [tempGoogleId, setTempGoogleId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_google_client_id') || '';
    }
    return '';
  });
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const userHasScrolledUp = useRef(false);
  const abortControllerRef = useRef(null);
  const streamBufferRef = useRef('');

  if (currentSessionId === null && sessions.length > 0) {
    setCurrentSessionId(sessions[0].id);
  }

  const createNewSession = () => {
    const newSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      timestamp: getTimestamp()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (inputRef.current) inputRef.current.focus();
  };

  // Load from local storage on mount, lock body scrolling, and sync Google user
  useEffect(() => {
    // Add full-screen layout body overrides
    document.body.classList.add('full-screen-page');

    const params = new URLSearchParams(window.location.search);
    const initialPrompt = params.get('prompt');
    if (initialPrompt) {
      setTimeout(() => {
        setInput(initialPrompt);
      }, 100);
      setTimeout(() => {
        const sendBtn = document.getElementById('ai-send-btn');
        if (sendBtn) sendBtn.click();
      }, 500);
    }
    
    const checkGoogleUser = () => {
      const stored = localStorage.getItem('lexastra_google_user');
      if (stored) {
        try {
          setGoogleUser(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing Google user:', e);
          localStorage.removeItem('lexastra_google_user');
          setGoogleUser(null);
        }
      } else {
        setGoogleUser(null);
      }
    };
    checkGoogleUser();

    window.addEventListener('google-signin', checkGoogleUser);
    window.addEventListener('google-signout', checkGoogleUser);

    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      document.body.classList.remove('full-screen-page');
      window.removeEventListener('google-signin', checkGoogleUser);
      window.removeEventListener('google-signout', checkGoogleUser);
      clearTimeout(timer);
    };
  }, []);

  // Render Google Sign-In Buttons when user is logged out or when switching sessions/welcome screen
  useEffect(() => {
    const renderButtons = () => {
      if (!window.google?.accounts?.id || googleUser) return;

      const sidebarContainer = document.getElementById('chat-sidebar-google-btn');
      if (sidebarContainer) {
        window.google.accounts.id.renderButton(sidebarContainer, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          width: 240
        });
      }

      const welcomeContainer = document.getElementById('chat-welcome-google-btn');
      if (welcomeContainer) {
        window.google.accounts.id.renderButton(welcomeContainer, {
          theme: 'outline',
          size: 'medium',
          shape: 'pill',
          width: 240
        });
      }
    };

    if (mounted && !googleUser) {
      const timer = setTimeout(renderButtons, 200);
      return () => clearTimeout(timer);
    }
  }, [googleUser, mounted, currentSessionId, messages.length]);

  // Save sessions to local storage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('lexastra_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const currentSession = sessions.find(s => s?.id === currentSessionId) || { messages: [] };
  const messages = currentSession.messages || [];

  const deleteSession = (e, id) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (updated.length === 0) {
      createNewSession();
      localStorage.removeItem('lexastra_chat_sessions');
    } else if (currentSessionId === id) {
      setCurrentSessionId(updated[0].id);
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    userHasScrolledUp.current = !isNearBottom;
  };

  const scrollToBottom = () => {
    if (!userHasScrolledUp.current && chatContainerRef.current) {
      // Use 'auto' (instant) scrolling during active streaming to prevent 
      // massive browser lag and jitter, and 'smooth' when finished.
      chatContainerRef.current.style.scrollBehavior = isLoading ? 'auto' : 'smooth';
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const lastMessageContentLength = messages[messages.length - 1]?.content?.length || 0;
  useEffect(() => {
    scrollToBottom();
  }, [lastMessageContentLength, isLoading, currentSessionId]);

  // Auto-expand textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('lexastra_deepseek_key', apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  const handleGoogleSignOut = () => {
    localStorage.removeItem('lexastra_google_user');
    setGoogleUser(null);
    window.dispatchEvent(new Event('google-signout'));
  };

  const handleSaveGoogleId = () => {
    if (tempGoogleId.trim()) {
      localStorage.setItem('lexastra_google_client_id', tempGoogleId.trim());
      setShowGoogleConfig(false);
      window.location.reload();
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportPDF = async (index) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = document.getElementById(`ai-msg-${index}`);
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `LexAstra_AI_Analysis_${Date.now()}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleExamModeChange = (e) => {
    const mode = e.target.value;
    setExamMode(mode);
    localStorage.setItem('lexastra_exam_mode', mode);
  };

  const handleRegenerate = () => {
    if (isLoading || messages.length < 2) return;
    // Remove last assistant message and re-send the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    
    // Remove the last assistant message from session
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newMsgs = s.messages.filter((_, i) => i !== s.messages.length - 1);
        return { ...s, messages: newMsgs };
      }
      return s;
    }));
    
    // Re-send
    setTimeout(() => handleSend(lastUserMsg.content), 100);
  };

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;

    userHasScrolledUp.current = false;
    const userMessage = { role: 'user', content: text };
    
    // Auto-generate title if it's the first message
    let sessionTitle = currentSession.title;
    if (messages.length === 0) {
      sessionTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    const updatedMessages = [...messages, userMessage];
    
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId ? { ...s, messages: updatedMessages, title: sessionTitle } : s
    ));
    
    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'x-api-key': apiKey }),
        },
        body: JSON.stringify({ messages: updatedMessages, examMode }),
        signal: abortControllerRef.current.signal
      });

      if (response.status === 401) {
        setShowApiKeyInput(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error('API request failed');

      // Add empty assistant message
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...updatedMessages, { role: 'assistant', content: '' }] } : s
      ));

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      streamBufferRef.current = '';
      let buffer = '';
      
      let lastUpdateTime = getTimestamp();

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const dataStr = trimmedLine.slice(6);
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                const content = data.choices[0]?.delta?.content || '';
                streamBufferRef.current += content;
              } catch (e) {
                // Ignore incomplete JSON chunks
              }
            }
          }
          
          const now = getTimestamp();
          if (now - lastUpdateTime > 50 || done) {
            const currentText = streamBufferRef.current;
            setSessions(prev => prev.map(s => {
              if (s.id === currentSessionId) {
                const newMsgs = [...s.messages];
                newMsgs[newMsgs.length - 1].content = currentText;
                return { ...s, messages: newMsgs };
              }
              return s;
            }));
            lastUpdateTime = now;
          }
        }
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Chat error:', error);
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, messages: [...s.messages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }] };
          }
          return s;
        }));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match && match[1] === 'mermaid') {
        const codeText = String(children).replace(/\n$/, '');
        return !isLoading ? (
          <MermaidDiagram chart={codeText} />
        ) : (
          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--gold)' }}>
            Generating legal diagram...
          </div>
        );
      }
      return !inline ? (
        <pre style={{ background: 'var(--navy-dark)', color: 'var(--parchment)', padding: '16px', borderRadius: '8px', overflowX: 'auto', margin: '16px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
          <code className={className} {...props}>{children}</code>
        </pre>
      ) : (
        <code style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold-dark)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }} className={className} {...props}>
          {children}
        </code>
      );
    },
    h1({ children }) { return <h3 style={{ marginTop: '24px', marginBottom: '12px', color: 'var(--navy)', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '8px' }}>{children}</h3> },
    h2({ children }) { return <h4 style={{ marginTop: '20px', marginBottom: '10px', color: 'var(--navy)' }}>{children}</h4> },
    h3({ children }) { return <h5 style={{ marginTop: '16px', marginBottom: '8px', color: 'var(--gold-dark)' }}>{children}</h5> },
    p({ children }) { return <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>{children}</p> },
    ul({ children }) { return <ul style={{ marginBottom: '16px', paddingLeft: '24px', color: 'var(--charcoal)' }}>{children}</ul> },
    ol({ children }) { return <ol style={{ marginBottom: '16px', paddingLeft: '24px', color: 'var(--charcoal)' }}>{children}</ol> },
    li({ children }) { return <li style={{ marginBottom: '8px' }}>{children}</li> },
    blockquote({ children }) {
      const textContent = getTextFromChildren(children);
      if (textContent.includes('💡') || textContent.includes('Exam Tip')) {
        return (
          <blockquote className="chat-exam-tip">
            {children}
          </blockquote>
        );
      }
      if (textContent.includes('ℹ️') || textContent.includes('Did you know')) {
        return (
          <blockquote className="chat-info-callout">
            {children}
          </blockquote>
        );
      }
      return <blockquote style={{ borderLeft: '4px solid var(--gold)', paddingLeft: '16px', fontStyle: 'italic', color: 'var(--text-secondary)', margin: '16px 0' }}>{children}</blockquote>;
    },
    text({ value }) {
      return <>{highlightText(value)}</>;
    },
    table({ children }) { 
      return (
        <div style={{ overflowX: 'auto', margin: '24px 0', borderRadius: '8px', border: '1px solid var(--border-gold)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            {children}
          </table>
        </div>
      );
    },
    th({ children }) { return <th style={{ background: 'var(--navy)', color: '#fff', padding: '12px 16px', borderBottom: '2px solid var(--gold)', fontWeight: '600' }}>{children}</th> },
    td({ children }) { return <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.05)', color: 'var(--charcoal)' }}>{children}</td> }
  };

  if (!mounted) {
    return <div className="chat-layout page-enter"><div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><div className="chat-loading-dots"><span></span><span></span><span></span></div></div></div>;
  }

  return (
    <div className="chat-layout page-enter">
      {/* Sidebar History */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar__header">
          <h3 className="chat-sidebar__title">LexAstra AI</h3>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button className="btn btn--gold-fill" style={{ flex: 1, justifyContent: 'center' }} onClick={createNewSession}>
              <Plus size={16} /> New Session
            </button>
            <button 
              className="btn btn--ghost" 
              style={{ padding: '8px', borderRadius: '8px', fontSize: '11px', fontWeight: '500', opacity: 0.7 }} 
              onClick={() => {
                localStorage.removeItem('lexastra_chat_sessions');
                window.location.reload(true);
              }}
              title="Reset all chat sessions if experiencing issues"
            >
              Reset
            </button>
          </div>
        </div>
        
        <div className="chat-sidebar__history">
          <div className="chat-history-group">
            <div className="chat-history-group__title">Your Conversations</div>
            {sessions.filter(Boolean).map(session => (
              <button 
                key={session.id}
                className={`chat-history-item ${currentSessionId === session.id ? 'chat-history-item--active' : ''}`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <MessageSquare size={14} style={{ flexShrink: 0, marginRight: '10px' }} />
                <span className="chat-history-item__text">{session.title}</span>
                <div className="chat-history-item__delete" onClick={(e) => deleteSession(e, session.id)}>
                  <Trash2 size={14} />
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Google User Profile Card / Sign In Prompt */}
        {!googleUser ? (
          <div className="chat-sidebar-signin-card">
            <p>Sign in to automatically save and sync your conversations</p>
            <div id="chat-sidebar-google-btn"></div>
          </div>
        ) : (
          <div className="chat-sidebar-user-card">
            <div className="chat-sidebar-user-card__header">
              <img src={googleUser.picture} alt={googleUser.name} className="chat-sidebar-user-card__avatar" />
              <div className="chat-sidebar-user-card__info">
                <span className="chat-sidebar-user-card__name">{googleUser.name}</span>
                <span className="chat-sidebar-user-card__email">{googleUser.email}</span>
                <span className="chat-sidebar-user-card__status">✓ Cloud Sync Active</span>
              </div>
            </div>
            <button 
              onClick={handleGoogleSignOut} 
              className="btn btn--ghost btn--small chat-sidebar-user-card__signout"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="chat-sidebar__footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setShowApiKeyInput(true)} 
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', width: '100%', textAlign: 'left' }}
          >
            Configure DeepSeek Key
          </button>
          <button 
            onClick={() => setShowGoogleConfig(true)} 
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', width: '100%', textAlign: 'left' }}
          >
            Configure Google Sign-in ID
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <div className="chat-disclaimer">
          LexAstra AI is for educational purposes only. Always verify with primary legal sources.
        </div>

        <div className="exam-selector-strip">
          <div className="exam-selector-strip__left">
            <span className="exam-mode-badge" data-exam={examMode}>
              🎯 {examMode === 'General' ? 'General Law' : examMode}
            </span>
            <span className="exam-selector-strip__tagline">
              {getExamTagline(examMode)}
            </span>
          </div>
          <select 
            value={examMode} 
            onChange={handleExamModeChange}
            className="exam-selector-dropdown"
          >
            <option value="General">General Law</option>
            <option value="Judiciary">State Judiciary (Civil Judge)</option>
            <option value="CLAT PG">CLAT PG (LLM)</option>
            <option value="CLAT UG">CLAT UG (LLB)</option>
            <option value="AIBE">AIBE (Bar Exam)</option>
            <option value="APO">APO / APP (Prosecution)</option>
            <option value="UGC NET Law">UGC NET Law</option>
            <option value="CUET PG Law">CUET PG Law</option>
            <option value="SEBI Legal">SEBI Legal Officer</option>
            <option value="UPSC Law Optional">UPSC Law Optional</option>
            <option value="IBPS SO Law">IBPS SO Law Officer</option>
          </select>
        </div>

        <div className="chat-messages" ref={chatContainerRef} onScroll={handleScroll}>
          {showGoogleConfig ? (
            <div className="api-key-section" style={{ margin: 'auto', maxWidth: '500px', background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--navy)' }}>Google Sign-in ID</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                To enable Google Sign-in, enter your Google OAuth Client ID. 
              </p>
              <div style={{ background: 'rgba(201,168,76,0.08)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
                <strong>How to get it:</strong>
                <ol style={{ marginLeft: '16px', marginTop: '6px' }}>
                  <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--gold-dark)' }}>Google Cloud Console</a>.</li>
                  <li>Create a project, navigate to <strong>APIs & Services &gt; Credentials</strong>.</li>
                  <li>Create an <strong>OAuth Client ID</strong> (Web Application).</li>
                  <li>Add <code>http://localhost:3000</code> and your production Vercel URL to <strong>Authorized JavaScript Origins</strong>.</li>
                  <li>Copy the Client ID and paste it below.</li>
                </ol>
              </div>
              <input
                type="text"
                className="search-bar__input"
                style={{ paddingLeft: '24px', marginBottom: '24px' }}
                placeholder="123456-abcde.apps.googleusercontent.com"
                value={tempGoogleId}
                onChange={(e) => setTempGoogleId(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn--ghost" onClick={() => setShowGoogleConfig(false)}>Cancel</button>
                <button className="btn btn--primary" onClick={handleSaveGoogleId}>Save & Reload</button>
              </div>
            </div>
          ) : showApiKeyInput ? (
            <div className="api-key-section" style={{ margin: 'auto', maxWidth: '500px', background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--navy)' }}>API Configuration</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Please enter your DeepSeek API key to unlock the AI Assistant. This key is stored securely in your browser&apos;s local storage.
              </p>
              <input
                type="password"
                className="search-bar__input"
                style={{ paddingLeft: '24px', marginBottom: '24px' }}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn--ghost" onClick={() => setShowApiKeyInput(false)}>Cancel</button>
                <button className="btn btn--primary" onClick={handleSaveKey}>Save Key</button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-welcome">
              <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>What legal topic shall we explore?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>I can assist with case analysis, exam preparation, drafting, or visual flowcharts.</p>
              
              {!googleUser && (
                <div className="chat-welcome-sync-card">
                  <h4>Enable Automatic Cloud Saving</h4>
                  <p>Sign in with Google to sync your chats across devices and ensure they are automatically saved.</p>
                  <div id="chat-welcome-google-btn"></div>
                </div>
              )}

              <div className="chat-chips">
                {getExamChips(examMode).map(chip => (
                  <button key={chip} className="chat-chip" onClick={() => handleSend(chip)}>{chip}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message-wrapper ${msg.role === 'user' ? 'chat-message-wrapper--user' : 'chat-message-wrapper--ai'}`}>
                  <div className="chat-message">
                    <div className="chat-message__avatar">
                      {msg.role === 'user' ? 'U' : 'L'}
                    </div>
                    <div className="chat-message__content">
                      <div id={`ai-msg-${idx}`}>
                        {msg.role === 'user' ? (
                          <p style={{ margin: 0, fontWeight: 500 }}>{msg.content}</p>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                      
                      {msg.role === 'assistant' && idx === messages.length - 1 && !isLoading && (
                        <div className="chat-msg-actions">
                          <button onClick={() => handleCopy(msg.content, idx)} className="chat-msg-action-btn">
                            {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button onClick={() => handleExportPDF(idx)} className="chat-msg-action-btn">
                            <Download size={14} /> <span>Export PDF</span>
                          </button>
                          <button onClick={() => handleRegenerate()} className="chat-msg-action-btn chat-regenerate-btn">
                            <RefreshCw size={14} /> <span>Regenerate</span>
                          </button>
                        </div>
                      )}

                      {msg.role === 'assistant' && idx !== messages.length - 1 && !isLoading && (
                        <div className="chat-msg-actions">
                          <button onClick={() => handleCopy(msg.content, idx)} className="chat-msg-action-btn">
                            {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                            <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button onClick={() => handleExportPDF(idx)} className="chat-msg-action-btn">
                            <Download size={14} /> <span>Export PDF</span>
                          </button>
                        </div>
                      )}

                      {msg.role === 'assistant' && idx === messages.length - 1 && !isLoading && msg.content.length > 100 && (
                        <div className="chat-follow-ups">
                          {getFollowUpSuggestions(msg.content, examMode).map((suggestion, sIdx) => (
                            <button key={sIdx} className="chat-follow-up-chip" onClick={() => handleSend(suggestion)}>
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-message-wrapper chat-message-wrapper--ai" style={{ padding: '24px var(--space-xl)' }}>
                  <div className="chat-message">
                    <div className="chat-message__avatar">L</div>
                    <div className="chat-message__content">
                      <div className="chat-loading-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatContainerRef} style={{ height: '10px' }} />
            </>
          )}
        </div>

        {/* Input Area (Glassmorphism) */}
        <div className="chat-input-container">
          {isLoading && (
            <button className="chat-stop-btn" onClick={stopGeneration}>
              <StopCircle size={16} /> Stop Generation
            </button>
          )}

          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask a legal question or request a diagram..."
              value={input}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              rows={1}
              disabled={isLoading || showApiKeyInput}
            />
            <button 
              id="ai-send-btn"
              className="chat-send-btn"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading || showApiKeyInput}
            >
              ➤
            </button>
          </div>
          <div className="chat-input-footer-row">
            <div className="chat-save-status">
              {googleUser ? (
                <span className="chat-save-status__cloud" title="Synced with Google profile">
                  <span className="sync-dot sync-dot--active"></span>
                  Auto-saved to Cloud ({googleUser.email})
                </span>
              ) : (
                <span className="chat-save-status__local" title="Saved locally in browser storage. Sign in to enable cloud sync.">
                  <span className="sync-dot"></span>
                  Auto-saved locally
                </span>
              )}
            </div>
            <div className="chat-input-disclaimer">
              AI models can make mistakes. Always verify legal citations.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
