export interface PdfDocument {
  name: string;
  uri: string;
  base64: string;
  pageCount?: number;
  size?: number;
}

export interface SummarySection {
  heading: string;
  content: string;
}

export interface PdfSummaryResult {
  title: string;
  executiveSummary: string;
  keyTakeaways: string[];
  conversationalScript: string;
  sections: SummarySection[];
  languageCode: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  promptInstruction: string;
  voiceCode: string;
}
