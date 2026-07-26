import { PdfDocument } from '../types/pdf';

// Minimal valid single-page PDF with text header
const SAMPLE_PDF_1_BASE64 = `JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDAKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFsgMyAwIFIgXQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCjUgMCBvYmoKPDAKL0xlbmd0aCAxMjgKPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgo1MCA3NTAgVGQKKFE0IDIwMjUgRmluYW5jaWFsICYgQUkgU3RyYXRlZ3kgUmVwb3J0KSBUagowIC0zMCBUZAovRjEgMTIgVGYKKFJldmVudWU6ICQ0Mi41TSB8IEFJIHByb2R1Y3QgZ3Jvd3RoOiArMTQ1JSB8IE9wZXJhdGluZyBNYXJnaW46IDI4JSkgVGoKRVQKc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwDYDY1NTM1IGYKMDAwMDAwMDAwOSAwMDAwMCBuCjAwMDAwMDAwNTUgMDAwMDAgbgowMDAwMDAwMTE1IDAwMDAwIG4KMDAwMDAwMDIyNCAwMDAwMCBuCjAwMDAwMDAyOTIgMDAwMDAgbgp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ3MQolJUVPRg==`;

const SAMPLE_PDF_2_BASE64 = `JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDAKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFsgMyAwIFIgXQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDQgMCBSCj4+Cj4+Ci9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKNCAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCjUgMCBvYmoKPDAKL0xlbmd0aCAxMzUKPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgo1MCA3NTAgVGQKKENsaW5pY2FsIEd1aWRlbGluZXMgZm9yIEh5cGVydGVuc2lvbiBNYW5hZ2VtZW50KSBUagowIC0zMCBUZAovRjEgMTIgVGYKKExpZmVzdHlsZSBtb2RpZmljYXRpb25zLCBERVNIIGRpZXQsIGFuZCBmaXJzdC1saW5lIGFudGloeXBlcnRlbnNpdmUgYWdlbnRzKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZgowMDAwMDAwMDA5IDAwMDAwIG4KMDAwMDAwMDA1NSAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgowMDAwMDAwMjI0IDAwMDAwIG4KMDAwMDAwMDI5MiAwMDAwMCBuCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDc4CiUlRU9G`;

export interface SamplePdfOption {
  title: string;
  category: string;
  description: string;
  icon: string;
  pdf: PdfDocument;
}

export const SAMPLE_PDFS: SamplePdfOption[] = [
  {
    title: 'Q4 Financial & AI Tech Strategy Report',
    category: 'Finance & Corporate',
    description: 'Q4 revenue updates, AI division ARR expansion, operating margin targets, and R&D capital allocation.',
    icon: '📈',
    pdf: {
      name: 'Q4_2025_Financial_Strategy_Report.pdf',
      uri: 'sample-1',
      base64: SAMPLE_PDF_1_BASE64,
      pageCount: 1,
      size: 14280,
    },
  },
  {
    title: 'Clinical Guidelines for Hypertension Management',
    category: 'Healthcare & Medical',
    description: 'Evidence-based protocols for blood pressure classification, DASH dietary interventions, and drug choices.',
    icon: '🩺',
    pdf: {
      name: 'Clinical_Guidelines_Hypertension_2025.pdf',
      uri: 'sample-2',
      base64: SAMPLE_PDF_2_BASE64,
      pageCount: 1,
      size: 18450,
    },
  },
];
