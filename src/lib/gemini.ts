export class GeminiAI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  async parseVoucherCommand(command: string): Promise<any> {
    const prompt = `
      You are an accounting assistant. Parse the following natural language command into a structured voucher entry:
      
      Command: "${command}"
      
      Please respond with a JSON object containing:
      - voucher_type: (sales/purchase/receipt/payment/journal/contra/debit_note/credit_note)
      - amount: number
      - party: string (if applicable)
      - ledger_entries: array of {ledger_name: string, debit: number, credit: number}
      - narration: string
      - items: array of {name: string, quantity: number, rate: number} (if applicable)
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  }

  async analyzeReport(reportData: any, reportType: string): Promise<string> {
    const prompt = `
      Analyze the following ${reportType} report data and provide insights in simple language:
      
      Data: ${JSON.stringify(reportData)}
      
      Please provide:
      1. Key observations
      2. Trends or patterns
      3. Potential issues or opportunities
      4. Recommendations
      
      Keep the response concise and business-focused.
    `;

    return await this.generateContent(prompt);
  }
}