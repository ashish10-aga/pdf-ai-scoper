# VoiceAI PDF Reader & Multilingual Audio Narrator

An AI-powered web application for reading PDF documents, listening to multilingual voice audio dictations, and interacting via context-aware AI document chat. Built for 1-click deployment on **Vercel**.

## 🌟 Key Features
- **PDF Canvas Document Viewer**: Canvas-based PDF page rendering with page navigation, zoom controls, and drag-and-drop file support.
- **Multilingual Voice Audio Narrator**: Generates structured summaries & audio narration scripts across 12+ languages (Hindi, English, Hinglish, Tamil, Telugu, Spanish, French, etc.) with real-time waveform playback and rate control (0.75x–2.0x).
- **Interactive AI Document Chat**: Context-aware Q&A stream with prompt suggestion chips and speech-to-text mic dictation.
- **Instant Client Cache**: Zero-latency in-memory and persistent caching for instant responses on repeat requests.
- **Document-First UI Design**: Clean paper document workspace theme optimized for desktop and mobile web browsers.

## ⚡ Advanced React Performance & Optimizations
- **Lazy Loading & Code Splitting**: Utilizing `React.lazy` and `React.Suspense` for modular component loading.
- **Optimized Bundle Splitting**: Rollup `manualChunks` separation for `pdfjs-dist`, `@google/genai`, and `lucide-react`, reducing initial bundle size to **~13 kB** for lightning-fast cold starts on Vercel.
- **Render Optimizations**: Component memoization (`useCallback`, `useMemo`, `React.memo`) to eliminate unnecessary re-renders.

## 🚀 Tech Stack
- **Framework**: React 19 + TypeScript + Vite 6
- **AI Engine**: Google GenAI SDK (`@google/genai`) with Gemini 2.5/2.0 Flash models & dynamic fallback
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
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
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
3. Add the Environment Variable `VITE_GEMINI_API_KEY` in Vercel settings.
4. Click **Deploy**!
