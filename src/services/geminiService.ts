import { GoogleGenAI } from '@google/genai';
import { getStoredApiKey } from './storageService';
import { pdfCache } from './cacheService';
import { INDIAN_LANGUAGES } from '../constants/languages';
import { PdfSummaryResult, ChatMessage } from '../types/pdf';

// Working models in priority order for Gemini API keys
const PREFERRED_MODELS = [
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-001',
];

export async function getActiveApiKey(): Promise<string> {
  const envKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.EXPO_PUBLIC_GEMINI_API_KEY;

  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  const userKey = getStoredApiKey();
  if (userKey && userKey.trim().length > 0) {
    return userKey.trim();
  }

  return 'AIzaSyCJ1fLhNMyWEIgqoFUZU3u-qJ62l2GXG5k';
}

/**
 * Generates content using dynamic model fallback
 */
async function generateContentWithFallback(ai: GoogleGenAI, payloadWithoutModel: any): Promise<any> {
  let lastError: any = null;

  for (const modelName of PREFERRED_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...payloadWithoutModel,
        model: modelName,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`Model '${modelName}' notice: ${err?.message}. Trying fallback candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate content with available Gemini models.');
}

/**
 * Extracts key information & generates a multi-lingual conversational summary for audio dictation via Gemini AI
 * Uses Client Cache Service for instant 0ms responses on repeat requests.
 */
export async function generatePdfSummary(
  pdfBase64: string,
  languageCode: string = 'hi-IN'
): Promise<PdfSummaryResult> {
  // Check fast client cache first (0ms latency)
  const cached = pdfCache.get<PdfSummaryResult>(pdfBase64, 'summary', languageCode);
  if (cached) {
    return cached;
  }

  const apiKey = await getActiveApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key missing. Please configure your API key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const targetLang = INDIAN_LANGUAGES.find((l) => l.code === languageCode) || INDIAN_LANGUAGES[0];

  const prompt = `You are an expert AI document narrator and concise research analyst.
Analyze the attached PDF document and output a structured JSON object.

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

  try {
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const response = await generateContentWithFallback(ai, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
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

    // Store in instant cache
    pdfCache.set(pdfBase64, 'summary', languageCode, result);

    return result;
  } catch (error: any) {
    console.error('Gemini Summary Error:', error);
    throw new Error(error?.message || 'Failed to generate PDF summary with Gemini AI.');
  }
}

/**
 * Answers questions about the PDF document retaining context via Gemini AI
 * Uses Client Cache Service for instant response on repeated questions.
 */
export async function chatWithPdf(
  pdfBase64: string,
  chatHistory: ChatMessage[],
  userQuestion: string,
  languageCode: string = 'en-IN'
): Promise<string> {
  const cacheKey = `${userQuestion}_${languageCode}`;
  const cachedAnswer = pdfCache.get<string>(pdfBase64, 'chat', cacheKey);
  if (cachedAnswer) {
    return cachedAnswer;
  }

  const apiKey = await getActiveApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key missing. Please configure your API key in settings.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const targetLang = INDIAN_LANGUAGES.find((l) => l.code === languageCode) || INDIAN_LANGUAGES[0];

  const formattedHistory = chatHistory
    .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
    .join('\n');

  const prompt = `You are a helpful AI assistant answering questions about the attached PDF document.

LANGUAGE INSTRUCTION: Answer in simple, clear ${targetLang.name} unless requested otherwise.

Conversation History:
${formattedHistory}

Current User Question:
${userQuestion}

Give a direct, accurate, and conversational answer based on the PDF content. Highlight key figures, dates, or terms clearly.`;

  try {
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');

    const response = await generateContentWithFallback(ai, {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: cleanBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const replyText = response.text || 'I analyzed the document, but could not generate a response. Please try rephrasing.';

    // Store in cache
    pdfCache.set(pdfBase64, 'chat', cacheKey, replyText);

    return replyText;
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    throw new Error(error?.message || 'Failed to get answer from Gemini AI.');
  }
}
