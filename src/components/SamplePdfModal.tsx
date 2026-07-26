import React from 'react';
import { X, FileText, Upload, ArrowRight } from 'lucide-react';
import { SAMPLE_PDFS, SamplePdfOption } from '../data/samplePdfs';

interface SamplePdfModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectSample: (sample: SamplePdfOption) => void;
  onOpenPicker: () => void;
}

export const SamplePdfModal: React.FC<SamplePdfModalProps> = ({
  visible,
  onClose,
  onSelectSample,
  onOpenPicker,
}) => {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="doc-card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        position: 'relative',
        background: '#ffffff',
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <FileText size={22} color="#1e293b" />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Sample PDF Documents
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Select a sample document to test reading and voice dictation
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {SAMPLE_PDFS.map((sample, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectSample(sample);
                onClose();
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.background = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.background = '#f8fafc';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{sample.icon}</span>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase' }}>
                    {sample.category}
                  </span>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', margin: '2px 0 2px 0' }}>
                    {sample.title}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.3' }}>
                    {sample.description}
                  </p>
                </div>
              </div>

              <ArrowRight size={16} color="#334155" style={{ flexShrink: 0, marginLeft: '8px' }} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Or open a file from your device:</span>
          <button
            onClick={() => {
              onClose();
              onOpenPicker();
            }}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Upload size={14} /> Open PDF
          </button>
        </div>
      </div>
    </div>
  );
};
