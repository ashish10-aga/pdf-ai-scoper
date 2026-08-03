# PDF AI Scoper

An AI-powered web application for reading PDF documents, listening to multilingual voice audio dictations, and interacting via context-aware AI document chat. Built for ultra-fast performance and 1-click deployment on **Vercel**.

## 🌟 Key Features
- **PDF Canvas Document Viewer**: Canvas-based PDF page rendering with page navigation, zoom controls, and drag-and-drop file support.
- **Multilingual Voice Audio Narrator**: Generates structured summaries & audio narration scripts across 12+ languages (Hindi, English, Hinglish, Tamil, Telugu, Spanish, French, etc.) with real-time waveform playback and rate control (0.75x–2.0x).
- **Interactive AI Document Chat**: Context-aware Q&A stream with prompt suggestion chips and speech-to-text mic dictation.
- **Instant Client Cache**: Zero-latency in-memory and persistent caching for instant responses on repeat requests.
- **Document-First UI Design**: Clean paper document workspace theme optimized for desktop and mobile web browsers.

## ⚡ Advanced React Performance & AI Engine
- **Ultra-Fast AI Engine**: Powered by **Groq High-Performance Open-Source Models** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with sub-second response times.
- **Lazy Loading & Code Splitting**: Utilizing `React.lazy` and `React.Suspense` for modular component loading.
- **Optimized Bundle Splitting**: Rollup `manualChunks` separation for `pdfjs-dist`, icons, and React vendor packages (~13 kB initial bundle).
- **Render Optimizations**: Component memoization (`useCallback`, `useMemo`, `React.memo`) to eliminate unnecessary re-renders.

## 🚀 Tech Stack
- **Framework**: React 19 + TypeScript + Vite 6
- **AI Engine**: Groq Open-Source Inference API (`llama-3.3-70b-versatile`)
- **PDF Engine**: `pdfjs-dist`
- **Speech Engine**: Web Speech API (`speechSynthesis` + `SpeechRecognition`)
- **Deployment**: Vercel ready (`vercel.json`)

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variable**:
   Create a `.env` file in the root directory:
   ```env
   VITE_GROQ_API_KEY=gsk_...(or any API key of your choice)
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```

## ☁️ Deploying on Vercel

1. Push this repository to GitHub.
2. Import the repository into your Vercel Dashboard.
3. Add the Environment Variable `VITE_GROQ_API_KEY` in Vercel settings.
4. Click **Deploy**!
