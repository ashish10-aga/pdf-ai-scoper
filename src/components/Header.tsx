import React from 'react';
import { FileText, Key, FolderOpen, Globe, Upload } from 'lucide-react';
import { PdfDocument, Language } from '../types/pdf';
import { INDIAN_LANGUAGES } from '../constants/languages';

interface HeaderProps {
  currentPdf: PdfDocument | null;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenSampleModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenDocumentPicker: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPdf,
  selectedLanguage,
  onSelectLanguage,
  onOpenSampleModal,
  onOpenApiKeyModal,
  onOpenDocumentPicker,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: '#ffffff',
      borderBottom: '1px solid #cbd5e1',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    }}>
      {/* Brand & Document Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '6px',
          background: '#1e293b',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <FileText size={18} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              PDF Voice Reader
            </h1>
            <span className="badge-clean">Document Mode</span>
          </div>
          {currentPdf && (
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, fontWeight: 500 }}>
              📄 {currentPdf.name}
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Language Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <Globe size={15} color="#475569" />
          <select
            value={selectedLanguage.code}
            onChange={(e) => {
              const found = INDIAN_LANGUAGES.find((l) => l.code === e.target.value);
              if (found) onSelectLanguage(found);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0f172a',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} style={{ background: '#ffffff', color: '#0f172a' }}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Sample PDFs button */}
        <button
          onClick={onOpenSampleModal}
          className="btn-secondary"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <FolderOpen size={15} color="#475569" />
          Samples
        </button>

        {/* Upload Custom File */}
        <button
          onClick={onOpenDocumentPicker}
          className="btn-primary"
          style={{ fontSize: '0.82rem', padding: '6px 14px' }}
        >
          <Upload size={15} />
          Open PDF
        </button>

        {/* API Key Modal Trigger */}
        <button
          onClick={onOpenApiKeyModal}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            color: '#475569',
            borderRadius: '6px',
            padding: '6px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
          title="Gemini API Key Settings"
        >
          <Key size={14} /> Key Settings
        </button>
      </div>
    </header>
  );
};
