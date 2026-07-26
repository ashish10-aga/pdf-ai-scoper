import * as pdfjsLib from 'pdfjs-dist';
import { getStoredApiKey } from './storageService';
import { pdfCache } from './cacheService';
import { INDIAN_LANGUAGES } from '../constants/languages';
import { PdfSummaryResult, ChatMessage } from '../types/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Groq High Performance Models in priority order
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
];

export async function getActiveApiKey(): Promise<string> {
  const envKey =
    (typeof process !== 'undefined' && process.env?.GROQ_API_KEY) ||
    (import.meta as any).env?.VITE_GROQ_API_KEY;

  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  const userKey = getStoredApiKey();
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }

  return '';
}

/**
 * Extracts clean structured text & page breakdown from PDF document
 */
export async function extractTextFromPdf(pdfBase64: string): Promise<string> {
  try {
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdfDoc = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ').trim();
      if (pageText.length > 0) {
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
    }

    return fullText.trim() || 'No selectable text found in PDF document.';
  } catch (err) {
    console.error('Error extracting text from PDF:', err);
    return 'Document text extraction fallback.';
  }
}

/**
 * Executes request against Groq Open-Source Inference API with dynamic model fallback
 */
async function callGroqApi(messages: any[], jsonFormat: boolean = false): Promise<string> {
  const apiKey = await getActiveApiKey();
  if (!apiKey) {
    throw new Error('Groq API Key missing. Please enter your API key in settings or set VITE_GROQ_API_KEY.');
  }

  let lastError: any = null;

  for (const modelName of GROQ_MODELS) {
    try {
      const bodyPayload: any = {
        model: modelName,
        messages,
        temperature: 0.3,
      };

      if (jsonFormat) {
        bodyPayload.response_format = { type: 'json_object' };
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `Groq API request failed with status ${response.status}`;
        console.warn(`Groq Model '${modelName}' notice: ${message}. Trying fallback candidate...`);
        lastError = new Error(message);
        continue;
      }

      const data = await response.json();
      const replyText = data?.choices?.[0]?.message?.content || '';
      if (replyText) {
        return replyText;
      }
    } catch (err: any) {
      console.warn(`Groq request error for '${modelName}':`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate response with Groq API.');
}

/**
 * Extracts key information & generates a multi-lingual conversational summary for audio dictation via Groq API
 */
export async function generatePdfSummary(
  pdfBase64: string,
  languageCode: string = 'hi-IN'
): Promise<PdfSummaryResult> {
  // Check instant 0ms client cache
  const cached = pdfCache.get<PdfSummaryResult>(pdfBase64, 'summary', languageCode);
  if (cached) return cached;

  const documentText = await extractTextFromPdf(pdfBase64);
  const targetLang = INDIAN_LANGUAGES.find((l) => l.code === languageCode) || INDIAN_LANGUAGES[0];

  const systemPrompt = `You are an expert AI document narrator and concise research analyst.
Analyze the provided PDF text and output a structured JSON object.

LANGUAGE INSTRUCTION: ${targetLang.promptInstruction}

Please return ONLY a JSON object with these exact keys (no markdown code blocks, no trailing comments):
{
  "title": "Short descriptive title of this document in ${targetLang.name}",
  "executiveSummary": "A concise 2-3 paragraph overview of the document in ${targetLang.name}.",
  "keyTakeaways": [
    "Key takeaway point 1 in ${targetLang.name}",
    "Key takeaway point 2 in ${targetLang.name}",
    "Key takeaway point 3 in ${targetLang.name}",
    "Key takeaway point 4 in ${targetLang.name}"
  ],
  "conversationalScript": "A warm, natural, conversational narration script of this document in ${targetLang.name}, designed for clear Text-To-Speech audio dictation.",
  "sections": [
    {
      "heading": "Section 1 Heading in ${targetLang.name}",
      "content": "Detailed breakdown in ${targetLang.name}"
    },
    {
      "heading": "Section 2 Heading in ${targetLang.name}",
      "content": "Detailed breakdown in ${targetLang.name}"
    }
  ]
}`;

  const userPrompt = `PDF Document Content:\n${documentText.slice(0, 32000)}`;

  try {
    const responseText = await callGroqApi(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      true
    );

    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);

    const result: PdfSummaryResult = {
      title: parsed.title || 'PDF Analysis Summary',
      executiveSummary: parsed.executiveSummary || '',
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [],
      conversationalScript: parsed.conversationalScript || parsed.executiveSummary || '',
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      languageCode: targetLang.code,
    };

    pdfCache.set(pdfBase64, 'summary', languageCode, result);
    return result;
  } catch (error: any) {
    console.error('Groq Summary Error:', error);
    throw new Error(error?.message || 'Failed to generate PDF summary with Groq API.');
  }
}

/**
 * Answers questions about the PDF document retaining context via Groq API
 */
export async function chatWithPdf(
  pdfBase64: string,
  chatHistory: ChatMessage[],
  userQuestion: string,
  languageCode: string = 'en-IN'
): Promise<string> {
  const cacheKey = `${userQuestion}_${languageCode}`;
  const cachedAnswer = pdfCache.get<string>(pdfBase64, 'chat', cacheKey);
  if (cachedAnswer) return cachedAnswer;

  const documentText = await extractTextFromPdf(pdfBase64);
  const targetLang = INDIAN_LANGUAGES.find((l) => l.code === languageCode) || INDIAN_LANGUAGES[0];

  const systemPrompt = `You are a helpful AI assistant answering questions about the attached PDF document.

LANGUAGE INSTRUCTION: Answer in simple, clear ${targetLang.name} unless requested otherwise.

PDF Document Content:
${documentText.slice(0, 32000)}`;

  const messages: any[] = [{ role: 'system', content: systemPrompt }];

  chatHistory.forEach((msg) => {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    });
  });

  messages.push({ role: 'user', content: userQuestion });

  try {
    const replyText = await callGroqApi(messages, false);
    const finalAnswer = replyText || 'I analyzed the document, but could not generate a response. Please try rephrasing.';
    pdfCache.set(pdfBase64, 'chat', cacheKey, finalAnswer);
    return finalAnswer;
  } catch (error: any) {
    console.error('Groq Chat Error:', error);
    throw new Error(error?.message || 'Failed to get answer from Groq API.');
  }
}
