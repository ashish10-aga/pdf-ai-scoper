import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Upload, FileText } from 'lucide-react';
import { PdfDocument } from '../types/pdf';

// Configure PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdf: PdfDocument | null;
  loading: boolean;
  error: string | null;
  onOpenSampleSelector: () => void;
  onOpenPicker: () => void;
  onFileDrop?: (file: File) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdf,
  loading,
  error,
  onOpenSampleSelector,
  onOpenPicker,
  onFileDrop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Load PDF Document when `pdf` prop changes
  useEffect(() => {
    if (!pdf || !pdf.base64) {
      setPdfDoc(null);
      return;
    }

    let isSubscribed = true;
    setRenderingPage(true);

    const loadPdf = async () => {
      try {
        const cleanBase64 = pdf.base64.replace(/^data:application\/pdf;base64,/, '');
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const loadedDoc = await loadingTask.promise;

        if (isSubscribed) {
          setPdfDoc(loadedDoc);
          setNumPages(loadedDoc.numPages);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error('Error rendering PDF:', err);
      } finally {
        if (isSubscribed) setRenderingPage(false);
      }
    };

    loadPdf();

    return () => {
      isSubscribed = false;
    };
  }, [pdf]);

  // Render Page onto Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let isSubscribed = true;

    const renderPage = async () => {
      try {
        setRenderingPage(true);
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Canvas render error:', err);
      } finally {
        if (isSubscribed) setRenderingPage(false);
      }
    };

    renderPage();

    return () => {
      isSubscribed = false;
    };
  }, [pdfDoc, currentPage, scale]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onFileDrop) {
      onFileDrop(e.dataTransfer.files[0]);
    }
  };

  if (!pdf) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: isDragOver ? '#e2e8f0' : '#f8fafc',
          border: isDragOver ? '2px dashed #2563eb' : '2px dashed #cbd5e1',
          borderRadius: '12px',
          margin: '24px',
          transition: 'all 0.15s ease',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}>
          <Upload size={28} color="#475569" />
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
          Open or Drag & Drop a PDF Document
        </h2>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '20px', fontSize: '0.88rem' }}>
          Select any PDF document to read, listen to dictation summaries, or ask questions.
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onOpenPicker} className="btn-primary">
            <Upload size={16} /> Open Local PDF
          </button>
          <button onClick={onOpenSampleSelector} className="btn-secondary">
            <FileText size={16} /> Choose Sample
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#e2e8f0', height: '100%' }}>
      {/* Viewer Sub-Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        background: '#ffffff',
        borderBottom: '1px solid #cbd5e1',
      }}>
        {/* Page Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: currentPage <= 1 ? '#94a3b8' : '#0f172a',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
            Page {currentPage} of {numPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: currentPage >= numPages ? '#94a3b8' : '#0f172a',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: currentPage >= numPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>

          <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>
        </div>
      </div>

      {/* Main Paper Workspace */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
        }}
      >
        {renderingPage && (
          <div style={{
            position: 'absolute',
            top: '20px',
            background: '#ffffff',
            padding: '6px 14px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            color: '#475569',
            fontSize: '0.8rem',
            fontWeight: 500,
            zIndex: 10,
          }}>
            Loading page...
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{
            background: '#ffffff',
            borderRadius: '2px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            border: '1px solid #cbd5e1',
            maxWidth: '100%',
          }}
        />
      </div>
    </div>
  );
};
