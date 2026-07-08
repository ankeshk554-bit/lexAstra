'use client';

import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { 
  Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Sparkles, Highlighter, Edit3, Trash2, Check, MessageSquare, 
  BookOpen, Search, Copy, List, Maximize2, AlertCircle, FileText,
  Menu, X, Database, Folder, Plus, RefreshCw, Cloud, ArrowLeft,
  ChevronRightSquare, HelpCircle, HardDrive, Scale, Minimize2, Download,
  PanelLeftOpen, PanelLeftClose, Settings, ChevronDown, ChevronUp
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
  rootRef,
  onHighlightClick
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

  const handlePageClick = (e) => {
    // If the user has a text selection active, do not open highlight popover
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) return;

    if (!pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    // Find if click lands inside any highlight box
    const clickedAnn = pageAnnotations.find(ann => {
      return ann.rects.some(r => {
        // Add 3px padding for easier click targeting
        return x >= (r.left - 3) && x <= (r.left + r.width + 3) &&
               y >= (r.top - 3) && y <= (r.top + r.height + 3);
      });
    });

    console.log(`[PDFPage] Click on page ${pageNumber} at coordinates: x=${x.toFixed(1)}, y=${y.toFixed(1)} (normalized). Found highlight?`, clickedAnn ? "Yes" : "No");

    if (clickedAnn) {
      e.stopPropagation();
      onHighlightClick(clickedAnn, e);
    }
  };

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      ref={pageContainerRef}
      className="pdf-page-container"
      data-page={pageNumber}
      onClick={handlePageClick}
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
          <canvas ref={canvasRef} style={{ display: 'block', position: 'relative', zIndex: 1 }} />
          <div className="textLayer" ref={textLayerRef} style={{ zIndex: 3 }} />
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
                  pointerEvents: 'none', // Revert to none so text selection is 100% fluent
                  mixBlendMode: 'multiply',
                  borderRadius: '3px',
                  opacity: 0.85,
                  zIndex: 2 // Positioned between Canvas (zIndex 1) and textLayer (zIndex 3)
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
  if (prevProps.onHighlightClick !== nextProps.onHighlightClick) return false;
  
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
      { label: '🧩 Extract Core Elements', prompt: `Break down the legal provisions on page ${currentPage} into a structured list of essential ingredients (e.g., mens rea, actus reus, conditions precedent). Use bullet points for clarity.`, title: 'Breakdown statutory ingredients' },
      { label: '⚖️ Find Landmark Cases', prompt: `Identify 3-5 landmark Indian Supreme Court or High Court cases relevant to the sections on page ${currentPage}. For each case, provide the Citation and a concise 1-sentence Ratio Decidendi.`, title: 'Find related landmark judgments' },
      { label: '⚠️ Exceptions & Provisos', prompt: `List all the exceptions, provisos, and legal defenses mentioned or applicable to the provisions on page ${currentPage}. Explain when the general rule does NOT apply.`, title: 'Analyze exceptions and defenses' },
      { label: '💡 Practical Scenario', prompt: `Create a practical, real-world hypothetical scenario involving parties 'A' and 'B' to illustrate how the law on page ${currentPage} is applied in court. Provide the solution based on the text.`, title: 'Illustrate with a hypothetical scenario' },
      { label: '📊 Procedural Flowchart', prompt: `Analyze the procedural steps or legal hierarchy discussed on page ${currentPage} and render it as a Mermaid flowchart for quick visual memorization.`, title: 'Draw flowchart of legal process on page' }
    ],
    'Judiciary': [
      { label: '📝 Frame Mains Question', prompt: `Frame a structured Mains examination question based on the legal principles on page ${currentPage} and write a model answer following the standard format: Introduction -> Statutory Provision -> Essential Ingredients -> Exceptions -> Landmark Cases -> Conclusion.`, title: 'Frame a Mains Judiciary question' },
      { label: '⚖️ Case Law Application', prompt: `Analyze the provisions on page ${currentPage} and list 3-5 landmark Supreme Court cases that apply these provisions, including ratio decidendi and citation.`, title: 'Find case laws for these provisions' },
      { label: '📜 Judgment Format', prompt: `Explain how the legal provisions on page ${currentPage} are applied practically by a judge when framing issues or charges in a civil or criminal judgment.`, title: 'Judgment writing application' }
    ],
    'CLAT PG': [
      { label: '🧠 Jurisprudential Analysis', prompt: `Analyze the concepts on page ${currentPage} from a jurisprudential perspective. Identify the ratio decidendi vs obiter dicta, and trace their constitutional or historical evolution.`, title: 'Analytical case-law analysis' },
      { label: '🏛️ Constitutional Validity', prompt: `Discuss the constitutional validity of the provisions on page ${currentPage} using the lens of constitutional morality, fundamental rights, and living constitution doctrine.`, title: 'Constitutional morality critique' }
    ],
    'CLAT UG': [
      { label: '💡 Legal Aptitude Guide', prompt: `Explain the legal principles on page ${currentPage} in simple, accessible terms for a beginner, and provide 2 mock scenario-based questions (Facts + Principle) to test legal reasoning.`, title: 'Simplify for Legal Aptitude' },
      { label: '📖 Passage Summary', prompt: `Create a passage-based comprehension summary of page ${currentPage} with key takeaways, designed for a reading comprehension test.`, title: 'Passage comprehension summary' }
    ],
    'AIBE': [
      { label: '📖 Bare Act Navigator', prompt: `Guide me on how to quickly locate and navigate the provisions on page ${currentPage} within the Bare Act Index during the open-book AIBE exam. List key sections and search keywords.`, title: 'Open book bare act navigation tips' },
      { label: '⚖️ Quick Rule Index', prompt: `Summarize the rules and exceptions on page ${currentPage} in a direct, easy-to-refer format tailored for objective multiple-choice questions.`, title: 'Quick reference rules' }
    ],
    'APO': [
      { label: '👮 Prosecution Steps', prompt: `Explain the procedural steps and burden of proof a prosecution officer must establish under the provisions on page ${currentPage}. Detail the evidentiary requirements.`, title: 'Prosecution steps analysis' },
      { label: '🔍 BPSC APO MCQs', prompt: `Based on page ${currentPage}, formulate 5 BPSC APO-style multiple-choice questions testing exact Section numbers, statutory definition clauses, or specific acts details (with IPC/CrPC equivalents). Provide answers with detailed reasons.`, title: 'APO Section & Definition Quiz' },
      { label: '⚖️ Landmark Ratios', prompt: `Formulate 3 mock questions based on the landmark case laws related to the concepts on page ${currentPage}, focusing on matching case names to specific legal ratios or doctrines. Provide the model solution.`, title: 'APO Landmark Cases Quiz' }
    ],
    'UGC NET Law': [
      { label: '🎓 Theoretical Analysis', prompt: `Explain the theoretical underpinnings of the legal concepts on page ${currentPage}. Connect them to specific schools of jurisprudence (positivism, natural law, etc.) and cite relevant jurists.`, title: 'Academic theoretical analysis' },
      { label: '📋 Jurist Opinions', prompt: `List and explain the views of major jurists (Salmond, Austin, Hart, Kelsen) on the legal subjects discussed on page ${currentPage}.`, title: 'Jurist viewpoints reference' }
    ],
    'CUET PG Law': [
      { label: '⚖️ Distinction Table', prompt: `Create a comparative distinction table for the key legal concepts discussed on page ${currentPage} (e.g. distinguishing similar sounding terms or offences).`, title: 'Comparison table' },
      { label: '📝 Concept Definition', prompt: `Define the core legal terms on page ${currentPage} in a clear, precise format optimized for direct multiple-choice questions.`, title: 'Concept definition' }
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
  const [fitMode, setFitMode] = useState('width'); // 'width' | 'page' | 'custom'
  const [activeAnnotationMenu, setActiveAnnotationMenu] = useState(null); // { ann, left, top }
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  
  // Derived state: unique storage key for annotations
  const pdfKey = fileName ? `lexastra_pdf_${fileName.replace(/\s+/g, '_')}` : '';

  // AI Assistant States
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [contextMode, setContextMode] = useState('search'); // 'search' | 'current' | 'selection'
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_deepseek_api_key') || '';
    }
    return '';
  });
  const [hasCustomApiKey, setHasCustomApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('lexastra_deepseek_api_key');
    }
    return false;
  });

  const [examMode, setExamMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_exam_mode') || 'General';
    }
    return 'General';
  });

  // Readability Document Themes
  const [readerTheme, setReaderTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lexastra_reader_theme') || 'parchment';
    }
    return 'parchment';
  });

  useEffect(() => {
    localStorage.setItem('lexastra_reader_theme', readerTheme);
  }, [readerTheme]);

  // Study Guide & Flashcard States
  const [pageSummary, setPageSummary] = useState(null); // { page: number, summary: string }
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [flashcardDecks, setFlashcardDecks] = useState([]);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isDraftingNote, setIsDraftingNote] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showPresets, setShowPresets] = useState(true);

  // Refs
  const containerRef = useRef(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const libraryFileInputRef = useRef(null);
  const backupFileInputRef = useRef(null);

  const handleExportBackup = () => {
    try {
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('lexastra_') || key === 'lexastra_chat_sessions' || key === 'lexastra_google_user' || key === 'lexastra_exam_mode')) {
          backupData[key] = localStorage.getItem(key);
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
          if (key.startsWith('lexastra_') || key === 'lexastra_chat_sessions' || key === 'lexastra_google_user' || key === 'lexastra_exam_mode') {
            localStorage.setItem(key, backupData[key]);
            restoredCount++;
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

  // Load PDF.js and lock body scroll
  useEffect(() => {
    document.body.classList.add('full-screen-page');

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
    } else {
      setPdfjsLoaded(true);
    }

    return () => {
      document.body.classList.remove('full-screen-page');
      const pdfScript = document.querySelector('script[src*="pdf.min.js"]');
      if (pdfScript) document.body.removeChild(pdfScript);
    };
  }, []);

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
    let initialFlashcards = [];
    if (typeof window !== 'undefined' && key) {
      const storedAnns = localStorage.getItem(`${key}_anns`);
      if (storedAnns) {
        try {
          initialAnns = JSON.parse(storedAnns);
        } catch (e) {}
      }
      const storedCards = localStorage.getItem(`${key}_flashcards`);
      if (storedCards) {
        try {
          initialFlashcards = JSON.parse(storedCards);
        } catch (e) {}
      }
    }
    setAnnotations(initialAnns);
    setFlashcardDecks(initialFlashcards);
    setActiveFlashcardIndex(0);
    setIsFlashcardFlipped(false);
    setPageSummary(null);

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

  // Persist flashcards to local storage
  useEffect(() => {
    if (pdfKey && flashcardDecks.length >= 0) {
      localStorage.setItem(`${pdfKey}_flashcards`, JSON.stringify(flashcardDecks));
    }
  }, [flashcardDecks, pdfKey]);

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

  const recalculateZoom = useCallback(() => {
    if (!pdfDocument || !containerRef.current || isResizing.current) return;
    pdfDocument.getPage(currentPage).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth - 64; // pad space
      const containerHeight = containerRef.current.clientHeight - 64;
      
      if (fitMode === 'width') {
        const newZoom = containerWidth / viewport.width;
        setZoom(Math.round(newZoom * 100) / 100);
      } else if (fitMode === 'page') {
        const zoomWidth = containerWidth / viewport.width;
        const zoomHeight = containerHeight / viewport.height;
        const newZoom = Math.min(zoomWidth, zoomHeight);
        setZoom(Math.round(newZoom * 100) / 100);
      }
    }).catch(e => console.error('Error recalculating zoom:', e));
  }, [pdfDocument, currentPage, fitMode]);

  const handleFitWidth = useCallback(() => {
    setFitMode('width');
  }, []);

  const handleFitPage = useCallback(() => {
    setFitMode('page');
  }, []);

  // Update zoom when fitMode changes
  useEffect(() => {
    if (fitMode !== 'custom') {
      recalculateZoom();
    }
  }, [fitMode, recalculateZoom]);

  // Set up ResizeObserver to recalculate zoom on panel/window size changes
  useEffect(() => {
    if (!containerRef.current || !pdfDocument) return;

    const observer = new ResizeObserver(() => {
      if (isResizing.current) return;
      recalculateZoom();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [pdfDocument, recalculateZoom]);

  // Trigger zoom recalculation when panels open or close (after animation transition finishes)
  useEffect(() => {
    if (!pdfDocument) return;
    const timer = setTimeout(() => {
      recalculateZoom();
    }, 300); // Wait 300ms for CSS transition to complete
    return () => clearTimeout(timer);
  }, [sidebarOpen, chatOpen, bottomPanelOpen, pdfDocument, recalculateZoom]);

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
    setActiveAnnotationMenu(null);
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
      recalculateZoom();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Backup and restore helpers are defined above

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
      setActiveAnnotationMenu(null);
    }
  };

  const handleAddHighlight = (color) => {
    if (!activeRange || !containerRef.current || !selectionCoords) return;

    const targetPage = selectionCoords.page;
    const textLayerRect = selectionCoords.textLayerRect;
    const rawRects = Array.from(activeRange.getClientRects());
    // Filter out ghost rectangles (empty space at the end of lines generated by native selection)
    // Ghost rects typically have a large width and touch the right edge, or are simply empty filler.
    // A simple heuristic: if a rect's width is very large (e.g. > 200px) and it's not the only rect, 
    // or if we just constrain maxRight to the text layer bounds, it helps.
    // Actually, a better heuristic is to filter out rects that are purely empty space. 
    // Since we can't easily check text content per rect, we will filter out rects that have a width > 85% of the page
    // (since a single word is rarely that wide) UNLESS it's the only rect.
    const rects = rawRects.filter(r => rawRects.length === 1 || r.width < (textLayerRect.width * 0.85));
    
    const normalizedRects = [];

    // Group rects by approximate line to fix fragmented PDF text layer rects
    const lines = {};
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const nLeft = (rect.left - textLayerRect.left) / zoom;
      const nTop = (rect.top - textLayerRect.top) / zoom;
      const nWidth = rect.width / zoom;
      const nHeight = rect.height / zoom;
      
      // Group by top position, rounded to nearest 4px to account for slight vertical variations
      const lineKey = Math.round(nTop / 4) * 4;
      if (!lines[lineKey]) lines[lineKey] = [];
      lines[lineKey].push({ left: nLeft, top: nTop, width: nWidth, height: nHeight });
    }

    // Merge rects on the same line that are close to each other
    Object.keys(lines).forEach(key => {
      // Sort left-to-right
      const lineRects = lines[key].sort((a, b) => a.left - b.left);
      let currentMerge = { ...lineRects[0] };
      
      for (let i = 1; i < lineRects.length; i++) {
        const r = lineRects[i];
        // If horizontal gap is small (e.g. less than 25px scaled), merge them to create a uniform block
        const gap = r.left - (currentMerge.left + currentMerge.width);
        if (gap < 25) {
          const newRight = Math.max(currentMerge.left + currentMerge.width, r.left + r.width);
          currentMerge.top = Math.min(currentMerge.top, r.top);
          const maxBottom = Math.max(currentMerge.top + currentMerge.height, r.top + r.height);
          
          currentMerge.width = newRight - currentMerge.left;
          currentMerge.height = maxBottom - currentMerge.top;
        } else {
          normalizedRects.push(currentMerge);
          currentMerge = { ...r };
        }
      }
      normalizedRects.push(currentMerge);
    });

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

  const handleDeleteAnnotationConfirmed = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this highlight and note?')) {
      handleDeleteAnnotation(id);
    }
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

  const handleHighlightClick = useCallback((ann, e) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const left = e.clientX - containerRect.left;
    const top = e.clientY - containerRect.top + containerRef.current.scrollTop - 10;
    
    console.log(`[PDFReaderClient] Opening highlight popover menu for annotation ID: ${ann.id} on page ${ann.page} at relative left: ${left.toFixed(1)}, top: ${top.toFixed(1)}`);
    
    // Always query the latest annotation data from current state array
    setAnnotations(currentAnns => {
      const latestAnn = currentAnns.find(a => a.id === ann.id) || ann;
      setActiveAnnotationMenu({
        ann: latestAnn,
        left: Math.max(10, Math.min(left - 160, containerRect.width - 330)),
        top: Math.max(10, top - 180)
      });
      setTempNoteText(latestAnn.comment || '');
      return currentAnns;
    });

    setSelectionCoords(null);
  }, []);

  const handleUpdateAnnotationColor = (id, color) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, color } : ann
    ));
    setActiveAnnotationMenu(prev => {
      if (prev && prev.ann.id === id) {
        return {
          ...prev,
          ann: { ...prev.ann, color }
        };
      }
      return prev;
    });
  };

  const handleSaveNoteFromPopover = (id) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, comment: tempNoteText } : ann
    ));
    setActiveAnnotationMenu(prev => {
      if (prev && prev.ann.id === id) {
        return {
          ...prev,
          ann: { ...prev.ann, comment: tempNoteText }
        };
      }
      return prev;
    });
  };

  const handleDeleteAnnotationFromPopover = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this highlight and note?")) {
      handleDeleteAnnotation(id);
      setActiveAnnotationMenu(null);
    }
  };

  const runQuickQuery = (queryType) => {
    if (!selectedText || !selectionCoords) return;
    const targetPage = selectionCoords.page;
    const pageText = pageTexts.find(pt => pt.pageNumber === targetPage)?.text || '';
    
    let prompt = '';
    const contextPrefix = pageText ? `[Full Page Context for Reference]:\n${pageText}\n\n[Analyze this specific highlighted text]:\n"${selectedText}"\n\n` : `Highlighted text: "${selectedText}"\n\n`;

    if (queryType === 'explain') {
      prompt = `${contextPrefix}Analyze this highlighted text within the provided page context. Explain its legal effect, identify whether it constitutes a substantive right, procedural rule, or exception, and clarify its scope.`;
    } else if (queryType === 'summarize') {
      prompt = `${contextPrefix}Break down the highlighted statutory provision into a structured, numbered list of its essential ingredients (e.g., mens rea, actus reus, or conditions precedent).`;
    } else if (queryType === 'cases') {
      prompt = `${contextPrefix}Identify landmark or recent Supreme Court/High Court cases interpreting the highlighted clause/section within the provided context. Provide a brief ratio decidendi for each.`;
    } else if (queryType === 'simplify') {
      prompt = `${contextPrefix}Create a practical hypothetical scenario involving parties 'A' and 'B' (or relevant actors) to illustrate how the highlighted provision is applied in reality.`;
    }

    handleSendChat(prompt, 'selection', selectedText);
    
    // Clear selection
    window.getSelection().removeAllRanges();
    setSelectedText('');
    setSelectionCoords(null);
    setActiveRange(null);
  };

  const askAboutHighlight = (ann, queryType) => {
    const pageText = pageTexts.find(pt => pt.pageNumber === ann.page)?.text || '';
    const contextPrefix = pageText ? `[Full Page Context for Reference]:\n${pageText}\n\n[Analyze this specific highlighted text]:\n"${ann.text}"\n\n` : `Highlighted text: "${ann.text}"\n\n`;
    
    let prompt = '';
    if (queryType === 'explain') {
      prompt = `${contextPrefix}Analyze this highlighted text within the provided page context. Explain its legal effect, identify whether it constitutes a substantive right, procedural rule, or exception, and clarify its scope.`;
    } else if (queryType === 'cases') {
      prompt = `${contextPrefix}Identify landmark or recent Supreme Court/High Court cases interpreting the highlighted clause/section within the provided context. Provide a brief ratio decidendi for each.`;
    }

    handleSendChat(prompt, 'selection', ann.text);
  };

  const handleAiDraftNote = async (ann) => {
    if (!ann || isDraftingNote) return;
    setIsDraftingNote(true);
    setTempNoteText('AI is summarizing text into study note...');
    
    try {
      const customKey = localStorage.getItem('lexastra_deepseek_api_key') || '';
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-api-key'] = customKey;
      }

      const promptMessages = [
        {
          role: 'system',
          content: 'You are LexAstra AI, a helpful Indian law study companion. Provide a single, highly concise, 1-2 sentence study note explaining or summarizing the key legal concept, duty, exception, or principle in the highlighted text provided. Write only the note itself, structured for study references, without introductory phrases like "Here is a note".'
        },
        {
          role: 'user',
          content: `Highlighted Text:\n"${ann.text}"`
        }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: promptMessages, examMode }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let draftedNote = '';
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
                draftedNote += content;
                setTempNoteText(draftedNote);
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error drafting note with AI:', error);
      setTempNoteText('');
      alert('Failed to draft study note with AI. Please check your API key configuration and network connection.');
    } finally {
      setIsDraftingNote(false);
    }
  };

  const handleGeneratePageSummary = async () => {
    const pageText = pageTexts.find(pt => pt.pageNumber === currentPage)?.text || '';
    if (!pageText) {
      alert('Page text is not indexed yet. Please wait a moment for the document to finish loading.');
      return;
    }
    
    setIsGeneratingSummary(true);
    setPageSummary({ page: currentPage, summary: 'Generating summary...' });
    
    try {
      const customKey = localStorage.getItem('lexastra_deepseek_api_key') || '';
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-api-key'] = customKey;
      }

      const promptMessages = [
        {
          role: 'system',
          content: `You are LexAstra AI, a specialized legal research assistant. Provide a highly structured, 3-bullet legal cheat sheet of the provided PDF page text.
Identify:
1. Key legal doctrines or principles discussed.
2. Important statutory sections or articles cited.
3. Relevant case laws and their simple ratio.

Ensure it is concise, bulleted, and tailored to the ${examMode} exam requirements. Do not add conversational headers or intros.`
        },
        {
          role: 'user',
          content: `Page Text from Page ${currentPage}:\n"${pageText}"`
        }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: promptMessages, examMode }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let summaryText = '';
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
                summaryText += content;
                setPageSummary({ page: currentPage, summary: summaryText });
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setPageSummary(null);
      alert('Failed to generate page summary. Please check your API key configuration and network connection.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    const pageText = pageTexts.find(pt => pt.pageNumber === currentPage)?.text || '';
    if (!pageText) {
      alert('Page text is not indexed yet. Please wait a moment for the document to finish loading.');
      return;
    }
    
    setIsGeneratingFlashcards(true);
    setIsFlashcardFlipped(false);
    
    try {
      const customKey = localStorage.getItem('lexastra_deepseek_api_key') || '';
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-api-key'] = customKey;
      }

      const promptMessages = [
        {
          role: 'system',
          content: `You are LexAstra AI, a legal study companion. Generate exactly 3 to 5 study flashcards based on the provided legal text from page ${currentPage}.
Format your response as a valid JSON array of objects, where each object has "question" and "answer" properties.
Keep questions focused on key definitions, section numbers, case names, maxims, or principles, and keep answers concise and easy to memorize.
Example format:
[
  { "question": "What is the key principle in Kesavananda Bharati?", "answer": "The Basic Structure Doctrine, meaning Parliament cannot amend the basic structure of the Constitution." }
]

Do not return any markdown formatting, preambles, or explanations. Return ONLY the raw JSON array.`
        },
        {
          role: 'user',
          content: `Page Text:\n"${pageText}"`
        }
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: promptMessages, examMode }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = '';
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
                fullContent += content;
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      let cleanedJson = fullContent.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsedCards = JSON.parse(cleanedJson);
      if (Array.isArray(parsedCards) && parsedCards.length > 0) {
        setFlashcardDecks(parsedCards);
        setActiveFlashcardIndex(0);
      } else {
        throw new Error('Response is not a valid flashcards array');
      }

    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Failed to generate flashcards. Please check your API key configuration and try again.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleAskAISelection = () => {
    if (!selectedText || !selectionCoords) return;
    runQuickQuery('explain');
  };

  // local RAG Search context construction for Legal Study
  const getRAGContext = (query) => {
    if (pageTexts.length === 0) return '';
    
    let targetPageNums = new Set();
    const queryLower = query.toLowerCase();

    // 1. Check for specific citations in query (e.g., "section 302", "article 14")
    const sectionMatch = queryLower.match(/(?:section|sec\.|article|art\.|chapter|chap\.)\s*([0-9a-z]+)/);
    
    if (sectionMatch) {
      // Find pages containing this section
      const citation = sectionMatch[0];
      const matchPages = pageTexts
        .filter(pt => pt.text.toLowerCase().includes(citation))
        .map(pt => pt.pageNumber);
      
      if (matchPages.length > 0) {
        // Grab the first occurrence page and its adjacent page
        const p = matchPages[0];
        targetPageNums.add(p);
        if (p < numPages) targetPageNums.add(p + 1);
      }
    }

    // 2. If no specific citation found, fallback to current reading window
    if (targetPageNums.size === 0) {
      targetPageNums.add(currentPage);
      if (currentPage > 1) targetPageNums.add(currentPage - 1);
      if (currentPage < numPages) targetPageNums.add(currentPage + 1);
    }

    // 3. Optional keyword matching for highly unique words as a secondary layer
    const rareWords = queryLower.split(/\W+/).filter(w => w.length > 5);
    if (rareWords.length > 0 && targetPageNums.size < 3) {
      pageTexts.forEach(pt => {
        const textLower = pt.text.toLowerCase();
        for (const word of rareWords) {
          if (textLower.includes(word)) {
            targetPageNums.add(pt.pageNumber);
            break;
          }
        }
      });
    }

    // Sort and limit to max 4 pages to avoid token limit overflow
    const sortedPages = Array.from(targetPageNums)
      .sort((a, b) => a - b)
      .slice(0, 4);

    return sortedPages
      .map(pageNum => {
        const pt = pageTexts.find(p => p.pageNumber === pageNum);
        return pt ? `[Context from Page ${pageNum}]:\n${pt.text}\n` : '';
      })
      .join('\n');
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

    setChatOpen(true);

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
        content: `You are LexAstra AI, a specialized legal research assistant. The user is currently reading a document titled "${fileName}" and preparing for the ${examMode === 'General' ? 'General Law' : examMode} exam. Always prioritize information in the provided context (which is taken directly from their PDF) to answer their questions accurately. Quote specific pages and outline sections when referenced. Be precise, educational, and structured, tailoring your explanation style to the ${examMode} exam requirements.
        
At the end of your response, ALWAYS provide 2-3 dynamic follow-up questions the user could ask next to deepen their understanding of this specific topic. Format them exactly like this on new lines at the very end of your message:
[FOLLOWUP: What is the exception to this rule?]
[FOLLOWUP: How does this apply to criminal cases?]`
      },
      ...updatedHistory.map(h => ({ role: h.role, content: h.role === 'user' ? contextPrompt + h.content : h.content }))
    ];

    try {
      const customKey = localStorage.getItem('lexastra_deepseek_api_key') || '';
      const headers = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-api-key'] = customKey;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ messages: payloadMessages, examMode }),
      });

      if (!response.ok) {
        setIsChatLoading(false);
        let errorMsg = `API request failed (Status: ${response.status}).`;
        if (response.status === 400) {
          errorMsg = 'Bad Request (Status 400). Please check your query or verify if your custom API key format is correct.';
        } else if (response.status === 401) {
          errorMsg = 'Authentication failed. Please verify that your custom DeepSeek API key is correct and valid, or configure it via the **DeepSeek API Settings** in the chat header.';
        } else if (response.status === 402) {
          errorMsg = 'Insufficient Balance. The DeepSeek API key has run out of credits or has no active balance. Please configure a custom DeepSeek API key with active credits via the **DeepSeek API Settings** in the chat header.';
        } else if (response.status === 403) {
          errorMsg = 'Forbidden (Status 403). Access denied. Please ensure your API key has the correct permissions and your IP/region is allowed by DeepSeek.';
        } else if (response.status === 429) {
          errorMsg = 'Too Many Requests (Status 429). Rate limit exceeded. Please wait a moment before trying again.';
        } else if (response.status >= 500) {
          errorMsg = `Server Error (Status ${response.status}). The DeepSeek service might be experiencing temporary issues. Please try again later.`;
        }
        
        const isKeyRelated = [400, 401, 402, 403].includes(response.status);
        if (isKeyRelated && response.status !== 401 && response.status !== 402) {
          errorMsg += ' You can update or clear your custom key via the **DeepSeek API Settings** in the chat header.';
        }

        setChatHistory(prev => [
          ...prev,
          { role: 'assistant', content: errorMsg }
        ]);
        return;
      }

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
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Network connection failed. Please check your internet connection and ensure your local server is running, or verify your API key configuration.' 
        }
      ]);
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

  const parseFollowUps = (text) => {
    if (!text) return { cleanText: '', followUps: [] };
    const followUps = [];
    const regex = /\[FOLLOWUP:\s*(.*?)\]/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      followUps.push(match[1].trim());
    }
    const cleanText = text.replace(/\[FOLLOWUP:\s*(.*?)\]/gi, '').trim();
    return { cleanText, followUps };
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
              <Highlighter size={13} /> Notes ({annotations.length})
            </button>
            <button 
              className={`pdf-sidebar__tab ${activeTab === 'study-guide' ? 'active' : ''}`}
              onClick={() => setActiveTab('study-guide')}
            >
              <Sparkles size={13} /> Study Guide
            </button>
            <button 
              className={`pdf-sidebar__tab ${activeTab === 'outline' ? 'active' : ''}`}
              onClick={() => setActiveTab('outline')}
              disabled={outline.length === 0}
            >
              <List size={13} /> Outline
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
                        onClick={(e) => { e.stopPropagation(); handleDeleteAnnotationConfirmed(ann.id); }}
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
                              title="Interpret clause within page context"
                            >
                              <BookOpen size={10} /> Interpret
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); askAboutHighlight(ann, 'cases'); }}
                              className="ann-card__ai-btn"
                              title="Find landmark cases interpreting this clause"
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
          ) : activeTab === 'study-guide' ? (
            <div className="pdf-study-guide-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Part 1: Page Summary / Cheat Sheet */}
              <div className="study-guide-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--navy)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📖 Page {currentPage} Cheat Sheet
                </h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  Generate a structured summary of the key principles, statutes, and cases on this page.
                </p>
                
                {pageSummary && pageSummary.page === currentPage ? (
                  <div className="study-guide-summary-box" style={{ background: '#ffffff', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#333', lineHeight: '1.6', position: 'relative' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {pageSummary.summary}
                    </ReactMarkdown>
                    <button 
                      onClick={() => setPageSummary(null)} 
                      className="btn btn--ghost btn--small" 
                      style={{ fontSize: '10px', padding: '2px 6px', marginTop: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                    >
                      Clear Summary
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGeneratePageSummary} 
                    className="btn btn--gold-fill btn--small"
                    disabled={isGeneratingSummary}
                    style={{ justifyContent: 'center' }}
                  >
                    {isGeneratingSummary ? 'Generating Cheat Sheet...' : 'Generate Cheat Sheet'}
                  </button>
                )}
              </div>

              <div className="menu-divider" style={{ background: 'rgba(0,0,0,0.06)' }} />

              {/* Part 2: Interactive Flashcards */}
              <div className="study-guide-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', color: 'var(--navy)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🧠 AI Study Flashcards
                </h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  Create interactive flashcards based on the legal doctrines and sections on page {currentPage} to test your knowledge.
                </p>

                {flashcardDecks && flashcardDecks.length > 0 ? (
                  <div className="flashcards-console" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    
                    {/* 3D Flip Card */}
                    <div 
                      className="flashcard-container"
                      onClick={() => setIsFlashcardFlipped(prev => !prev)}
                      style={{
                        width: '100%',
                        height: '140px',
                        cursor: 'pointer',
                        perspective: '1000px'
                      }}
                    >
                      <div 
                        className={`flashcard-card ${isFlashcardFlipped ? 'flipped' : ''}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          position: 'relative',
                          transformStyle: 'preserve-3d',
                          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {/* Front Side */}
                        <div 
                          className="flashcard-front"
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            background: '#ffffff',
                            border: '1px solid var(--border-gold)',
                            borderRadius: '10px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            color: 'var(--navy)',
                            fontWeight: '600',
                            fontSize: '12.5px'
                          }}
                        >
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                            Question • Card {activeFlashcardIndex + 1}
                          </span>
                          <p style={{ margin: 0 }}>{flashcardDecks[activeFlashcardIndex]?.question}</p>
                          <span style={{ fontSize: '9px', color: 'var(--gold-dark)', marginTop: '8px', opacity: 0.8 }}>
                            Click to reveal answer 🔄
                          </span>
                        </div>

                        {/* Back Side */}
                        <div 
                          className="flashcard-back"
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            background: 'var(--navy)',
                            border: '1px solid var(--gold)',
                            borderRadius: '10px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                            color: '#ffffff',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                            Answer • Card {activeFlashcardIndex + 1}
                          </span>
                          <p style={{ margin: 0, lineHeight: '1.4' }}>{flashcardDecks[activeFlashcardIndex]?.answer}</p>
                          <span style={{ fontSize: '9px', color: 'var(--gold)', marginTop: '8px', opacity: 0.8 }}>
                            Click to view question 🔄
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Controls */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '4px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlashcardFlipped(false);
                          setActiveFlashcardIndex(prev => Math.max(prev - 1, 0));
                        }}
                        className="btn btn--ghost btn--small"
                        disabled={activeFlashcardIndex === 0}
                        style={{ padding: '2px 8px' }}
                      >
                        ← Prev
                      </button>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {activeFlashcardIndex + 1} of {flashcardDecks.length}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFlashcardFlipped(false);
                          setActiveFlashcardIndex(prev => Math.min(prev + 1, flashcardDecks.length - 1));
                        }}
                        className="btn btn--ghost btn--small"
                        disabled={activeFlashcardIndex === flashcardDecks.length - 1}
                        style={{ padding: '2px 8px' }}
                      >
                        Next →
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        setFlashcardDecks([]);
                        setActiveFlashcardIndex(0);
                        setIsFlashcardFlipped(false);
                        localStorage.removeItem(`lexastra_pdf_flashcards_${fileName.replace(/\s+/g, '_')}`);
                      }} 
                      className="btn btn--ghost btn--small"
                      style={{ fontSize: '10.5px', color: 'var(--charcoal)', width: '100%', justifyContent: 'center', marginTop: '8px', border: '1px solid rgba(0,0,0,0.1)' }}
                    >
                      Clear Deck
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGenerateFlashcards} 
                    className="btn btn--gold-fill btn--small"
                    disabled={isGeneratingFlashcards}
                    style={{ justifyContent: 'center' }}
                  >
                    {isGeneratingFlashcards ? 'Generating Flashcards...' : 'Generate Flashcards'}
                  </button>
                )}
              </div>

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
                <Database size={16} /> Backup & Restore
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
                  <>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleLibraryFileSelect} 
                      ref={libraryFileInputRef} 
                      style={{ display: 'none' }} 
                    />
                    <div 
                      className="library-dropzone" 
                      onClick={() => libraryFileInputRef.current.click()}
                    >
                      <Upload size={36} className="dropzone-icon" />
                      <p>Select a PDF textbook to save permanently</p>
                      <span className="dropzone-sub">Click to browse documents</span>
                    </div>
                  </>
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
                {/* Outline & Notes Sidebar toggle button */}
                <button 
                  className={`pdf-toolbar__btn ${sidebarOpen ? 'pdf-toolbar__btn--active' : ''}`}
                  onClick={() => setSidebarOpen(prev => !prev)}
                  title={sidebarOpen ? "Hide Outline & Notes Sidebar" : "Show Outline & Notes Sidebar"}
                  style={{ marginRight: '8px', color: sidebarOpen ? 'var(--gold)' : 'inherit' }}
                >
                  {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
                
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
                <button className="pdf-toolbar__btn" onClick={() => { setZoom(prev => Math.max(prev - 0.25, 0.5)); setFitMode('custom'); }} title="Zoom Out">
                  <ZoomOut size={16} />
                </button>
                <span className="zoom-text">{Math.round(zoom * 100)}%</span>
                <button className="pdf-toolbar__btn" onClick={() => { setZoom(prev => Math.min(prev + 0.25, 3)); setFitMode('custom'); }} title="Zoom In">
                  <ZoomIn size={16} />
                </button>
                <button className="pdf-toolbar__btn" onClick={() => { setZoom(1.25); setFitMode('custom'); }} title="Reset Zoom">
                  <Maximize2 size={16} />
                </button>
                
                <div className="menu-divider" style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                
                {/* Document Theme Selector */}
                <div className="pdf-theme-selector-group" style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingRight: '4px' }}>
                  {[
                    { id: 'light', name: 'Light', color: '#ffffff' },
                    { id: 'parchment', name: 'Warm', color: '#f6f3eb' },
                    { id: 'sepia', name: 'Sepia', color: '#f4ecd8' },
                    { id: 'dark', name: 'Night', color: '#121824' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setReaderTheme(t.id)}
                      className={`pdf-theme-btn-dot ${readerTheme === t.id ? 'active' : ''}`}
                      title={`${t.name} Mode`}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: t.color,
                        border: readerTheme === t.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.25)',
                        cursor: 'pointer',
                        padding: 0,
                        transition: 'all 0.2s ease',
                        transform: readerTheme === t.id ? 'scale(1.2)' : 'none',
                        boxShadow: readerTheme === t.id ? '0 0 6px var(--gold)' : 'none'
                      }}
                    />
                  ))}
                </div>

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
                
                {/* Annotations Database Table toggle button */}
                <button 
                  className={`pdf-toolbar__btn ${bottomPanelOpen ? 'pdf-toolbar__btn--active' : ''}`}
                  onClick={() => setBottomPanelOpen(prev => !prev)}
                  title={bottomPanelOpen ? "Hide Notes & Highlights Table" : "Show Notes & Highlights Table"}
                  style={{ color: bottomPanelOpen ? 'var(--gold)' : 'inherit', marginRight: '6px' }}
                >
                  <Database size={16} />
                  <span style={{ fontSize: '11px', fontWeight: '500', marginLeft: '4px' }}>Database</span>
                </button>
                
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
              className={`pdf-render-scroll theme-${readerTheme}`}
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
                    onHighlightClick={handleHighlightClick}
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
                    <button onClick={() => runQuickQuery('explain')} className="action-btn" title="Interpret clause within page context">
                      <BookOpen size={12} /> Interpret
                    </button>
                    <button onClick={() => runQuickQuery('summarize')} className="action-btn" title="Break down essential ingredients">
                      <List size={12} /> Elements
                    </button>
                    <button onClick={() => runQuickQuery('cases')} className="action-btn" title="Find landmark cases interpreting this clause">
                      <Scale size={12} /> Cases
                    </button>
                    <button onClick={() => runQuickQuery('simplify')} className="action-btn" title="Create a hypothetical scenario">
                      <HelpCircle size={12} /> Scenario
                    </button>
                  </div>
                </div>
              )}

              {/* Modernized Floating Annotation Popover Card */}
              {activeAnnotationMenu && (
                <div 
                  className="pdf-annotation-popover"
                  style={{
                    left: `${activeAnnotationMenu.left}px`,
                    top: `${activeAnnotationMenu.top}px`
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // Prevent selection clear
                  onMouseUp={(e) => e.stopPropagation()} // Prevent handleTextSelection from closing the menu
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pdf-annotation-popover__header">
                    <span className="pdf-annotation-popover__title">Highlight • Page {activeAnnotationMenu.ann.page}</span>
                    <button 
                      className="pdf-annotation-popover__close"
                      onClick={() => setActiveAnnotationMenu(null)}
                      title="Close Popover"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  
                  <div className="pdf-annotation-popover__body">
                    <div className="pdf-annotation-popover__quote-preview">
                      "{activeAnnotationMenu.ann.text}"
                    </div>

                    <div className="pdf-annotation-popover__colors">
                      <span className="popover-section-label">Highlight Color:</span>
                      <div className="menu-colors">
                        {[
                          { val: '#FEF08A', name: 'Yellow' },
                          { val: '#86EFAC', name: 'Green' },
                          { val: '#93C5FD', name: 'Blue' },
                          { val: '#F9A8D4', name: 'Pink' },
                          { val: '#D8B4FE', name: 'Purple' },
                          { val: '#FDBA74', name: 'Orange' }
                        ].map((c) => (
                          <button 
                            key={c.val}
                            onClick={() => handleUpdateAnnotationColor(activeAnnotationMenu.ann.id, c.val)}
                            className={`color-btn ${activeAnnotationMenu.ann.color === c.val ? 'color-btn--active' : ''}`}
                            style={{ backgroundColor: c.val }} 
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pdf-annotation-popover__notes">
                      <span className="popover-section-label">Study Notes:</span>
                      <textarea
                        value={tempNoteText}
                        onChange={(e) => setTempNoteText(e.target.value)}
                        placeholder={isDraftingNote ? "AI is drafting note..." : "Add your study notes or questions..."}
                        rows={3}
                        disabled={isDraftingNote}
                        style={{
                          opacity: isDraftingNote ? 0.7 : 1,
                          cursor: isDraftingNote ? 'wait' : 'text'
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <button 
                          onClick={() => handleAiDraftNote(activeAnnotationMenu.ann)}
                          className="action-btn"
                          disabled={isDraftingNote}
                          style={{ 
                            padding: '3px 8px', 
                            fontSize: '10.5px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            background: 'rgba(201, 168, 76, 0.08)',
                            border: '1px solid rgba(201, 168, 76, 0.2)',
                            color: 'var(--gold-dark)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            opacity: isDraftingNote ? 0.6 : 1
                          }}
                          title="Generate a concise AI study note for this highlighted text"
                        >
                          <Sparkles size={11} /> {isDraftingNote ? 'Drafting...' : 'AI Draft Note'}
                        </button>
                        
                        {activeAnnotationMenu.ann.comment !== tempNoteText && (
                          <button 
                            onClick={() => handleSaveNoteFromPopover(activeAnnotationMenu.ann.id)}
                            className="btn btn--gold-fill btn--small"
                            style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Check size={12} /> Save Note
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pdf-annotation-popover__footer">
                    <div className="pdf-annotation-popover__ai-actions">
                      <button 
                        onClick={() => {
                          askAboutHighlight(activeAnnotationMenu.ann, 'explain');
                          setActiveAnnotationMenu(null);
                        }} 
                        className="action-btn"
                        title="Interpret clause within page context"
                      >
                        <BookOpen size={12} /> Interpret
                      </button>
                      <button 
                        onClick={() => {
                          askAboutHighlight(activeAnnotationMenu.ann, 'cases');
                          setActiveAnnotationMenu(null);
                        }} 
                        className="action-btn"
                        title="Find landmark cases interpreting this clause"
                      >
                        <Search size={12} /> Cases
                      </button>
                    </div>

                    <button 
                      onClick={() => handleDeleteAnnotationFromPopover(activeAnnotationMenu.ann.id)}
                      className="popover-delete-btn"
                      title="Delete highlight & note"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Structured Annotations & Highlights Table Database Panel */}
            {bottomPanelOpen && (
              <div className="pdf-bottom-panel">
                <header className="pdf-bottom-panel__header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Highlighter size={14} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Notes & Highlights Database ({annotations.length})
                    </span>
                  </div>
                  <button 
                    onClick={() => setBottomPanelOpen(false)}
                    className="pdf-annotation-popover__close"
                    title="Hide Database"
                  >
                    <X size={14} />
                  </button>
                </header>
                <div className="pdf-bottom-panel__content">
                  {annotations.length === 0 ? (
                    <div className="empty-table-state">
                      <Edit3 size={24} style={{ opacity: 0.3, marginBottom: '6px', display: 'inline-block' }} />
                      <p style={{ fontSize: '12px', margin: 0 }}>No saved highlights or study notes. Highlight text in the PDF to populate this table database.</p>
                    </div>
                  ) : (
                    <table className="annotations-table">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Page</th>
                          <th style={{ width: '130px' }}>Color</th>
                          <th>Highlighted Statutory Text</th>
                          <th>Study Notes / Comments (Click to edit)</th>
                          <th style={{ width: '180px' }}>AI Assist</th>
                          <th style={{ width: '60px' }}>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {annotations.map((ann) => (
                          <tr key={ann.id}>
                            <td>
                              <button 
                                onClick={() => scrollToPage(ann.page)}
                                className="table-page-link"
                                title={`Scroll to Page ${ann.page}`}
                              >
                                Page {ann.page}
                              </button>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="color-indicator-dot" style={{ backgroundColor: ann.color }} />
                                <div className="table-color-picker">
                                  {['#FEF08A', '#86EFAC', '#93C5FD', '#F9A8D4', '#D8B4FE', '#FDBA74'].map(c => (
                                    <button 
                                      key={c}
                                      onClick={() => handleUpdateAnnotationColor(ann.id, c)}
                                      className="color-dot-mini"
                                      style={{ backgroundColor: c, border: ann.color === c ? '1px solid #fff' : 'none' }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="table-quote-cell">
                              <span title={ann.text}>{ann.text.length > 80 ? ann.text.substring(0, 80) + '...' : ann.text}</span>
                            </td>
                            <td className="table-note-cell">
                              {editingNoteId === ann.id ? (
                                <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                                  <input 
                                    type="text" 
                                    value={tempNoteText} 
                                    onChange={(e) => setTempNoteText(e.target.value)} 
                                    style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-gold)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '12px', outline: 'none' }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveNote(ann.id);
                                    }}
                                  />
                                  <button onClick={() => handleSaveNote(ann.id)} className="btn btn--gold-fill btn--small" style={{ padding: '2px 8px', fontSize: '10px' }}>
                                    Save
                                  </button>
                                  <button onClick={() => setEditingNoteId(null)} className="btn btn--ghost btn--small" style={{ padding: '2px 8px', fontSize: '10px' }}>
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="table-note-content-wrapper" onClick={() => handleStartEditNote(ann)}>
                                  {ann.comment ? (
                                    <span className="note-text-display">{ann.comment}</span>
                                  ) : (
                                    <span className="note-text-placeholder">+ Click to add note...</span>
                                  )}
                                  <Edit3 size={11} className="note-edit-icon" />
                                </div>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  onClick={() => askAboutHighlight(ann, 'explain')}
                                  className="btn btn--primary btn--small"
                                  style={{ fontSize: '10px', padding: '3px 6px', gap: '2px' }}
                                  title="Interpret clause within page context"
                                >
                                  <BookOpen size={10} /> Interpret
                                </button>
                                <button 
                                  onClick={() => askAboutHighlight(ann, 'cases')}
                                  className="btn btn--ghost btn--small"
                                  style={{ fontSize: '10px', padding: '3px 6px', gap: '2px' }}
                                  title="Find landmark cases interpreting this clause"
                                >
                                  <Search size={10} /> Cases
                                </button>
                              </div>
                            </td>
                            <td>
                              <button 
                                onClick={() => handleDeleteAnnotationConfirmed(ann.id)}
                                className="table-delete-btn"
                                title="Delete Highlight & Note"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
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
                onClick={() => setShowApiKeyModal(true)}
                className="pdf-toolbar__btn"
                title="DeepSeek API Settings"
                style={{ padding: '4px', opacity: 0.6, color: hasCustomApiKey ? '#C9A84C' : 'inherit' }}
              >
                <Settings size={14} />
              </button>

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
            {chatHistory.map((msg, index) => {
              const parsed = msg.role === 'assistant' ? parseFollowUps(msg.content) : { cleanText: msg.content, followUps: [] };
              
              return (
              <div key={index} className={`chat-message-wrapper ${msg.role === 'user' ? 'chat-message-wrapper--user' : 'chat-message-wrapper--ai'}`}>
                <div className="chat-message">
                  <div className="chat-message__avatar">
                    {msg.role === 'user' ? 'U' : 'L'}
                  </div>
                  <div className="chat-message__content">
                    <div id={`pdf-ai-msg-${index}`}>
                      {/* Render Markdown Components with Mermaid support */}
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                        {msg.role === 'assistant' ? formatPageLinks(parsed.cleanText) : parsed.cleanText}
                      </ReactMarkdown>
                    </div>

                    {msg.role === 'assistant' && (msg.content.includes('Authentication failed') || msg.content.includes('Insufficient Balance') || msg.content.includes('API key') || msg.content.includes('API Settings') || msg.content.includes('API Key')) && (
                      <div style={{ marginTop: '16px', background: 'rgba(201, 168, 76, 0.05)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '16px', borderRadius: '8px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--navy)', fontWeight: 'bold', margin: '0 0 10px 0' }}>DeepSeek API Settings Required</p>
                        <button onClick={() => setShowApiKeyModal(true)} className="btn btn--gold-fill btn--small" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Settings size={12} /> Configure DeepSeek API Key
                        </button>
                      </div>
                    )}

                    {msg.role === 'assistant' && (
                      <div className="chat-msg-actions">
                        <button onClick={() => handleCopyMessage(parsed.cleanText, index)} className="chat-msg-action-btn">
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
                    
                    {parsed.followUps.length > 0 && index === chatHistory.length - 1 && !isChatLoading && (
                      <div className="chat-msg-followups" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Suggested Follow-ups:</span>
                        {parsed.followUps.map((f, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSendChat(f, 'search')}
                            className="chat-preset-btn"
                            style={{ textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '6px 10px', display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', border: '1px solid rgba(201, 168, 76, 0.3)', background: 'rgba(201, 168, 76, 0.05)', color: 'var(--navy)' }}
                          >
                            <Sparkles size={12} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--gold-main)' }} /> 
                            <span>{f}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})}
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



          {/* Controls & Chat Input */}
          <div className="pdf-chat-controls">
            <div className="context-modes">
              <span className="context-label">AI Search Context:</span>
              <div className="context-options">
                <label className={`context-option ${contextMode === 'search' ? 'active' : ''}`} title="Automatically scans the document for related sections, cross-references, and adjacent pages.">
                  <input 
                    type="radio" 
                    name="context" 
                    value="search" 
                    checked={contextMode === 'search'}
                    onChange={() => setContextMode('search')}
                  />
                  Smart Legal Search
                </label>
                <label className={`context-option ${contextMode === 'current' ? 'active' : ''}`} title="Strictly restricts the AI's knowledge to the current page. Best for highly specific page queries.">
                  <input 
                    type="radio" 
                    name="context" 
                    value="current" 
                    checked={contextMode === 'current'}
                    onChange={() => setContextMode('current')}
                  />
                  Page {currentPage} Only
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="context-label">Page Study Presets (Page {currentPage}):</span>
                <button 
                  onClick={() => setShowPresets(!showPresets)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  title={showPresets ? "Hide Presets" : "Show Presets"}
                >
                  {showPresets ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {showPresets ? 'Hide' : 'Show'}
                </button>
              </div>
              {showPresets && (
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
              )}
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

      {/* 5. Local Backup & Restore Console Modal */}
      {showDriveModal && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-content" style={{ maxWidth: '450px' }}>
            <div className="pdf-modal-header">
              <h3><Database size={20} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: '8px' }} /> Backup & Restore Workspace</h3>
              <button onClick={() => setShowDriveModal(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="pdf-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="sync-status-box" style={{ background: 'rgba(201, 168, 76, 0.05)', border: '1px solid rgba(201, 168, 76, 0.15)', textAlign: 'center', padding: '16px', borderRadius: '8px' }}>
                <HardDrive size={36} style={{ color: 'var(--gold)', marginBottom: '8px', display: 'inline-block' }} />
                <h4>Workspace Backups</h4>
                <p className="sync-detail" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Save your highlights, annotations, notes, and AI conversations to a single file. Restore it anytime to resume studying on another browser.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={handleExportBackup} 
                  className="btn btn--gold-fill" 
                  style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                >
                  <Download size={16} /> Export JSON Backup File
                </button>
                
                <button 
                  onClick={() => backupFileInputRef.current?.click()} 
                  className="btn btn--ghost" 
                  style={{ width: '100%', justifyContent: 'center', gap: '8px', border: '1px solid var(--border-subtle)' }}
                >
                  <Upload size={16} /> Restore from Backup File
                </button>
                
                <input 
                  type="file" 
                  ref={backupFileInputRef} 
                  onChange={handleImportBackup} 
                  accept=".json" 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. DeepSeek API Key Settings Modal */}
      {showApiKeyModal && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-content" style={{ maxWidth: '400px' }}>
            <div className="pdf-modal-header">
              <h3>
                <Settings size={20} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: '8px' }} /> DeepSeek API Settings
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="close-modal-btn">
                <X size={18} />
              </button>
            </div>
            
            <div className="pdf-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                Configure your own DeepSeek API Key. Your custom key will be stored securely in your browser's local storage and used directly for all AI queries.
              </p>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const trimmed = apiKeyInput.trim();
                if (trimmed) {
                  localStorage.setItem('lexastra_deepseek_api_key', trimmed);
                  setHasCustomApiKey(true);
                } else {
                  localStorage.removeItem('lexastra_deepseek_api_key');
                  setHasCustomApiKey(false);
                }
                setShowApiKeyModal(false);
                alert('DeepSeek API Key settings updated successfully!');
              }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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
                      border: '1px solid var(--border-gold)',
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
                      localStorage.removeItem('lexastra_deepseek_api_key');
                      setApiKeyInput('');
                      setHasCustomApiKey(false);
                      setShowApiKeyModal(false);
                      alert('Custom API Key cleared. LexAstra will now fall back to the default server-side key.');
                    }}
                    className="btn btn--ghost"
                    style={{ flex: 1, justifyContent: 'center', border: '1px solid var(--border-subtle)' }}
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
        </div>
      )}
    </div>
  );
}
