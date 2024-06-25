export interface CompanyData {
  assistantId: string;
  companyName: string;
  summary?: string;
  sentiment?: string;
  earningsReport: Record<string, string>;
}
