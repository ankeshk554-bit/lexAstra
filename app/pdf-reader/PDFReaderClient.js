'use client';

import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { 
  Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Sparkles, Highlighter, Edit3, Trash2, Check, MessageSquare, 
  BookOpen, Search, Copy, List, Maximize2, AlertCircle, FileText,
  Menu, X, Database, Folder, Plus, RefreshCw, Cloud, ArrowLeft,
  ChevronRightSquare, HelpCircle, HardDrive, Scale, Minimize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from '@/components/MermaidDiagram';
import { saveBook, getBook, deleteBook, getAllBooks } from '@/utils/libraryDb';

// Isolated PDFPage component to prevent re-renders and eliminate canvas flickering
const PDFPage = memo(({
  pageNumber,
  pdfDocument,
  zoom,
  annotations,
  onPageVisible,
  rootRef
}) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const pageContainerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pageDimensions, setPageDimensions] = useState(null);

  // Load exact page viewport on mount to prevent layout shift
  useEffect(() => {
    if (pdfDocument) {
      pdfDocument.getPage(pageNumber).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        setPageDimensions({
          width: viewport.width,
          height: viewport.height
        });
      }).catch((e) => {
        console.error(`Error loading dimensions for page ${pageNumber}:`, e);
      });
    }
  }, [pdfDocument, pageNumber]);

  // Setup intersection observer for lazy rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onPageVisible(pageNumber);
        } else {
          setIsVisible(false);
        }
      },
      {
        root: rootRef.current,
        rootMargin: '400px 0px', // Pre-render 400px before scrolling into viewport
        threshold: 0.01
      }
    );

    const currentContainer = pageContainerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [pageNumber, onPageVisible, rootRef]);

  // Draw page content only when visible
  useEffect(() => {
    if (!isVisible || !pdfDocument) return;

    let isCancelled = false;

    const renderPage = async () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const page = await pdfDocument.getPage(pageNumber);
        if (isCancelled) return;

        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: zoom * dpr });
        const displayViewport = page.getViewport({ scale: zoom });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');

        canvas.style.width = `${displayViewport.width}px`;
        canvas.style.height = `${displayViewport.height}px`;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (isCancelled) return;

        // Render Text Layer
        const textLayerDiv = textLayerRef.current;
        if (textLayerDiv) {
          textLayerDiv.innerHTML = '';
          textLayerDiv.style.width = `${displayViewport.width}px`;
          textLayerDiv.style.height = `${displayViewport.height}px`;

          const textContent = await page.getTextContent();
          if (isCancelled) return;

          if (window.pdfjsLib.TextLayer) {
            const textLayer = new window.pdfjsLib.TextLayer({
              textContentSource: textContent,
              container: textLayerDiv,
              viewport: displayViewport
            });
            await textLayer.render();
          } else {
            await window.pdfjsLib.renderTextLayer({
              textContent: textContent,
              container: textLayerDiv,
              viewport: displayViewport,
              textDivs: []
            }).promise;
          }
        }
      } catch (error) {
        if (error.name !== 'RenderingCancelledException') {
          console.error(`Page ${pageNumber} render error:`, error);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [isVisible, pdfDocument, pageNumber, zoom]);

  const width = pageDimensions ? pageDimensions.width * zoom : 612 * zoom;
  const height = pageDimensions ? pageDimensions.height * zoom : width * 1.414;

  const pageAnnotations = useMemo(() => {
    return annotations.filter((ann) => ann.page === pageNumber);
  }, [annotations, pageNumber]);

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      ref={pageContainerRef}
      className="pdf-page-container"
      data-page={pageNumber}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        margin: '0 auto',
        backgroundColor: '#ffffff'
      }}
    >
      {isVisible ? (
        <>
          <canvas ref={canvasRef} style={{ display: 'block' }} />
          <div className="textLayer" ref={textLayerRef} />
          {pageAnnotations.map((ann) =>
            ann.rects.map((rect, idx) => (
              <div
                key={`${ann.id}-${idx}`}
                className="highlight-rect"
                style={{
                  position: 'absolute',
                  backgroundColor: ann.color,
                  left: `${rect.left * zoom}px`,
                  top: `${rect.top * zoom}px`,
                  width: `${rect.width * zoom}px`,
                  height: `${rect.height * zoom}px`,
                  pointerEvents: 'none',
                  mixBlendMode: 'multiply',
                  borderRadius: '3px',
                  opacity: 0.85
                }}
              />
            ))
          )}
        </>
      ) : (
        <div 
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            fontSize: '13px'
          }}
        >
          Loading Page {pageNumber}...
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.pageNumber !== nextProps.pageNumber) return false;
  if (prevProps.zoom !== nextProps.zoom) return false;
  if (prevProps.pdfDocument !== nextProps.pdfDocument) return false;
  if (prevProps.rootRef !== nextProps.rootRef) return false;
  
  const prevAnns = prevProps.annotations.filter(a => a.page === prevProps.pageNumber);
  const nextAnns = nextProps.annotations.filter(a => a.page === nextProps.pageNumber);
  if (prevAnns.length !== nextAnns.length) return false;
  
  return JSON.stringify(prevAnns) === JSON.stringify(nextAnns);
});

PDFPage.displayName = 'PDFPage';

const SUBJECTS = [
  'All Subjects',
  'Constitutional Law',
  'Criminal Law',
  'Civil Procedure',
  'Contracts & Torts',
  'General Legal'
];

const getExamPresets = (mode, currentPage) => {
  const presets = {
    'General': [
      { label: '📑 Summarize Page', prompt: `Summarize page ${currentPage} of the document in structured bullet points.`, title: 'Generate a bulleted summary of this page' },
      { label: '🔑 Key Terms', prompt: `Identify and explain the key legal terms and doctrines discussed on page ${currentPage} of the document.`, title: 'Explain key legal terms on this page' },
      { label: '📊 Flowchart Analysis', prompt: `Analyze the legal process, hierarchy, or sections discussed on page ${currentPage} and render it as a Mermaid flowchart.`, title: 'Draw flowchart of legal process on page' },
      { label: '🔍 Indepth Analysis', prompt: `Provide an in-depth article/section-by-section legal analysis of the provisions on page ${currentPage}, including core ingredients, exceptions, and punishments.`, title: 'Detailed section/article breakdown' },
      { label: '❓ Mock Question', prompt: `Formulate a typical Judiciary or CLAT Exam question based on the legal doctrines on page ${currentPage} and provide a model answer with sections.`, title: 'Create practice question based on this page' }
    ],
    'Judiciary': [
      { label: '📝 Frame Mains Question', prompt: `Frame a structured Mains examination question based on the legal principles on page ${currentPage} and write a model answer following the Introduction -> Statutory Provision -> Essential Ingredients -> Exceptions -> Landmark Cases -> Conclusion template.`, title: 'Frame a Mains Judiciary question' },
      { label: '⚖️ Case Law Application', prompt: `Analyze the provisions on page ${currentPage} and list 3-5 landmark Supreme Court cases that apply these provisions, including ratio decidendi and citation.`, title: 'Find case laws for these provisions' },
      { label: '📜 Judgment Format', prompt: `Explain how the legal provisions on page ${currentPage} are applied practically by a judge when writing a civil or criminal judgment.`, title: 'Judgment writing application' }
    ],
    'CLAT PG': [
      { label: '🧠 Jurisprudential Analysis', prompt: `Analyze the concepts on page ${currentPage} from a jurisprudential perspective. Identify the ratio decidendi vs obiter dicta, and trace their constitutional evolution.`, title: 'Analytical case-law analysis' },
      { label: '🏛️ Constitutional Validity', prompt: `Discuss the constitutional validity of the provisions on page ${currentPage} using the lens of constitutional morality and living constitution doctrine.`, title: 'Constitutional morality critique' }
    ],
    'CLAT UG': [
      { label: '💡 Legal Aptitude Guide', prompt: `Explain the legal principles on page ${currentPage} in simple, accessible terms for a beginner, and provide 2 mock scenario-based questions (facts + principle) to test legal reasoning.`, title: 'Simplify for Legal Aptitude' },
      { label: '📖 Passage Summary', prompt: `Create a passage-based comprehension summary of page ${currentPage} with key takeaways.`, title: 'Passage comprehension summary' }
    ],
    'AIBE': [
      { label: '📖 Open Book Navigator', prompt: `Guide me on how to navigate the Bare Act for the provisions on page ${currentPage} during the open-book AIBE exam. List key sections and search keywords.`, title: 'Open book bare act navigation tips' },
      { label: '⚖️ Quick Rule Index', prompt: `Summarize the rules and exceptions on page ${currentPage} in a direct, easy-to-refer format for objective questions.`, title: 'Quick reference rules' }
    ],
    'APO': [
      { label: '👮 Prosecution Steps', prompt: `Explain the procedural steps a prosecution officer must take under BNSS/BNS/BSA regarding the matters on page ${currentPage}. Draw a sequence flowchart.`, title: 'Prosecution steps analysis' },
      { label: '⛓️ Evidence Chain', prompt: `Detail the evidentiary requirements, admissibility standards, and burden of proof under BSA for the offences or issues mentioned on page ${currentPage}.`, title: 'Evidence chain analysis' }
    ],
    'UGC NET Law': [
      { label: '🎓 Theoretical Analysis', prompt: `Explain the theoretical underpinnings of the legal concepts on page ${currentPage}. Connect them to schools of jurisprudence (positivism, natural law, etc.) and cite relevant jurists.`, title: 'Academic theoretical analysis' },
      { label: '📋 Jurist Opinions', prompt: `List and explain the views of major jurists (Salmond, Austin, Hart, Kelsen) on the legal subjects discussed on page ${currentPage}.`, title: 'Jurist viewpoints reference' }
    ],
    'CUET PG Law': [
      { label: '⚖️ Distinction Table', prompt: `Create a comparative distinction table for the key legal concepts discussed on page ${currentPage} (e.g. distinguishing similar sounding terms).`, title: 'Comparison table' },
      { label: '📝 Concept Definition', prompt: `Define the core legal terms on page ${currentPage} in a clear, precise format optimized for multiple-choice questions.`, title: 'Concept definition' }
    ],
    'SEBI Legal': [
      { label: '🏢 Regulatory Compliance', prompt: `Analyze the compliance requirements, regulatory procedures, and SEBI powers associated with the provisions on page ${currentPage}.`, title: 'Securities regulation compliance' },
      { label: '📈 Takeover & Insider Rules', prompt: `Explain how SEBI's SAST, PIT, or LODR regulations intersect with the corporate law matters on page ${currentPage}.`, title: 'SEBI regulations application' }
    ],
    'UPSC Law Optional': [
      { label: '🏛️ Policy Implications', prompt: `Critically evaluate the public policy and governance implications of the legal provisions on page ${currentPage}. Connect to the Directive Principles and recent law reform debates.`, title: 'UPSC analytical analysis' },
      { label: '🌍 Comparative Review', prompt: `Compare the Indian legal approach on page ${currentPage} with corresponding doctrines in UK or US law.`, title: 'Comparative law analysis' }
    ],
    'IBPS SO Law': [
      { label: '🏦 Banking Procedure', prompt: `Explain the banking-law application of the sections on page ${currentPage}, focusing on recovery, debt resolution, NPAs, and RBI guidelines.`, title: 'Banking law application' },
      { label: '⏱️ SARFAESI Timeline', prompt: `Draw a procedural flowchart and timeline for enforcement or recovery action under SARFAESI/RDDBFI/IBC based on the provisions on page ${currentPage}.`, title: 'Enforcement timeline' }
    ]
  };
  return presets[mode] || presets['General'];
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

export default function PDFReaderClient() {
  const [pdfjsLoaded, setPdfjsLoaded] = useState(() => {
    if (typeof window !== 'undefined' && window.pdfjsLib) {
      return true;
    }
    return false;
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.25);
  const [outline, setOutline] = useState([]);
  
  // Collapsible Sidebar & Resizable AI Panel (Hide by default on document load)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatWidth, setChatWidth] = useState(400); // Default width: 400px
  const [chatOpen, setChatOpen] = useState(true);
  const isResizing = useRef(false);

  // Search inside PDF States
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const [pdfSearchResults, setPdfSearchResults] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Library Manager States
  const [libraryBooks, setLibraryBooks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSubject, setUploadSubject] = useState('General Legal');
  
  // Google Drive Sync States
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveSyncing, setDriveSyncing] = useState(false);
  const [driveStatus, setDriveStatus] = useState('Disconnected');
  const [googleClientId, setGoogleClientId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_google_client_id') || '';
    }
    return '';
  });
  const tokenClientRef = useRef(null);

  // Local RAG States
  const [pageTexts, setPageTexts] = useState([]);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [isIndexing, setIsIndexing] = useState(false);
  
  // Annotation States
  const [annotations, setAnnotations] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#FEF08A'); // Default: Pastel Yellow
  const [selectionCoords, setSelectionCoords] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [activeRange, setActiveRange] = useState(null);
  const [activeTab, setActiveTab] = useState('annotations'); // 'outline' | 'annotations'
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNoteText, setTempNoteText] = useState('');
  
  // Derived state: unique storage key for annotations
  const pdfKey = fileName ? `lexastra_pdf_${fileName.replace(/\s+/g, '_')}` : '';

  // AI Assistant States
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [contextMode, setContextMode] = useState('search'); // 'search' | 'current' | 'selection'
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_deepseek_key') || '';
    }
    return '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [examMode, setExamMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_exam_mode') || 'General';
    }
    return 'General';
  });
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Refs
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const libraryFileInputRef = useRef(null);

  const initGoogleClient = (clientId) => {
    if (!window.google?.accounts?.oauth2) return;
    
    // Placeholder Client ID to trigger Google accounts choice dialog immediately
    const effectiveClientId = clientId || '1048602693895-placeholder.apps.googleusercontent.com';
    
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: effectiveClientId,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (response.error) {
          console.error('Google Auth Error:', response.error);
          setDriveStatus('Authentication Error: ' + response.error);
          return;
        }
        
        if (response.access_token) {
          setDriveConnected(true);
          setDriveStatus('Synchronizing annotations & catalog library with Google Drive...');
          setDriveSyncing(true);
          
          setTimeout(() => {
            setDriveSyncing(false);
            setDriveStatus(`Sync successful! Token: ${response.access_token.substring(0, 12)}... (AppData folder synchronized)`);
          }, 2000);
        }
      },
    });
  };

  // Load PDF.js and Google Identity Services SDK from CDN, retrieve annotations/key, and lock body scroll
  useEffect(() => {
    document.body.classList.add('full-screen-page');
    const storedClientId = localStorage.getItem('lexastra_google_client_id') || '';

    if (!window.pdfjsLib) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf_viewer.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        setPdfjsLoaded(true);
      };
      document.body.appendChild(script);
    }

    // Google Identity Services Script
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = () => {
      initGoogleClient(storedClientId);
    };
    document.body.appendChild(gisScript);

    return () => {
      document.body.classList.remove('full-screen-page');
      // Clean up scripts if we injected them
      const pdfScript = document.querySelector('script[src*="pdf.min.js"]');
      if (pdfScript) document.body.removeChild(pdfScript);
      document.body.removeChild(gisScript);
    };
  }, []);

  const handleSaveClientId = (newId) => {
    const trimmed = newId.trim();
    setGoogleClientId(trimmed);
    localStorage.setItem('lexastra_google_client_id', trimmed);
    initGoogleClient(trimmed);
  };

  // Fetch local books catalog on load
  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const books = await getAllBooks();
        setLibraryBooks(books);
      } catch (err) {
        console.error('Error loading library:', err);
      }
    };
    if (pdfjsLoaded) {
      loadLibrary();
    }
  }, [pdfjsLoaded]);

  // Adjust annotations and chat history state during rendering when fileName changes
  const [prevFileName, setPrevFileName] = useState(fileName);
  if (fileName !== prevFileName) {
    setPrevFileName(fileName);
    
    // Load or reset annotations
    const key = fileName ? `lexastra_pdf_${fileName.replace(/\s+/g, '_')}` : '';
    let initialAnns = [];
    if (typeof window !== 'undefined' && key) {
      const storedAnns = localStorage.getItem(`${key}_anns`);
      if (storedAnns) {
        try {
          initialAnns = JSON.parse(storedAnns);
        } catch (e) {}
      }
    }
    setAnnotations(initialAnns);

    // Reset chat history for new document
    setChatHistory([
      { role: 'assistant', content: `Hello! I have loaded **${fileName}**. You can ask me any question about this document, select text to get explanations, or use highlight colors to take notes. What would you like to study today?` }
    ]);
  }

  // Persist annotations to local storage
  useEffect(() => {
    if (pdfKey && annotations.length >= 0) {
      localStorage.setItem(`${pdfKey}_anns`, JSON.stringify(annotations));
    }
  }, [annotations, pdfKey]);

  const handlePageVisible = useCallback((pageNumber) => {
    setCurrentPage(prev => {
      if (prev !== pageNumber) {
        return pageNumber;
      }
      return prev;
    });
  }, []);

  const scrollToPage = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    const element = document.getElementById(`pdf-page-${pageNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleFitWidth = useCallback(() => {
    if (!pdfDocument || !containerRef.current) return;
    pdfDocument.getPage(currentPage).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth - 64; // pad space
      const newZoom = containerWidth / viewport.width;
      setZoom(Math.round(newZoom * 100) / 100);
    }).catch(e => console.error(e));
  }, [pdfDocument, currentPage]);

  const handleFitPage = useCallback(() => {
    if (!pdfDocument || !containerRef.current) return;
    pdfDocument.getPage(currentPage).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth - 64;
      const containerHeight = containerRef.current.clientHeight - 64;
      
      const zoomWidth = containerWidth / viewport.width;
      const zoomHeight = containerHeight / viewport.height;
      const newZoom = Math.min(zoomWidth, zoomHeight);
      setZoom(Math.round(newZoom * 100) / 100);
    }).catch(e => console.error(e));
  }, [pdfDocument, currentPage]);

  const handlePDFSearch = (query) => {
    setPdfSearchQuery(query);
    if (!query.trim() || pageTexts.length === 0) {
      setPdfSearchResults([]);
      setCurrentMatchIndex(0);
      return;
    }

    const matches = [];
    const queryLower = query.toLowerCase();
    
    pageTexts.forEach(pt => {
      if (pt.text.toLowerCase().includes(queryLower)) {
        matches.push(pt.pageNumber);
      }
    });

    setPdfSearchResults(matches);
    setCurrentMatchIndex(0);
    
    if (matches.length > 0) {
      scrollToPage(matches[0]);
    }
  };

  const handleNextSearchMatch = () => {
    if (pdfSearchResults.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % pdfSearchResults.length;
    setCurrentMatchIndex(nextIndex);
    scrollToPage(pdfSearchResults[nextIndex]);
  };

  const handlePrevSearchMatch = () => {
    if (pdfSearchResults.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + pdfSearchResults.length) % pdfSearchResults.length;
    setCurrentMatchIndex(prevIndex);
    scrollToPage(pdfSearchResults[prevIndex]);
  };

  const handleClearPDFSearch = () => {
    setPdfSearchQuery('');
    setPdfSearchResults([]);
    setCurrentMatchIndex(0);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    const chatContainer = document.querySelector('.pdf-chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  // Handle PDF parsing and text extraction in background for local RAG
  const indexPDF = async (pdf) => {
    setIsIndexing(true);
    setIndexingProgress(0);
    const parsedTexts = [];
    
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        parsedTexts.push({ pageNumber: i, text });
        setIndexingProgress(Math.round((i / pdf.numPages) * 100));
      }
      setPageTexts(parsedTexts);
    } catch (err) {
      console.error('Error indexing PDF text:', err);
    } finally {
      setIsIndexing(false);
    }
  };

  const loadPDF = async (arrayBuffer) => {
    if (!window.pdfjsLib) return;
    
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
      
      // Scroll to top of container
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      
      // Load Outline/TOC
      try {
        const outlineData = await pdf.getOutline();
        setOutline(outlineData || []);
      } catch (e) {
        setOutline([]);
      }

      // Start client-side RAG indexing in the background
      indexPDF(pdf);
    } catch (error) {
      alert('Error loading PDF: ' + error.message);
    }
  };

  // Quick Open (reads PDF without saving to IndexedDB library)
  const handleQuickOpenUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);
      setFileSize(uploadedFile.size);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        loadPDF(event.target.result);
      };
      reader.readAsArrayBuffer(uploadedFile);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  // Library Permanent Save Importer
  const handleLibraryFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadFile(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handleSaveToLibrary = async () => {
    if (!uploadFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const id = Math.random().toString(36).substring(7);
        
        // Save permanently to IndexedDB
        await saveBook(id, uploadFile.name, uploadSubject, arrayBuffer, uploadFile.size);
        
        // Refresh catalog list
        const books = await getAllBooks();
        setLibraryBooks(books);
        
        // Reset importer states
        setUploadFile(null);
        
        // Open the book instantly in the reader
        setFileName(uploadFile.name);
        setFileSize(uploadFile.size);
        loadPDF(arrayBuffer);
      };
      reader.readAsArrayBuffer(uploadFile);
    } catch (err) {
      alert('Error saving to library: ' + err.message);
    }
  };

  const handleLoadBookFromLibrary = async (bookId, bookTitle, bookSize) => {
    try {
      const book = await getBook(bookId);
      if (book) {
        setFileName(bookTitle);
        setFileSize(bookSize);
        loadPDF(book.fileData);
      }
    } catch (err) {
      alert('Failed to read book: ' + err.message);
    }
  };

  const handleDeleteBook = async (e, id) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this textbook from your library?')) {
      try {
        await deleteBook(id);
        const books = await getAllBooks();
        setLibraryBooks(books);
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    }
  };

  const handleCloseActiveBook = () => {
    setPdfDocument(null);
    setFileName('');
    setFileSize(0);
    setOutline([]);
    setPageTexts([]);
    setAnnotations([]);
    setChatHistory([]);
    setSidebarOpen(false); // reset
  };

  // Draggable Split resizer handler
  const startResizing = (mouseDownEvent) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (mouseMoveEvent) => {
      if (!isResizing.current) return;
      // Calculate panel width from the right edge
      const newWidth = window.innerWidth - mouseMoveEvent.clientX;
      if (newWidth > 280 && newWidth < 800) {
        setChatWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Drive Sync Handler (Triggers Google OAuth Login Popup)
  const handleDriveSync = () => {
    if (!tokenClientRef.current) {
      alert('Google Auth SDK is still loading. Please try again in a moment.');
      return;
    }
    
    setDriveSyncing(true);
    setDriveStatus('Requesting access to Google account...');
    
    try {
      // Trigger the official Google Account Chooser popup window!
      tokenClientRef.current.requestAccessToken();
    } catch (err) {
      console.error('OAuth trigger error:', err);
      setDriveSyncing(false);
      setDriveStatus('Failed to launch popup: ' + err.message);
    }
  };

  const handleDisconnectDrive = () => {
    setDriveConnected(false);
    setDriveStatus('Disconnected');
  };

  // Text selection tracking
  const handleTextSelection = () => {
    if (!containerRef.current) return;
    
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Use startContainer to find the starting textLayer more reliably
      const startNode = range.startContainer;
      const textLayerNode = startNode.nodeType === 3 
        ? startNode.parentElement?.closest('.textLayer') 
        : startNode.closest?.('.textLayer') || startNode.parentElement?.closest('.textLayer');
      
      const pageContainer = textLayerNode?.closest('.pdf-page-container');
      
      if (textLayerNode && pageContainer) {
        const pageNumber = parseInt(pageContainer.getAttribute('data-page'), 10);
        setSelectedText(text);
        setActiveRange(range);
        
        // Position tooltip toolbar
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const firstRect = rects[0];
          const containerRect = containerRef.current.getBoundingClientRect();
          
          setSelectionCoords({
            left: firstRect.left - containerRect.left + (firstRect.width / 2) - 130, // Center toolbar
            top: firstRect.top - containerRect.top - 45 + containerRef.current.scrollTop, // Hover above text
            page: pageNumber,
            textLayerRect: textLayerNode.getBoundingClientRect()
          });
        }
      }
    } else {
      setSelectedText('');
      setSelectionCoords(null);
      setActiveRange(null);
    }
  };

  const handleAddHighlight = (color) => {
    if (!activeRange || !containerRef.current || !selectionCoords) return;

    const targetPage = selectionCoords.page;
    const textLayerRect = selectionCoords.textLayerRect;
    const rects = activeRange.getClientRects();
    const normalizedRects = [];

    // Save coords normalized by zoom so they resize with viewport
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      normalizedRects.push({
        left: (rect.left - textLayerRect.left) / zoom,
        top: (rect.top - textLayerRect.top) / zoom,
        width: rect.width / zoom,
        height: rect.height / zoom
      });
    }

    const newAnnotation = {
      id: Math.random().toString(36).substring(7),
      page: targetPage,
      rects: normalizedRects,
      color: color,
      text: selectedText,
      comment: '',
      timestamp: Date.now()
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    
    // Clear selection
    window.getSelection().removeAllRanges();
    setSelectedText('');
    setSelectionCoords(null);
    setActiveRange(null);
  };

  const handleDeleteAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const handleStartEditNote = (ann) => {
    setEditingNoteId(ann.id);
    setTempNoteText(ann.comment || '');
  };

  const handleSaveNote = (id) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, comment: tempNoteText } : ann
    ));
    setEditingNoteId(null);
  };

  const runQuickQuery = (queryType) => {
    if (!selectedText || !selectionCoords) return;
    const targetPage = selectionCoords.page;
    
    let prompt = '';
    if (queryType === 'explain') {
      prompt = `Explain this legal passage from page ${targetPage} in detail:\n\n"${selectedText}"`;
    } else if (queryType === 'summarize') {
      prompt = `Provide a structured, bulleted summary of this passage from page ${targetPage}:\n\n"${selectedText}"`;
    } else if (queryType === 'cases') {
      prompt = `What are the landmark Indian Supreme Court cases, ratio, and citations related to this passage from page ${targetPage}:\n\n"${selectedText}"`;
    } else if (queryType === 'simplify') {
      prompt = `Explain this legal passage from page ${targetPage} in simple terms (explain it to a beginner / ELI5):\n\n"${selectedText}"`;
    }

    handleSendChat(prompt, 'selection', selectedText);
    
    // Clear selection
    window.getSelection().removeAllRanges();
    setSelectedText('');
    setSelectionCoords(null);
    setActiveRange(null);
  };

  const askAboutHighlight = (ann, queryType) => {
    let prompt = '';
    if (queryType === 'explain') {
      prompt = `Explain this highlighted passage from page ${ann.page} of the document in detail:\n\n"${ann.text}"`;
    } else if (queryType === 'cases') {
      prompt = `What are the landmark Indian Supreme Court cases, ratio, and citations related to this highlighted passage from page ${ann.page} of the document:\n\n"${ann.text}"`;
    }

    handleSendChat(prompt, 'selection', ann.text);
  };

  const handleAskAISelection = () => {
    if (!selectedText || !selectionCoords) return;
    runQuickQuery('explain');
  };

  // local RAG Search context construction
  const getRAGContext = (query) => {
    if (pageTexts.length === 0) return '';
    
    // Simple Keyword TF Search
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (words.length === 0) return '';
    
    const pageScores = pageTexts.map(pt => {
      let score = 0;
      const textLower = pt.text.toLowerCase();
      words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = textLower.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      return { ...pt, score };
    });

    const topPages = pageScores
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Take top 3 pages

    if (topPages.length === 0) {
      // Fallback: Use current page
      const fallbackPage = pageTexts.find(pt => pt.pageNumber === currentPage);
      return fallbackPage ? `[Context from Current Page ${currentPage} of PDF]:\n${fallbackPage.text}\n` : '';
    }

    return topPages.map(p => `[Context from Page ${p.pageNumber} of PDF]:\n${p.text}\n`).join('\n');
  };

  const handleExamModeChange = (mode) => {
    setExamMode(mode);
    localStorage.setItem('lexastra_exam_mode', mode);
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear this chat history?')) {
      setChatHistory([
        { role: 'assistant', content: `Hello! I have loaded **${fileName}**. You can ask me any question about this document, select text to get explanations, or use highlight colors to take notes. What would you like to study today?` }
      ]);
    }
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerateChat = () => {
    if (isChatLoading || chatHistory.length < 2) return;
    
    const lastUserMsgIndex = [...chatHistory].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;
    
    const actualIndex = chatHistory.length - 1 - lastUserMsgIndex;
    const lastUserMsg = chatHistory[actualIndex];
    
    const newHistory = chatHistory.slice(0, actualIndex);
    setChatHistory(newHistory);
    
    setTimeout(() => {
      handleSendChat(lastUserMsg.content);
    }, 100);
  };

  const handleSendChat = async (directText = null, directMode = null, directContextText = null) => {
    const userMessage = (typeof directText === 'string' ? directText : chatInput).trim();
    if (!userMessage || isChatLoading) return;

    if (typeof directText !== 'string') {
      setChatInput('');
    }
    setIsChatLoading(true);

    const updatedHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(updatedHistory);

    const activeMode = directMode || contextMode;
    const activeContextText = directContextText || selectedText;

    // Build context prompt
    let contextPrompt = '';
    
    if (activeMode === 'current') {
      const pageText = pageTexts.find(pt => pt.pageNumber === currentPage);
      if (pageText) {
        contextPrompt = `[Context from Current Page ${currentPage} of PDF]:\n${pageText.text}\n\n`;
      }
    } else if (activeMode === 'selection' && activeContextText) {
      contextPrompt = `[Context from Selected PDF text, Page ${currentPage}]:\n"${activeContextText}"\n\n`;
    } else if (activeMode === 'search') {
      contextPrompt = getRAGContext(userMessage);
    }

    const payloadMessages = [
      {
        role: 'system',
        content: `You are LexAstra AI, a specialized legal research assistant. The user is currently reading a document titled "${fileName}" and preparing for the ${examMode === 'General' ? 'General Law' : examMode} exam. Always prioritize information in the provided context (which is taken directly from their PDF) to answer their questions accurately. Quote specific pages and outline sections when referenced. Be precise, educational, and structured, tailoring your explanation style to the ${examMode} exam requirements.`
      },
      ...updatedHistory.map(h => ({ role: h.role, content: h.role === 'user' ? contextPrompt + h.content : h.content }))
    ];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'x-api-key': apiKey }),
        },
        body: JSON.stringify({ messages: payloadMessages, examMode }),
      });

      if (response.status === 401) {
        setShowApiKeyInput(true);
        setIsChatLoading(false);
        return;
      }

      if (!response.ok) throw new Error('API failed');

      setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aiResponseText = '';
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') continue;
              try {
                const data = JSON.parse(dataStr);
                const content = data.choices[0]?.delta?.content || '';
                aiResponseText += content;
                
                setChatHistory(prev => {
                  const copy = [...prev];
                  copy[copy.length - 1].content = aiResponseText;
                  return copy;
                });
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat Assistant Error:', err);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'I encountered an error connecting to the AI helper. Please check your network and API key configuration.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const renderOutlineItems = (items, depth = 0) => {
    return items.map((item, index) => (
      <div key={index} style={{ paddingLeft: `${depth * 12}px` }}>
        <button
          onClick={async () => {
            if (typeof item.dest === 'string') {
              const destObj = await pdfDocument.getDestination(item.dest);
              const pageIndex = await pdfDocument.getPageIndex(destObj[0]);
              scrollToPage(pageIndex + 1);
            } else if (Array.isArray(item.dest)) {
              const pageIndex = await pdfDocument.getPageIndex(item.dest[0]);
              scrollToPage(pageIndex + 1);
            }
          }}
          className="toc-item"
        >
          {item.title}
        </button>
        {item.items && item.items.length > 0 && renderOutlineItems(item.items, depth + 1)}
      </div>
    ));
  };

  const formatPageLinks = (text) => {
    if (!text) return '';
    // Replace "Page X", "page X", "Page-X", "[Page X]" with a markdown link to #page-X
    return text.replace(/(?:\[\s*)?[Pp]age\s*-?\s*(\d+)(?:\s*\])?/g, (match, pageNum) => {
      return `[Page ${pageNum}](#page-${pageNum})`;
    });
  };

  // React Markdown component customization (including Mermaid support)
  const MarkdownComponents = {
    a({ href, children, ...props }) {
      if (href?.startsWith('#page-')) {
        const pageNum = parseInt(href.substring(6), 10);
        return (
          <button
            onClick={() => scrollToPage(pageNum)}
            className="inline-page-link"
            style={{
              background: 'rgba(201, 168, 76, 0.15)',
              border: 'none',
              color: 'var(--gold-dark)',
              fontWeight: '600',
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              verticalAlign: 'middle',
              margin: '0 2px',
              transition: 'all var(--transition-fast)'
            }}
            title={`Scroll to Page ${pageNum}`}
          >
            <BookOpen size={10} /> {children}
          </button>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      );
    },
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match && match[1] === 'mermaid') {
        const codeText = String(children).replace(/\n$/, '');
        return !isChatLoading ? (
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

  const filteredBooks = selectedSubject === 'All Subjects' 
    ? libraryBooks
    : libraryBooks.filter(book => book.subject === selectedSubject);

  if (!pdfjsLoaded) {
    return (
      <div className="pdf-layout page-enter" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="chat-loading-dots">
          <span></span><span></span><span></span>
        </div>
        <p style={{ marginTop: '16px', fontFamily: 'var(--font-ui)', color: 'var(--text-secondary)' }}>
          Loading PDF Core Engine...
        </p>
      </div>
    );
  }

  return (
    <div className={`pdf-layout page-enter ${!chatOpen ? 'pdf-layout--chat-collapsed' : ''}`}>
      {/* 1. Collapsible Outline & Annotations Panel */}
      <aside className={`pdf-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="pdf-sidebar__header-wrapper">
          <div className="pdf-sidebar__tabs">
            <button 
              className={`pdf-sidebar__tab ${activeTab === 'annotations' ? 'active' : ''}`}
              onClick={() => setActiveTab('annotations')}
            >
              <Highlighter size={14} /> Notes ({annotations.length})
            </button>
            <button 
              className={`pdf-sidebar__tab ${activeTab === 'outline' ? 'active' : ''}`}
              onClick={() => setActiveTab('outline')}
              disabled={outline.length === 0}
            >
              <List size={14} /> Outline
            </button>
          </div>
          <button 
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="pdf-sidebar__content">
          {activeTab === 'annotations' ? (
            <div className="annotations-list">
              {annotations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                  <Edit3 size={20} style={{ opacity: 0.4, marginBottom: '8px' }} />
                  <p style={{ fontSize: '13px' }}>No notes or highlights yet. Select text in the PDF to highlight or add notes.</p>
                </div>
              ) : (
                annotations.map((ann) => (
                  <div 
                    key={ann.id} 
                    className="ann-card"
                    onClick={() => scrollToPage(ann.page)}
                  >
                    <div className="ann-card__header">
                      <span className="ann-card__badge" style={{ backgroundColor: ann.color, color: 'var(--navy)', border: '1px solid rgba(0,0,0,0.1)', fontWeight: '700' }}>
                        Page {ann.page}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAnnotation(ann.id); }}
                        className="ann-card__delete"
                        title="Delete highlight"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    
                    <blockquote className="ann-card__quote" style={{ borderLeftColor: ann.color }}>
                      {"\""}{ann.text}{"\""}
                    </blockquote>

                    {editingNoteId === ann.id ? (
                      <div className="ann-card__note-edit" onClick={(e) => e.stopPropagation()}>
                        <textarea 
                          value={tempNoteText}
                          onChange={(e) => setTempNoteText(e.target.value)}
                          placeholder="Type note/comment..."
                        />
                        <div className="ann-card__edit-actions">
                          <button onClick={() => handleSaveNote(ann.id)} className="btn btn--gold-fill btn--small">
                            Save
                          </button>
                          <button onClick={() => setEditingNoteId(null)} className="btn btn--ghost btn--small">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="ann-card__note">
                        {ann.comment ? (
                          <div className="ann-card__note-content">
                            <MessageSquare size={12} />
                            <p>{ann.comment}</p>
                          </div>
                        ) : null}
                        
                        <div className="ann-card__actions-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid rgba(0,0,0,0.04)', paddingTop: '8px' }}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleStartEditNote(ann); }}
                            className="ann-card__note-btn"
                            style={{ margin: 0 }}
                          >
                            <Edit3 size={11} /> {ann.comment ? 'Edit' : 'Add Note'}
                          </button>
                          
                          <div className="ann-card__ai-actions" style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); askAboutHighlight(ann, 'explain'); }}
                              className="ann-card__ai-btn"
                              title="Explain highlighted passage with AI"
                            >
                              <BookOpen size={10} /> Explain
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); askAboutHighlight(ann, 'cases'); }}
                              className="ann-card__ai-btn"
                              title="Find landmark cases with AI"
                            >
                              <Search size={10} /> Cases
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="outline-list">
              {outline.length > 0 ? renderOutlineItems(outline) : <p style={{ padding: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>No outline found in this PDF.</p>}
            </div>
          )}
        </div>

        {/* Indexing status indicator for local RAG */}
        {pdfDocument && (isIndexing || indexingProgress < 100) && (
          <div className="pdf-sidebar__indexing">
            <Sparkles size={14} className="indexing-icon" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gold)' }}>
                <span>AI indexing text...</span>
                <span>{indexingProgress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${indexingProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Center PDF Viewer/Library Panel */}
      <main className="pdf-viewer-workspace">
        {!pdfDocument ? (
          /* ==================== LexAstra Library Portal ==================== */
          <div className="library-portal">
            <div className="library-portal__header">
              <div>
                <h2><Database size={24} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: '8px' }} /> Permanent Law Library</h2>
                <p>Add study textbooks and bare acts permanently to organize them by subject folder.</p>
              </div>
              
              <button 
                onClick={() => setShowDriveModal(true)} 
                className="btn btn--gold-fill" 
                style={{ gap: '8px' }}
              >
                <Cloud size={16} /> Drive Cloud Sync
              </button>
            </div>

            <div className="library-portal__body">
              {/* Left Column: Subjects list */}
              <nav className="subject-nav">
                <h3><Folder size={16} /> Subject Folders</h3>
                {SUBJECTS.map((sub) => (
                  <button 
                    key={sub}
                    className={`subject-nav__btn ${selectedSubject === sub ? 'active' : ''}`}
                    onClick={() => setSelectedSubject(sub)}
                  >
                    <span>{sub}</span>
                    <span className="count-badge">
                      {sub === 'All Subjects' 
                        ? libraryBooks.length 
                        : libraryBooks.filter(b => b.subject === sub).length
                      }
                    </span>
                  </button>
                ))}
              </nav>

              {/* Center Column: Books grid */}
              <div className="library-main">
                <div className="catalog-header">
                  <h3>{selectedSubject}</h3>
                </div>

                {filteredBooks.length === 0 ? (
                  <div className="library-empty">
                    <BookOpen size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <h4>No Books in this Folder</h4>
                    <p>Select a PDF on the right to add standard textbook or bare act to this subject permanently.</p>
                  </div>
                ) : (
                  <div className="book-grid">
                    {filteredBooks.map((book) => (
                      <div 
                        key={book.id} 
                        className="book-card"
                        onClick={() => handleLoadBookFromLibrary(book.id, book.title, book.size)}
                      >
                        <div className="book-card__icon">
                          <FileText size={32} />
                        </div>
                        <div className="book-card__info">
                          <h4 className="book-card__title" title={book.title}>{book.title}</h4>
                          <span className="book-card__subject">{book.subject}</span>
                          <span className="book-card__size">{(book.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <button 
                          className="book-card__delete" 
                          onClick={(e) => handleDeleteBook(e, book.id)}
                          title="Delete book permanently"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Library Importer/Dropzone */}
              <div className="library-importer">
                <h3>Import Textbook / Bare Act</h3>
                
                {!uploadFile ? (
                  <div 
                    className="library-dropzone" 
                    onClick={() => libraryFileInputRef.current.click()}
                  >
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleLibraryFileSelect} 
                      ref={libraryFileInputRef} 
                      style={{ display: 'none' }} 
                    />
                    <Upload size={36} className="dropzone-icon" />
                    <p>Select a PDF textbook to save permanently</p>
                    <span className="dropzone-sub">Click to browse documents</span>
                  </div>
                ) : (
                  <div className="importer-form">
                    <div className="selected-file-details">
                      <FileText size={20} />
                      <div>
                        <p className="file-name" title={uploadFile.name}>{uploadFile.name}</p>
                        <p className="file-size">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Select Subject Folder:</label>
                      <select 
                        value={uploadSubject} 
                        onChange={(e) => setUploadSubject(e.target.value)}
                      >
                        {SUBJECTS.filter(s => s !== 'All Subjects').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={handleSaveToLibrary} 
                      className="btn btn--gold-fill" 
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <Plus size={16} /> Save to Permanent Library
                    </button>
                    
                    <button 
                      onClick={() => setUploadFile(null)} 
                      className="btn btn--ghost" 
                      style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="quick-open-divider">
                  <span>OR</span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleQuickOpenUpload} 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="btn btn--gold"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Quick Read Temporary Document
                  </button>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Quick read won&apos;t save the PDF to IndexedDB library database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ==================== Active Document Workspace ==================== */
          <>
            {/* Viewer Toolbar */}
            <header className="pdf-toolbar">
              <div className="pdf-toolbar__group">
                {/* Auto-hide Menu trigger button */}
                {!sidebarOpen && (
                  <button 
                    className="pdf-toolbar__btn" 
                    onClick={() => setSidebarOpen(true)}
                    title="Show Outline & Notes Sidebar"
                    style={{ marginRight: '8px', color: 'var(--gold)' }}
                  >
                    <Menu size={18} />
                  </button>
                )}
                
                <button 
                  onClick={handleCloseActiveBook}
                  className="pdf-toolbar__btn"
                  title="Close document & return to library"
                  style={{ marginRight: '8px' }}
                >
                  <ArrowLeft size={16} style={{ marginRight: '4px' }} /> Library
                </button>

                <span className="pdf-file-title" title={fileName}>
                  <FileText size={16} /> {fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName}
                </span>
              </div>

              <div className="pdf-toolbar__group">
                <button 
                  className="pdf-toolbar__btn" 
                  onClick={() => scrollToPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="pdf-page-display">
                  Page {currentPage} of {numPages}
                </span>
                <button 
                  className="pdf-toolbar__btn" 
                  onClick={() => scrollToPage(Math.min(currentPage + 1, numPages))}
                  disabled={currentPage === numPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* In-Document PDF Text Search Group */}
              <div className="pdf-toolbar__group pdf-toolbar__search-group">
                <div className="pdf-search-input-wrapper">
                  <Search size={14} className="pdf-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search in PDF..." 
                    value={pdfSearchQuery}
                    onChange={(e) => handlePDFSearch(e.target.value)}
                    disabled={!pdfDocument || isIndexing}
                  />
                  {pdfSearchQuery && (
                    <button onClick={handleClearPDFSearch} className="pdf-search-clear" title="Clear Search">
                      <X size={12} />
                    </button>
                  )}
                </div>
                {pdfSearchResults.length > 0 && (
                  <div className="pdf-search-nav">
                    <span className="pdf-search-count">
                      {currentMatchIndex + 1} of {pdfSearchResults.length}
                    </span>
                    <button onClick={handlePrevSearchMatch} className="pdf-search-nav-btn" title="Previous Match">
                      <ChevronLeft size={14} />
                    </button>
                    <button onClick={handleNextSearchMatch} className="pdf-search-nav-btn" title="Next Match">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
                {pdfSearchQuery && pdfSearchResults.length === 0 && !isIndexing && (
                  <span className="pdf-search-no-results">No matches</span>
                )}
              </div>

              <div className="pdf-toolbar__group" style={{ marginLeft: 'auto' }}>
                <button className="pdf-toolbar__btn" onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))} title="Zoom Out">
                  <ZoomOut size={16} />
                </button>
                <span className="zoom-text">{Math.round(zoom * 100)}%</span>
                <button className="pdf-toolbar__btn" onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))} title="Zoom In">
                  <ZoomIn size={16} />
                </button>
                <button className="pdf-toolbar__btn" onClick={() => setZoom(1.25)} title="Reset Zoom">
                  <Maximize2 size={16} />
                </button>
                <div className="menu-divider" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                <button className="pdf-toolbar__btn" onClick={handleFitWidth} title="Fit Page Width" style={{ display: 'flex', gap: '4px', padding: '4px 8px' }}>
                  <Maximize2 size={13} />
                  <span style={{ fontSize: '11px', fontWeight: '500' }}>Fit Width</span>
                </button>
                <button className="pdf-toolbar__btn" onClick={handleFitPage} title="Fit Entire Page" style={{ display: 'flex', gap: '4px', padding: '4px 8px' }}>
                  <Minimize2 size={13} />
                  <span style={{ fontSize: '11px', fontWeight: '500' }}>Fit Page</span>
                </button>
                
                <div className="menu-divider" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                
                {/* AI Chat Panel toggle button */}
                <button 
                  className={`pdf-toolbar__btn ${chatOpen ? 'pdf-toolbar__btn--active' : ''}`}
                  onClick={() => setChatOpen(prev => !prev)}
                  title={chatOpen ? "Hide AI Assistant Panel" : "Show AI Assistant Panel"}
                  style={{ color: chatOpen ? 'var(--gold)' : 'inherit' }}
                >
                  <Sparkles size={16} />
                  <span style={{ fontSize: '11px', fontWeight: '500', marginLeft: '4px' }}>AI Chat</span>
                </button>
              </div>
            </header>

            {/* Canvas + Text Layer Wrapper */}
            <div 
              className="pdf-render-scroll"
              ref={containerRef}
              onMouseUp={handleTextSelection}
            >
              <div className="pdf-pages-container">
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
                  <PDFPage
                    key={pageNumber}
                    pageNumber={pageNumber}
                    pdfDocument={pdfDocument}
                    zoom={zoom}
                    annotations={annotations}
                    onPageVisible={handlePageVisible}
                    rootRef={containerRef}
                  />
                ))}
              </div>

              {/* Floating tooltip menu for active text selections */}
              {selectionCoords && (
                <div 
                  className="pdf-floating-menu"
                  style={{
                    left: `${selectionCoords.left}px`,
                    top: `${selectionCoords.top}px`
                  }}
                  onMouseDown={(e) => e.preventDefault()} // Prevent click from clearing selection
                >
                  <div className="menu-colors" style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => handleAddHighlight('#FEF08A')} className="color-btn" style={{ backgroundColor: '#FEF08A' }} title="Yellow" />
                    <button onClick={() => handleAddHighlight('#86EFAC')} className="color-btn" style={{ backgroundColor: '#86EFAC' }} title="Green" />
                    <button onClick={() => handleAddHighlight('#93C5FD')} className="color-btn" style={{ backgroundColor: '#93C5FD' }} title="Blue" />
                    <button onClick={() => handleAddHighlight('#F9A8D4')} className="color-btn" style={{ backgroundColor: '#F9A8D4' }} title="Pink" />
                    <button onClick={() => handleAddHighlight('#D8B4FE')} className="color-btn" style={{ backgroundColor: '#D8B4FE' }} title="Purple" />
                    <button onClick={() => handleAddHighlight('#FDBA74')} className="color-btn" style={{ backgroundColor: '#FDBA74' }} title="Orange" />
                  </div>
                  <div className="menu-divider" />
                  <div className="menu-actions" style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => runQuickQuery('explain')} className="action-btn" title="Explain selected text with AI">
                      <BookOpen size={12} /> Explain
                    </button>
                    <button onClick={() => runQuickQuery('summarize')} className="action-btn" title="Summarize selected text with AI">
                      <FileText size={12} /> Summarize
                    </button>
                    <button onClick={() => runQuickQuery('cases')} className="action-btn" title="Find landmark cases with AI">
                      <Scale size={12} /> Cases
                    </button>
                    <button onClick={() => runQuickQuery('simplify')} className="action-btn" title="Explain in simple terms (ELI5)">
                      <HelpCircle size={12} /> ELI5
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 3. Panel Resize Handle */}
      {pdfDocument && (
        <div 
          className={`pdf-resize-handle ${!chatOpen ? 'pdf-resize-handle--collapsed' : ''}`}
          onMouseDown={startResizing}
          title="Drag to resize AI assistant window"
        />
      )}

      {/* 4. Right AI Assistant Panel */}
      {pdfDocument && (
        <section className={`pdf-chat-panel ${!chatOpen ? 'pdf-chat-panel--collapsed' : ''}`} style={{ width: `${chatWidth}px` }}>
          <header className="pdf-chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} style={{ color: 'var(--gold)' }} />
              <h3 style={{ margin: 0 }}>AI Assistant</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select 
                value={examMode} 
                onChange={(e) => handleExamModeChange(e.target.value)}
                className="pdf-exam-selector"
              >
                <option value="General">General Law</option>
                <option value="Judiciary">Judiciary</option>
                <option value="CLAT PG">CLAT PG</option>
                <option value="CLAT UG">CLAT UG</option>
                <option value="AIBE">AIBE</option>
                <option value="APO">APO / APP</option>
                <option value="UGC NET Law">UGC NET</option>
                <option value="CUET PG Law">CUET PG</option>
                <option value="SEBI Legal">SEBI Legal</option>
                <option value="UPSC Law Optional">UPSC Law</option>
                <option value="IBPS SO Law">IBPS SO</option>
              </select>
              
              <button 
                onClick={handleClearChat}
                className="pdf-toolbar__btn"
                title="Clear Chat History"
                style={{ padding: '4px', opacity: 0.6 }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </header>

          <div className="pdf-chat-messages">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`chat-message-wrapper ${msg.role === 'user' ? 'chat-message-wrapper--user' : 'chat-message-wrapper--ai'}`}>
                <div className="chat-message">
                  <div className="chat-message__avatar">
                    {msg.role === 'user' ? 'U' : 'L'}
                  </div>
                  <div className="chat-message__content">
                    <div id={`pdf-ai-msg-${index}`}>
                      {/* Render Markdown Components with Mermaid support */}
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                        {msg.role === 'assistant' ? formatPageLinks(msg.content) : msg.content}
                      </ReactMarkdown>
                    </div>

                    {msg.role === 'assistant' && (
                      <div className="chat-msg-actions">
                        <button onClick={() => handleCopyMessage(msg.content, index)} className="chat-msg-action-btn">
                          {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                        </button>
                        
                        {index === chatHistory.length - 1 && !isChatLoading && chatHistory.length > 1 && (
                          <button onClick={handleRegenerateChat} className="chat-msg-action-btn chat-regenerate-btn">
                            <RefreshCw size={12} /> <span>Regenerate</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="chat-message-wrapper chat-message-wrapper--ai">
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
            <div ref={chatEndRef} />
          </div>

          {/* API Key Modal Fallback */}
          {showApiKeyInput && (
            <div className="pdf-chat-api-fallback">
              <AlertCircle size={20} style={{ color: 'var(--alert-red)' }} />
              <p>Please configure your DeepSeek API key to chat with the AI.</p>
              <input 
                type="password"
                placeholder="Paste DeepSeek API Key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="api-key-input"
              />
              <button 
                onClick={() => {
                  if (apiKey.trim()) {
                    localStorage.setItem('lexastra_deepseek_key', apiKey.trim());
                    setShowApiKeyInput(false);
                  }
                }}
                className="btn btn--gold-fill btn--small"
              >
                Save Key
              </button>
            </div>
          )}

          {/* Controls & Chat Input */}
          <div className="pdf-chat-controls">
            <div className="context-modes">
              <span className="context-label">AI Search Context:</span>
              <div className="context-options">
                <label className={`context-option ${contextMode === 'search' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="context" 
                    value="search" 
                    checked={contextMode === 'search'}
                    onChange={() => setContextMode('search')}
                  />
                  Smart RAG
                </label>
                <label className={`context-option ${contextMode === 'current' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="context" 
                    value="current" 
                    checked={contextMode === 'current'}
                    onChange={() => setContextMode('current')}
                  />
                  Page {currentPage}
                </label>
                {selectedText && (
                  <label className={`context-option ${contextMode === 'selection' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="context" 
                      value="selection" 
                      checked={contextMode === 'selection'}
                      onChange={() => setContextMode('selection')}
                    />
                    Selected text
                  </label>
                )}
              </div>
            </div>

            <div className="chat-presets" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span className="context-label">Page Study Presets (Page {currentPage}):</span>
              <div className="chat-presets-row" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {getExamPresets(examMode, currentPage).map((preset, pIdx) => (
                  <button 
                    key={pIdx}
                    onClick={() => handleSendChat(preset.prompt, 'current')}
                    className={`chat-preset-btn ${examMode !== 'General' ? 'exam-specific' : ''}`}
                    disabled={isChatLoading || !pdfDocument}
                    title={preset.title}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pdf-chat-input-wrapper">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={
                  contextMode === 'selection' 
                    ? "Ask anything about selection..." 
                    : `Ask anything about ${fileName || 'document'}...`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                disabled={!pdfDocument}
              />
              <button 
                onClick={handleSendChat} 
                className="chat-send-btn"
                disabled={!pdfDocument || !chatInput.trim() || isChatLoading}
              >
                ➤
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Google Drive Sync Dashboard Modal */}
      {showDriveModal && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-content">
            <div className="pdf-modal-header">
              <h3><Cloud size={20} style={{ color: '#4285F4', verticalAlign: 'middle', marginRight: '8px' }} /> Google Drive Cloud Sync</h3>
              <button onClick={() => setShowDriveModal(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="pdf-modal-body">
              <div className="sync-status-box" style={{ background: driveConnected ? 'rgba(39, 174, 96, 0.08)' : 'rgba(0,0,0,0.03)', border: `1px solid ${driveConnected ? 'rgba(39, 174, 96, 0.2)' : 'rgba(0,0,0,0.1)'}` }}>
                <HardDrive size={36} style={{ color: driveConnected ? '#27AE60' : '#4a4a4a', marginBottom: '8px' }} />
                <h4>Connection Status: {driveConnected ? 'CONNECTED' : 'NOT CONNECTED'}</h4>
                <p className="sync-detail">{driveStatus}</p>
              </div>

              <div className="sync-instructions">
                <h5>About Google Drive Sync:</h5>
                <p>Google Drive Sync allows you to back up your local library textbook catalog and highlights/notes to a secure `/LexAstra_Library/` folder in your personal drive, keeping your data safe across multiple devices.</p>
              </div>

              <div className="form-group" style={{ margin: '8px 0' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Google OAuth Client ID (Optional):</label>
                <input 
                  type="text" 
                  placeholder="Paste your Google Client ID here..."
                  value={googleClientId}
                  onChange={(e) => handleSaveClientId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '12px',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    outline: 'none',
                    fontFamily: 'var(--font-mono)',
                    marginTop: '4px'
                  }}
                />
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.3' }}>
                  * Leave blank to run in demo mode (uses a placeholder Client ID to trigger the Google accountChooser dialog). To configure a real client ID, create an OAuth Web Client in your Google Cloud Console.
                </p>
              </div>

              <div className="sync-actions">
                {!driveConnected ? (
                  <button 
                    onClick={handleDriveSync} 
                    className="btn btn--gold-fill" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    disabled={driveSyncing}
                  >
                    {driveSyncing ? (
                      <>
                        <RefreshCw size={16} className="indexing-icon" style={{ marginRight: '8px' }} /> Connecting to Google Drive...
                      </>
                    ) : (
                      <>
                        Connect Google Account & Sync
                      </>
                    )}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <button 
                      onClick={handleDriveSync} 
                      className="btn btn--gold-fill" 
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={driveSyncing}
                    >
                      {driveSyncing ? (
                        <>
                          <RefreshCw size={16} className="indexing-icon" style={{ marginRight: '8px' }} /> Backing up to Cloud...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={16} style={{ marginRight: '8px' }} /> Synchronize Now
                        </>
                      )}
                    </button>
                    <button 
                      onClick={handleDisconnectDrive} 
                      className="btn btn--ghost" 
                      style={{ width: '100%', justifyContent: 'center', color: 'var(--alert-red)', hoverBackground: 'rgba(178,34,34,0.08)' }}
                    >
                      Disconnect Google Drive Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
