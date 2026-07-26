import React, { useState, useEffect } from 'react';
import { X, Key, Check, Trash2 } from 'lucide-react';
import { getStoredApiKey, storeApiKey, clearStoredApiKey } from '../services/storageService';

interface ApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ visible, onClose }) => {
  const [keyInput, setKeyInput] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      const existingKey = getStoredApiKey() || '';
      setKeyInput(existingKey);
      setSavedSuccess(false);
    }
  }, [visible]);

  if (!visible) return null;

  const handleSave = () => {
    if (keyInput.trim()) {
      storeApiKey(keyInput.trim());
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  const handleClear = () => {
    clearStoredApiKey();
    setKeyInput('');
    setSavedSuccess(false);
  };

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
        maxWidth: '460px',
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
          <Key size={20} color="#1e293b" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Gemini API Key Settings
          </h3>
        </div>

        <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>
          The application automatically uses your Google Gemini API key from the environment (`.env`). If you wish to enter a custom key, you can do so below.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            GEMINI API KEY (`AIzaSy...`)
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '10px 12px',
              color: '#0f172a',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
        </div>

        {savedSuccess && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#166534',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '14px',
          }}>
            <Check size={16} /> Key saved successfully!
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {keyInput && (
            <button
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Trash2 size={13} /> Reset to project default
            </button>
          )}

          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button onClick={onClose} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <Check size={14} /> Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
