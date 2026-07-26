import React, { useState, useRef, lazy, Suspense, useCallback } from 'react';
import { Header } from './components/Header';
import { PdfDocument, Language } from './types/pdf';
import { INDIAN_LANGUAGES } from './constants/languages';
import { SAMPLE_PDFS, SamplePdfOption } from './data/samplePdfs';
import { Volume2, MessageSquare } from 'lucide-react';

// Advanced React Lazy Loading & Code Splitting
const PdfViewer = lazy(() => import('./components/PdfViewer').then(m => ({ default: m.PdfViewer })));
const DictationPanel = lazy(() => import('./components/DictationPanel').then(m => ({ default: m.DictationPanel })));
const ChatPanel = lazy(() => import('./components/ChatPanel').then(m => ({ default: m.ChatPanel })));
const ApiKeyModal = lazy(() => import('./components/ApiKeyModal').then(m => ({ default: m.ApiKeyModal })));
const SamplePdfModal = lazy(() => import('./components/SamplePdfModal').then(m => ({ default: m.SamplePdfModal })));

// Loading Skeleton Component
const ComponentLoader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px', color: '#64748b', fontSize: '0.85rem' }}>
    Loading module...
  </div>
);

export function App() {
  const [currentPdf, setCurrentPdf] = useState<PdfDocument | null>(SAMPLE_PDFS[0].pdf);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(INDIAN_LANGUAGES[0]); // Default Hindi
  const [activeTab, setActiveTab] = useState<'dictation' | 'chat'>('dictation');

  const [apiKeyModalVisible, setApiKeyModalVisible] = useState<boolean>(false);
  const [sampleModalVisible, setSampleModalVisible] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setCurrentPdf({
        name: file.name,
        uri: URL.createObjectURL(file),
        base64: base64,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileDrop = useCallback((file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      processFile(file);
    } else {
      alert('Please drop a valid PDF document.');
    }
  }, [processFile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        style={{ display: 'none' }}
      />

      {/* Top Header Toolbar */}
      <Header
        currentPdf={currentPdf}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onOpenSampleModal={() => setSampleModalVisible(true)}
        onOpenApiKeyModal={() => setApiKeyModalVisible(true)}
        onOpenDocumentPicker={handleOpenPicker}
      />

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: PDF Viewer */}
        <div style={{ flex: '1 1 56%', borderRight: '1px solid #cbd5e1', display: 'flex', height: '100%' }}>
          <Suspense fallback={<ComponentLoader />}>
            <PdfViewer
              pdf={currentPdf}
              loading={false}
              error={null}
              onOpenSampleSelector={() => setSampleModalVisible(true)}
              onOpenPicker={handleOpenPicker}
              onFileDrop={handleFileDrop}
            />
          </Suspense>
        </div>

        {/* Right Side: AI Assistant Workspace */}
        <div style={{ flex: '1 1 44%', display: 'flex', flexDirection: 'column', background: '#ffffff', height: '100%' }}>
          {/* Segmented Tab Bar */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            borderBottom: '1px solid #cbd5e1',
            padding: '6px 12px',
            gap: '6px',
          }}>
            <button
              onClick={() => setActiveTab('dictation')}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: activeTab === 'dictation' ? '#ffffff' : 'transparent',
                border: activeTab === 'dictation' ? '1px solid #cbd5e1' : '1px solid transparent',
                borderRadius: '6px',
                color: activeTab === 'dictation' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'dictation' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'dictation' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              }}
            >
              <Volume2 size={16} color={activeTab === 'dictation' ? '#0f172a' : '#64748b'} />
              Audio Dictation
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              style={{
                flex: 1,
                padding: '8px 12px',
                background: activeTab === 'chat' ? '#ffffff' : 'transparent',
                border: activeTab === 'chat' ? '1px solid #cbd5e1' : '1px solid transparent',
                borderRadius: '6px',
                color: activeTab === 'chat' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'chat' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: activeTab === 'chat' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              }}
            >
              <MessageSquare size={16} color={activeTab === 'chat' ? '#0f172a' : '#64748b'} />
              Document Q&A
            </button>
          </div>

          {/* Active Panel Container with Suspense Lazy Load */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <Suspense fallback={<ComponentLoader />}>
              {activeTab === 'dictation' ? (
                <DictationPanel
                  pdf={currentPdf}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  onOpenApiKeyModal={() => setApiKeyModalVisible(true)}
                />
              ) : (
                <ChatPanel
                  pdf={currentPdf}
                  selectedLanguage={selectedLanguage}
                  onOpenApiKeyModal={() => setApiKeyModalVisible(true)}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>

      {/* Lazy Loaded Modals */}
      <Suspense fallback={null}>
        {apiKeyModalVisible && (
          <ApiKeyModal
            visible={apiKeyModalVisible}
            onClose={() => setApiKeyModalVisible(false)}
          />
        )}
        {sampleModalVisible && (
          <SamplePdfModal
            visible={sampleModalVisible}
            onClose={() => setSampleModalVisible(false)}
            onSelectSample={(sample: SamplePdfOption) => setCurrentPdf(sample.pdf)}
            onOpenPicker={handleOpenPicker}
          />
        )}
      </Suspense>
    </div>
  );
}

export default App;
