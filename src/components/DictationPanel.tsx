import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Volume2, CheckCircle2, FileText, ChevronDown, ChevronUp, FastForward, RefreshCw } from 'lucide-react';
import { PdfDocument, PdfSummaryResult, Language } from '../types/pdf';
import { speechService } from '../services/speechService';
import { generatePdfSummary } from '../services/groqService';

interface DictationPanelProps {
  pdf: PdfDocument | null;
  selectedLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenApiKeyModal: () => void;
}

export const DictationPanel: React.FC<DictationPanelProps> = ({
  pdf,
  selectedLanguage,
  onOpenApiKeyModal,
}) => {
  const [summary, setSummary] = useState<PdfSummaryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [activeSpeakingText, setActiveSpeakingText] = useState<string | null>(null);

  // Accordion Expand State
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  useEffect(() => {
    speechService.setOnStateChange((speaking, paused) => {
      setIsPlaying(speaking);
      setIsPaused(paused);
    });
  }, []);

  const handleGenerateSummary = async () => {
    if (!pdf) return;
    setLoading(true);
    setError(null);
    speechService.stop();

    try {
      const result = await generatePdfSummary(pdf.base64, selectedLanguage.code);
      setSummary(result);
    } catch (err: any) {
      console.error('Failed summary:', err);
      setError(err?.message || 'Failed to generate document summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdf) {
      handleGenerateSummary();
    }
  }, [pdf, selectedLanguage.code]);

  const handlePlayFullNarration = () => {
    if (!summary) return;
    if (isPaused) {
      speechService.resume();
    } else {
      setActiveSpeakingText('full_narration');
      speechService.speak(summary.conversationalScript, summary.languageCode, () => {
        setActiveSpeakingText(null);
      });
    }
  };

  const handlePause = () => {
    speechService.pause();
  };

  const handleStop = () => {
    speechService.stop();
    setActiveSpeakingText(null);
  };

  const handleSpeakBullet = (text: string, index: number) => {
    setActiveSpeakingText(`bullet_${index}`);
    speechService.speak(text, selectedLanguage.code, () => {
      setActiveSpeakingText(null);
    });
  };

  const handleCycleRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    speechService.setRate(nextRate);
  };

  const toggleSection = (idx: number) => {
    setExpandedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!pdf) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
        <p>Load a PDF document to view dictation summaries and audio narration.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
      {/* Audio Player Toolbar Card */}
      <div className="doc-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Volume2 size={18} color="#1e293b" />
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Audio Dictation
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              ({selectedLanguage.name})
            </span>
          </div>

          {/* Equalizer Visualizer */}
          <div className={`equalizer-container ${(!isPlaying || isPaused) ? 'equalizer-paused' : ''}`}>
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
          </div>
        </div>

        {/* Audio Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          {isPlaying && !isPaused ? (
            <button
              onClick={handlePause}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#d97706',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Pause size={18} />
            </button>
          ) : (
            <button
              onClick={handlePlayFullNarration}
              disabled={loading || !summary}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#1e293b',
                border: 'none',
                color: '#fff',
                cursor: loading || !summary ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading || !summary ? 0.6 : 1,
              }}
            >
              <Play size={18} style={{ marginLeft: '2px' }} />
            </button>
          )}

          {isPlaying && (
            <button
              onClick={handleStop}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Stop Playback"
            >
              <Square size={14} />
            </button>
          )}

          <div style={{ flex: 1, fontSize: '0.82rem', color: '#334155', fontWeight: 500 }}>
            {isPlaying
              ? isPaused
                ? 'Playback paused'
                : 'Reading dictation script...'
              : summary
              ? 'Click play to listen to audio narration'
              : 'Generating narration script...'}
          </div>

          <button
            onClick={handleCycleRate}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FastForward size={13} />
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="doc-card" style={{ padding: '24px', textAlign: 'center' }}>
          <RefreshCw size={24} color="#475569" style={{ animation: 'spin 1s linear infinite', marginBottom: '8px' }} />
          <h4 style={{ color: '#0f172a', marginBottom: '2px', fontSize: '0.95rem' }}>Analyzing Document with Groq AI...</h4>
          <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
            Preparing summary & script in {selectedLanguage.name}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '14px',
          color: '#991b1b',
          fontSize: '0.82rem',
        }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Notice:</p>
          <p>{error}</p>
          <button
            onClick={onOpenApiKeyModal}
            className="btn-secondary"
            style={{ marginTop: '8px', fontSize: '0.78rem', padding: '4px 10px' }}
          >
            View API Key Settings
          </button>
        </div>
      )}

      {/* Summary Content */}
      {summary && !loading && (
        <>
          {/* Executive Summary Card */}
          <div className="doc-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#334155" />
              Document Summary
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
              {summary.executiveSummary}
            </p>
          </div>

          {/* Key Takeaways Card */}
          <div className="doc-card" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              Key Takeaways
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {summary.keyTakeaways.map((bullet, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <button
                    onClick={() => handleSpeakBullet(bullet, idx)}
                    style={{
                      background: activeSpeakingText === `bullet_${idx}` ? '#1e293b' : '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      color: activeSpeakingText === `bullet_${idx}` ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                    title="Read aloud"
                  >
                    <Volume2 size={12} />
                  </button>
                  <span style={{ fontSize: '0.83rem', color: '#1e293b', lineHeight: '1.5' }}>
                    {bullet}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Breakdown Accordion */}
          {summary.sections.length > 0 && (
            <div className="doc-card" style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                Section Outline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summary.sections.map((sec, idx) => {
                  const isExpanded = !!expandedSections[idx];
                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => toggleSection(idx)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: '#0f172a',
                          fontWeight: 600,
                          fontSize: '0.83rem',
                          textAlign: 'left',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{sec.heading}</span>
                        {isExpanded ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
                      </button>
                      {isExpanded && (
                        <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', background: '#ffffff' }}>
                          {sec.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
