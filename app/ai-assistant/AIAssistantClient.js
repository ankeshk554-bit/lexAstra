'use client';

import { readAIStream } from '@/utils/aiStream.mjs';
import { storage } from '@/utils/storage';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Download, Check, Plus, MessageSquare, Trash2, StopCircle, RefreshCw, PanelLeftOpen, PanelLeftClose, Maximize2, Minimize2, Settings } from 'lucide-react';
import MermaidDiagram from '@/components/MermaidDiagram';

// Utility to generate a simple UUID
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Maps data/exams.js slugs (used in URLs like /exams/clat-pg) to the chat's
// exam-mode labels, so links from an exam's page can pre-select the right mode.
const SLUG_TO_EXAM_MODE = {
  'judiciary': 'Judiciary',
  'clat-pg': 'CLAT PG',
  'clat-ug': 'CLAT UG',
  'cuet-ug': 'CUET UG',
  'aibe': 'AIBE',
  'apo': 'APO',
  'ugc-net-law': 'UGC NET Law',
  'cuet-pg': 'CUET PG Law',
  'sebi-legal': 'SEBI Legal',
  'upsc-law-optional': 'UPSC Law Optional',
  'ibps-so-law': 'IBPS SO Law',
};

// Helper to satisfy React 19 linter rules for purity during static analysis
const getTimestamp = () => Date.now();

const getExamTagline = (mode) => {
  const taglines = {
    'General': 'Balanced answers for all law students',
    'Judiciary': 'Mains-style structured answer format',
    'CLAT PG': 'Analytical case-law focused responses',
    'CLAT UG': 'Simplified, scenario-based explanations',
    'CUET UG': 'NCERT-style definitions for school-leaving level',
    'AIBE': 'Section-focused, open-book optimized',
    'APO': 'Section-centric, prosecution & Evidence Act ratio focused',
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
      "Explain Section 144 BNSS (Maintenance; formerly Section 125 CrPC) with case law",
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
    'CUET UG': [
      "What is the difference between civil law and criminal law?",
      "Explain the structure of the Indian judiciary in brief",
      "What is Alternative Dispute Resolution (ADR)?",
      "Define human rights with one Indian example"
    ],
    'AIBE': [
      "Quick reference: Which section covers cheque dishonour?",
      "List all sections on bail under BNSS with section numbers",
      "Navigate the Limitation Act — key articles for filing suits",
      "Which sections of CPC deal with temporary injunctions?"
    ],
    'APO': [
      "BPSC APO Quiz: Verify section definition clauses of IPC/BNS offences",
      "Show dying declaration admissibility and Latin maxims (*Nemo moriturus*)",
      "Analyze Section 27 Evidence Act (BSA Sec 23) discovery admissibility",
      "Common intention vs Similar Intention case ratios (*Mahboob Shah*, *Barendra Ghosh*)"
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
  const supplied = [...content.matchAll(/\[FOLLOWUP:\s*([^\]]+)\]/g)].map(match => match[1].trim());
  if (supplied.length) return supplied.slice(0, 3);
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
      const storedSessions = storage.getItem('lexastra_chat_sessions');
      if (storedSessions) {
        if (!storedSessions.includes('"data: {"') && !storedSessions.includes('"index":0,"delta"')) {
          try {
            const parsed = JSON.parse(storedSessions);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const valid = parsed.filter(s => s && typeof s.id === 'string' && Array.isArray(s.messages) && s.messages.every(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string'));
              if (valid.length) return valid;
            }
          } catch (e) {
            console.error('Error parsing stored chat sessions:', e);
            storage.removeItem('lexastra_chat_sessions');
          }
        } else {
          storage.removeItem('lexastra_chat_sessions');
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
      return storage.getItem('lexastra_exam_mode') || 'General';
    }
    return 'General';
  });
  const [isLoading, setIsLoading] = useState(false);

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return storage.getItem('lexastra_deepseek_api_key') || '';
    }
    return '';
  });
  const [hasCustomApiKey, setHasCustomApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!storage.getItem('lexastra_deepseek_api_key');
    }
    return false;
  });
  const [showLocalProfileModal, setShowLocalProfileModal] = useState(false);
  const [localProfileInput, setLocalProfileInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
  const [isWideMode, setIsWideMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return storage.getItem('lexastra_chat_widemode') === 'true';
    }
    return false;
  });

  // Keyboard shortcut listener to toggle sidebar (Ctrl + B or Ctrl + \)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === '\\') || (e.ctrlKey && e.key === 'b') || (e.ctrlKey && e.key === 'B')) {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const userHasScrolledUp = useRef(false);
  const abortControllerRef = useRef(null);
    const backupFileInputRef = useRef(null);

  if (currentSessionId === null && sessions.length > 0) {
    setCurrentSessionId(sessions[0].id);
  }

  const currentSession = sessions.find(s => s?.id === currentSessionId) || { messages: [] };
  const messages = currentSession.messages || [];

  const createNewSession = () => {
    if (isLoading) stopGeneration();
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

    // If we arrived via a deep link that specifies an exam (e.g. the
    // "Ask AI for Model Answer" button on an exam's PYQ page), switch to
    // that exam mode automatically so the answer is properly grounded.
    const examSlug = params.get('exam');
    if (examSlug && SLUG_TO_EXAM_MODE[examSlug]) {
      const mode = SLUG_TO_EXAM_MODE[examSlug];
      queueMicrotask(() => setExamMode(mode));
      storage.setItem('lexastra_exam_mode', mode);
    }

    const initialPrompt = params.get('prompt');
    if (initialPrompt) {
      queueMicrotask(() => setInput(initialPrompt));
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const checkGoogleUser = () => {
      const stored = storage.getItem('lexastra_google_user');
      if (stored) {
        try {
          const profile = JSON.parse(stored);
          setGoogleUser(profile && typeof profile.name === 'string' ? profile : null);
        } catch (e) {
          console.error('Error parsing Google user:', e);
          storage.removeItem('lexastra_google_user');
          setGoogleUser(null);
        }
      } else {
        setGoogleUser(null);
      }
    };
    queueMicrotask(checkGoogleUser);

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

  // Save sessions to local storage whenever they change
  useEffect(() => {
    if (sessions.length > 0 && mounted) {
      storage.setItem('lexastra_chat_sessions', JSON.stringify(sessions));
    }
  }, [sessions, mounted]);

  const deleteSession = (e, id) => {
    e.stopPropagation();
    if (isLoading) stopGeneration();
    const remaining = sessions.filter(s => s.id !== id);
    const updated = remaining.length ? remaining : [{id:generateId(), title:'New Chat', messages:[], timestamp:getTimestamp()}];
    setSessions(updated);
    if (currentSessionId === id) setCurrentSessionId(updated[0].id);
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 30;
    userHasScrolledUp.current = !isNearBottom;
  };

  const lastMessageContentLength = messages[messages.length - 1]?.content?.length || 0;
  useEffect(() => {
    if (!userHasScrolledUp.current && chatContainerRef.current) {
      chatContainerRef.current.style.scrollBehavior = isLoading ? 'auto' : 'smooth';
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [lastMessageContentLength, isLoading, currentSessionId]);
  useEffect(() => () => abortControllerRef.current?.abort(), []);

  // Auto-expand textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  };



  const handleSignOut = () => {
    storage.removeItem('lexastra_google_user');
    setGoogleUser(null);
    window.dispatchEvent(new Event('google-signout'));
  };

  const handleExportBackup = () => {
    try {
      const backupData = {};
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && ((key.startsWith('lexastra_') && !key.includes('api_key') && !key.includes('token')) || key === 'lexastra_chat_sessions' || key === 'lexastra_google_user' || key === 'lexastra_exam_mode')) {
          backupData[key] = storage.getItem(key);
        }
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lexastra_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error creating backup: ' + err.message);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backupData = JSON.parse(event.target.result);
        let restoredCount = 0;

        for (const key in backupData) {
          if ((key.startsWith('lexastra_') && !key.includes('api_key') && !key.includes('token')) || key === 'lexastra_chat_sessions' || key === 'lexastra_google_user' || key === 'lexastra_exam_mode') {
            if (typeof backupData[key] === 'string' && storage.setItem(key, backupData[key])) restoredCount++;
          }
        }

        if (restoredCount > 0) {
          alert('Backup restored successfully! The page will now reload.');
          window.location.reload();
        } else {
          alert('Invalid backup file or no valid data found.');
        }
      } catch (err) {
        alert('Error restoring backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = async (content, index) => {
    try { await navigator.clipboard.writeText(content.replace(/\[FOLLOWUP:[^\]]*\]/g, '').trim()); }
    catch { alert('Copy is unavailable. Select the answer and copy it manually.'); return; }
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
    storage.setItem('lexastra_exam_mode', mode);
  };

  const handleRegenerate = () => {
    if (isLoading) return;
    const lastUserIndex = messages.findLastIndex(m => m.role === 'user');
    if (lastUserIndex < 0) return;
    handleSend(messages[lastUserIndex].content, messages.slice(0, lastUserIndex));
  };

  const handleSend = async (text, history = messages) => {
    if (!text.trim() || isLoading) return;

    userHasScrolledUp.current = false;
    const userMessage = { role: 'user', content: text };

    // Auto-generate title if it's the first message
    let sessionTitle = currentSession.title;
    if (messages.length === 0) {
      sessionTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
    }

    const updatedMessages = [...history, userMessage];

    setSessions(prev => prev.map(s =>
      s.id === currentSessionId ? { ...s, messages: updatedMessages, title: sessionTitle } : s
    ));

    setInput('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const customKey = storage.getItem('lexastra_deepseek_api_key') || '';
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-api-key'] = customKey;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: updatedMessages, examMode }),
        signal: controller.signal
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMsg = typeof data.error === 'string' ? data.error : `The AI request failed (${response.status}). Please retry.`;
        setSessions(prev => prev.map(session => session.id === currentSessionId ? {...session, messages:[...updatedMessages,{role:'assistant',content:errorMsg}]} : session));
        return;
      }

      // Add empty assistant message
      setSessions(prev => prev.map(s =>
        s.id === currentSessionId ? { ...s, messages: [...updatedMessages, { role: 'assistant', content: '' }] } : s
      ));

      await readAIStream(response, text => !controller.signal.aborted && setSessions(prev => prev.map(session =>
        session.id === currentSessionId ? {...session, messages: [...updatedMessages, {role:'assistant', content:text}]} : session
      )));

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error('Chat error:', error);
        const errorMsg = 'Network connection failed. Please check your internet connection and ensure your local server is running, or verify your API key configuration.';
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return { ...s, messages: [...updatedMessages, { role: 'assistant', content: errorMsg }] };
          }
          return s;
        }));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
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
    <div className={`chat-layout page-enter ${isSidebarCollapsed ? 'chat-layout--sidebar-collapsed' : ''}`}>
      {/* Sidebar History */}
      <aside className={`chat-sidebar ${isSidebarCollapsed ? 'chat-sidebar--collapsed' : ''}`}>
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
                storage.removeItem('lexastra_chat_sessions');
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
                onClick={() => { if (isLoading) stopGeneration(); setCurrentSessionId(session.id); if (window.innerWidth < 900) setIsSidebarCollapsed(true); }}
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

        {/* User Profile Card / Local Sign In Prompt */}
        {!googleUser ? (
          <div className="chat-sidebar-signin-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>Progress is saved on this browser. A local profile is optional.</p>
            <button
              onClick={() => setShowLocalProfileModal(true)}
              className="btn btn--primary btn--small"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Set Up Profile
            </button>
          </div>
        ) : (
          <div className="chat-sidebar-user-card">
            <div className="chat-sidebar-user-card__header">
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#C9A84C',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid var(--gold)',
                  marginRight: '12px',
                  flexShrink: 0
                }}
              >
                {googleUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="chat-sidebar-user-card__info">
                <span className="chat-sidebar-user-card__name">{googleUser.name}</span>
                <span className="chat-sidebar-user-card__email">{googleUser.email}</span>
                <span className="chat-sidebar-user-card__status">✓ Local Profile Active</span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn--ghost btn--small chat-sidebar-user-card__signout"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="chat-sidebar__footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => setShowApiKeyModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: hasCustomApiKey ? '#C9A84C' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'none',
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: hasCustomApiKey ? '600' : 'normal'
            }}
          >
            <Settings size={12} /> {hasCustomApiKey ? 'DeepSeek API Key (Custom)' : 'Configure DeepSeek API Key'}
          </button>

          <button
            onClick={() => setShowBackupModal(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', width: '100%', textAlign: 'left' }}
          >
            Backup & Restore Workspace
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section aria-label="AI conversation" className={`chat-main ${isWideMode ? 'chat-main--wide' : ''}`}>
        {/* Workspace Control Header */}
        <div className="chat-header">
          <div className="chat-header__left">
            <button
              className="chat-sidebar-toggle-btn"
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              title={isSidebarCollapsed ? "Show Sidebar (Ctrl+B)" : "Hide Sidebar (Ctrl+B)"}
              aria-label="Toggle Sidebar"
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <h1 className="chat-header__title">AI Legal Workspace</h1>
          </div>

          <div className="chat-header__actions">
            {/* Exam Mode Dropdown */}
            <div className="chat-header__exam-selector">
              <span className="exam-mode-badge" data-exam={examMode}>
                🎯 {examMode === 'General' ? 'General Law' : examMode}
              </span>
              <select
                value={examMode}
                onChange={handleExamModeChange}
                className="exam-selector-dropdown"
                aria-label="Select Exam Mode"
              >
                <option value="General">General Law</option>
                <option value="Judiciary">State Judiciary (Civil Judge)</option>
                <option value="CLAT PG">CLAT PG (LLM)</option>
                <option value="CLAT UG">CLAT UG (LLB)</option>
                <option value="CUET UG">CUET UG (Law)</option>
                <option value="AIBE">AIBE (Bar Exam)</option>
                <option value="APO">APO / APP (Prosecution)</option>
                <option value="UGC NET Law">UGC NET Law</option>
                <option value="CUET PG Law">CUET PG Law</option>
                <option value="SEBI Legal">SEBI Legal Officer</option>
                <option value="UPSC Law Optional">UPSC Law Optional</option>
                <option value="IBPS SO Law">IBPS SO Law Officer</option>
              </select>
            </div>

            <div className="chat-header__divider" />

            {/* Layout Wide Mode Toggle */}
            <button
              className={`chat-header__layout-btn ${isWideMode ? 'chat-header__layout-btn--active' : ''}`}
              onClick={() => {
                setIsWideMode(prev => {
                  const newVal = !prev;
                  storage.setItem('lexastra_chat_widemode', String(newVal));
                  return newVal;
                });
              }}
              title={isWideMode ? "Switch to Standard layout (800px)" : "Switch to Wide layout (1300px)"}
              aria-label="Toggle Wide Mode"
            >
              {isWideMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span>{isWideMode ? "Standard" : "Wide View"}</span>
            </button>
          </div>
        </div>

        <div className="chat-messages" ref={chatContainerRef} onScroll={handleScroll}>
          {showBackupModal ? (
            <div className="api-key-section" style={{ margin: 'auto', maxWidth: '500px', background: 'var(--bg-card)', padding: '32px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--navy)' }}>Backup & Restore Workspace</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                Save your workspace progress, including highlights, annotations, notes, and all AI conversation sessions, to a single file. You can upload this file later to restore your work.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                <button
                  className="btn btn--gold-fill"
                  onClick={handleExportBackup}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Export JSON Backup File
                </button>

                <button
                  className="btn btn--ghost"
                  onClick={() => backupFileInputRef.current?.click()}
                  style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}
                >
                  Restore from Backup File
                </button>

                <input
                  type="file"
                  ref={backupFileInputRef}
                  onChange={handleImportBackup}
                  accept=".json"
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button className="btn btn--ghost" onClick={() => setShowBackupModal(false)}>Close</button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-welcome">
              <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>What legal topic shall we explore?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>I can assist with case analysis, exam preparation, drafting, or visual flowcharts.</p>

              {!googleUser && (
                <div className="chat-welcome-sync-card" style={{ padding: '20px', background: 'rgba(201, 168, 76, 0.05)', border: '1px solid rgba(201, 168, 76, 0.15)', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', margin: '20px auto 0 auto' }}>
                  <h4 style={{ color: 'var(--navy)', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold' }}>Create Local Profile</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>Your conversations save automatically on this browser. Add an optional local display name to personalise your workspace.</p>
                  <button
                    onClick={() => setShowLocalProfileModal(true)}
                    className="btn btn--primary btn--small"
                    style={{ margin: '0 auto' }}
                  >
                    Set Up Profile
                  </button>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(201, 168, 76, 0.06)',
                  border: '1px solid rgba(201, 168, 76, 0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  maxWidth: '550px',
                  margin: '20px auto',
                  textAlign: 'left',
                  fontSize: '13px',
                  color: 'var(--charcoal-light)'
                }}
              >
                <div style={{ background: 'var(--gold)', color: 'var(--navy)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>
                  📄
                </div>
                <div>
                  <strong>Document Analysis Workspace:</strong> Studying a legal textbook or bare act PDF? Use the <Link href="/pdf-reader" style={{ color: 'var(--gold-dark)', fontWeight: '600', textDecoration: 'underline' }}>PDF Assistant</Link> to highlight text, take notes, and run AI commands.
                </div>
              </div>

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
                          <>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                              {msg.content.replace(/\[FOLLOWUP:[^\]]*\]/g, '').trim()}
                            </ReactMarkdown>
                            {msg.role === 'assistant' && (msg.content.includes('Authentication failed') || msg.content.includes('Insufficient Balance') || msg.content.includes('API key') || msg.content.includes('API Settings') || msg.content.includes('API Key')) && (
                              <div style={{ marginTop: '16px', background: 'rgba(201, 168, 76, 0.05)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '16px', borderRadius: '8px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 'bold', margin: '0 0 10px 0' }}>DeepSeek API Settings Required</p>
                                <button onClick={() => setShowApiKeyModal(true)} className="btn btn--gold-fill btn--small" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Settings size={14} /> Configure DeepSeek API Key
                                </button>
                              </div>
                            )}
                          </>
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
              <div ref={messagesEndRef} style={{ height: '10px' }} />
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
              disabled={isLoading}
            />
            <button
              id="ai-send-btn"
              className="chat-send-btn"
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
            >
              ➤
            </button>
          </div>
          <div className="chat-input-footer-row">
            <div className="chat-save-status">
              {googleUser ? (
                <span className="chat-save-status__cloud" style={{ color: '#27AE60' }} title="Saved locally under active profile">
                  <span className="sync-dot sync-dot--active" style={{ background: '#27AE60' }}></span>
                  Auto-saved to Profile ({googleUser.name})
                </span>
              ) : (
                <span className="chat-save-status__local" title="Saved locally in browser storage. Create a profile to manage progress.">
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
      </section>

      {showLocalProfileModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(11, 31, 58, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#F5F2EB',
            border: '1px solid #D1C4A5',
            borderRadius: '16px',
            padding: '24px 32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            color: '#0B1F3A',
            position: 'relative',
            textAlign: 'left'
          }}>
            <button
              onClick={() => setShowLocalProfileModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                fontSize: '18px'
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0B1F3A', marginBottom: '8px' }}>
              Create Local Profile
            </h3>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px', lineHeight: '1.4' }}>
              Enter your name or email to label your textbook highlights, notes, and AI conversations. These are saved only in this browser — they won&rsquo;t follow you to another device, and clearing your browser data will erase them.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!localProfileInput.trim()) return;
              const trimmed = localProfileInput.trim();
              const isEmail = trimmed.includes('@');
              const name = isEmail ? trimmed.split('@')[0] : trimmed;
              const email = isEmail ? trimmed : `${trimmed.toLowerCase()}@local`;
              const profile = {
                name,
                email,
                picture: '',
                localOnly: true
              };
              storage.setItem('lexastra_google_user', JSON.stringify(profile));
              setGoogleUser(profile);
              setShowLocalProfileModal(false);
              setLocalProfileInput('');
              window.dispatchEvent(new Event('google-signin'));
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Name or Email:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ankes or user@email.com"
                  value={localProfileInput}
                  onChange={(e) => setLocalProfileInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #D1C4A5',
                    background: '#ffffff',
                    color: '#0B1F3A',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn btn--gold-fill"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', borderRadius: '8px' }}
              >
                Create Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {showApiKeyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(11, 31, 58, 0.6)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            background: '#F5F2EB',
            border: '1px solid #D1C4A5',
            borderRadius: '16px',
            padding: '24px 32px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            color: '#0B1F3A',
            position: 'relative',
            textAlign: 'left'
          }}>
            <button
              onClick={() => setShowApiKeyModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#666',
                fontSize: '18px'
              }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0B1F3A', marginBottom: '8px' }}>
              🔑 DeepSeek API Settings
            </h3>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px', lineHeight: '1.4' }}>
              Configure your own DeepSeek API Key. Your custom key will be stored on this browser; avoid using a shared device and used directly for all AI queries.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const trimmed = apiKeyInput.trim();
              if (trimmed) {
                storage.setItem('lexastra_deepseek_api_key', trimmed);
                setHasCustomApiKey(true);
              } else {
                storage.removeItem('lexastra_deepseek_api_key');
                setHasCustomApiKey(false);
              }
              setShowApiKeyModal(false);
              alert('DeepSeek API Key settings updated successfully!');
            }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '6px', textTransform: 'uppercase' }}>
                  DeepSeek API Key:
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: '1px solid #D1C4A5',
                    background: '#ffffff',
                    color: '#0B1F3A',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    storage.removeItem('lexastra_deepseek_api_key');
                    setApiKeyInput('');
                    setHasCustomApiKey(false);
                    setShowApiKeyModal(false);
                    alert('Custom API Key cleared. LexAstra will now fall back to the default server-side key.');
                  }}
                  className="btn btn--ghost"
                  style={{ flex: 1, justifyContent: 'center', border: '1px solid #cbd5e1' }}
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="btn btn--gold-fill"
                  style={{ flex: 2, justifyContent: 'center' }}
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
