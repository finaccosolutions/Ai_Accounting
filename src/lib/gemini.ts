import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  }
});

export interface VoucherSuggestion {
  voucherType: string;
  party?: string;
  amount: number;
  narration: string;
  entries: {
    ledger: string;
    amount: number;
    type: 'debit' | 'credit';
    stockItem?: string;
    quantity?: number;
    rate?: number;
  }[];
}

export interface AIInsightResponse {
  type: 'warning' | 'suggestion' | 'info' | 'error';
  title: string;
  description: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

export const parseVoucherCommand = async (command: string, context?: any): Promise<VoucherSuggestion> => {
  const prompt = `
You are an AI assistant for an accounting software. Parse the following natural language command into a structured voucher entry.

Command: "${command}"

Context (if available): ${JSON.stringify(context || {})}

Please respond with a JSON object in this exact format:
{
  "voucherType": "sales|purchase|receipt|payment|journal|contra|debit_note|credit_note",
  "party": "party name if mentioned",
  "amount": total_amount_number,
  "narration": "description of the transaction",
  "entries": [
    {
      "ledger": "ledger account name",
      "amount": amount_number,
      "type": "debit|credit",
      "stockItem": "item name if applicable",
      "quantity": quantity_number_if_applicable,
      "rate": rate_per_unit_if_applicable
    }
  ]
}

Rules:
1. For sales: Debit Customer/Cash/Bank, Credit Sales Account
2. For purchases: Debit Purchase Account, Credit Supplier/Cash/Bank
3. For receipts: Debit Cash/Bank, Credit Customer/Income Account
4. For payments: Debit Expense/Supplier Account, Credit Cash/Bank
5. Always ensure debits equal credits
6. Include GST calculations if mentioned
7. Use standard accounting ledger names

Respond only with valid JSON, no additional text.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error parsing voucher command:', error);
    throw new Error('Failed to parse voucher command');
  }
};

export const generateAIInsights = async (data: any): Promise<AIInsightResponse[]> => {
  const prompt = `
You are an AI assistant for an accounting software. Analyze the following financial data and generate insights.

Data: ${JSON.stringify(data)}

Generate 3-5 insights in JSON array format:
[
  {
    "type": "warning|suggestion|info|error",
    "title": "Short insight title",
    "description": "Detailed description",
    "action": "Suggested action (optional)",
    "priority": "low|medium|high"
  }
]

Focus on:
1. Cash flow issues
2. Outstanding payments
3. Tax compliance
4. Unusual transactions
5. Performance trends
6. Duplicate entries
7. Missing information

Respond only with valid JSON array, no additional text.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON array found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
  }
};

export const chatWithAI = async (message: string, context?: any): Promise<string> => {
  const prompt = `
You are an AI assistant for an accounting software. Help the user with their accounting questions and tasks.

User message: "${message}"
Context: ${JSON.stringify(context || {})}

Provide helpful, accurate accounting advice. If the user wants to create vouchers or perform actions, guide them step by step.

Keep responses conversational but professional. If you need more information, ask specific questions.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in AI chat:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
};