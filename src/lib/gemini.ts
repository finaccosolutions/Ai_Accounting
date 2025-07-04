import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ Missing Gemini API key. AI features will be limited.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const geminiModel = genAI ? genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  }
}) : null;

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

export interface FinancialAnalysis {
  profitability: {
    grossProfitMargin: number;
    netProfitMargin: number;
    trend: 'improving' | 'declining' | 'stable';
    insights: string[];
  };
  cashFlow: {
    operatingCashFlow: number;
    cashPosition: number;
    burnRate: number;
    insights: string[];
  };
  efficiency: {
    receivablesTurnover: number;
    payablesTurnover: number;
    inventoryTurnover: number;
    insights: string[];
  };
  risks: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  };
}

export interface AuditFindings {
  duplicateEntries: Array<{
    voucher1: string;
    voucher2: string;
    similarity: number;
    reason: string;
  }>;
  anomalies: Array<{
    type: 'unusual_amount' | 'timing' | 'pattern' | 'compliance';
    description: string;
    severity: 'low' | 'medium' | 'high';
    recommendation: string;
  }>;
  complianceIssues: Array<{
    type: 'gst' | 'tds' | 'documentation' | 'approval';
    description: string;
    impact: string;
    solution: string;
  }>;
}

export const parseVoucherCommand = async (command: string, context?: any): Promise<VoucherSuggestion> => {
  if (!geminiModel) {
    throw new Error('Gemini AI is not available. Please check your API key.');
  }

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
  if (!geminiModel) {
    return [
      {
        type: 'info',
        title: 'AI Features Limited',
        description: 'Gemini AI is not configured. Please add your API key to enable advanced AI insights.',
        priority: 'medium'
      }
    ];
  }

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
8. Profitability analysis
9. Expense optimization
10. Revenue growth opportunities

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

export const analyzeFinancialPerformance = async (data: any): Promise<FinancialAnalysis> => {
  if (!geminiModel) {
    throw new Error('Gemini AI is not available');
  }

  const prompt = `
Analyze the following financial data and provide comprehensive performance analysis:

Data: ${JSON.stringify(data)}

Respond with JSON in this exact format:
{
  "profitability": {
    "grossProfitMargin": number,
    "netProfitMargin": number,
    "trend": "improving|declining|stable",
    "insights": ["insight1", "insight2"]
  },
  "cashFlow": {
    "operatingCashFlow": number,
    "cashPosition": number,
    "burnRate": number,
    "insights": ["insight1", "insight2"]
  },
  "efficiency": {
    "receivablesTurnover": number,
    "payablesTurnover": number,
    "inventoryTurnover": number,
    "insights": ["insight1", "insight2"]
  },
  "risks": {
    "level": "low|medium|high",
    "factors": ["factor1", "factor2"],
    "recommendations": ["rec1", "rec2"]
  }
}

Calculate actual ratios and provide meaningful insights.
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing financial performance:', error);
    throw new Error('Failed to analyze financial performance');
  }
};

export const performAuditAnalysis = async (data: any): Promise<AuditFindings> => {
  if (!geminiModel) {
    throw new Error('Gemini AI is not available');
  }

  const prompt = `
Perform audit analysis on the following accounting data:

Data: ${JSON.stringify(data)}

Analyze for:
1. Duplicate entries
2. Unusual patterns or anomalies
3. Compliance issues
4. Missing documentation
5. Approval workflows

Respond with JSON in this exact format:
{
  "duplicateEntries": [
    {
      "voucher1": "voucher_id_1",
      "voucher2": "voucher_id_2", 
      "similarity": 95,
      "reason": "Same amount and date"
    }
  ],
  "anomalies": [
    {
      "type": "unusual_amount|timing|pattern|compliance",
      "description": "Description of anomaly",
      "severity": "low|medium|high",
      "recommendation": "What to do about it"
    }
  ],
  "complianceIssues": [
    {
      "type": "gst|tds|documentation|approval",
      "description": "Issue description",
      "impact": "Potential impact",
      "solution": "How to fix"
    }
  ]
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error performing audit analysis:', error);
    throw new Error('Failed to perform audit analysis');
  }
};

export const generateTaxOptimizationSuggestions = async (data: any): Promise<string[]> => {
  if (!geminiModel) {
    return ['Gemini AI is not configured for tax optimization suggestions.'];
  }

  const prompt = `
Analyze the following financial data for tax optimization opportunities:

Data: ${JSON.stringify(data)}

Provide 5-10 specific, actionable tax optimization suggestions for an Indian business.
Consider:
1. GST optimization
2. Income tax planning
3. Deduction opportunities
4. Timing strategies
5. Compliance improvements

Respond with a JSON array of strings:
["suggestion1", "suggestion2", "suggestion3"]
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
    console.error('Error generating tax optimization suggestions:', error);
    return ['Error generating tax optimization suggestions'];
  }
};

export const chatWithAI = async (message: string, context?: any): Promise<string> => {
  if (!geminiModel) {
    return 'I apologize, but AI chat is not available. Please configure your Gemini API key to enable this feature.';
  }

  const prompt = `
You are an AI assistant for an accounting software. Help the user with their accounting questions and tasks.

User message: "${message}"
Context: ${JSON.stringify(context || {})}

Provide helpful, accurate accounting advice. If the user wants to create vouchers or perform actions, guide them step by step.

Keep responses conversational but professional. If you need more information, ask specific questions.

You can help with:
- Creating and understanding vouchers
- Financial analysis and insights
- Tax compliance and optimization
- Audit and compliance checks
- Business performance analysis
- Accounting best practices
- GST and Indian tax regulations
- Cash flow management
- Expense optimization
- Revenue analysis
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

export const generateExpenseOptimizationReport = async (data: any): Promise<{
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    optimization: string;
  }>;
  recommendations: string[];
  potentialSavings: number;
}> => {
  if (!geminiModel) {
    throw new Error('Gemini AI is not available');
  }

  const prompt = `
Analyze expense data and provide optimization recommendations:

Data: ${JSON.stringify(data)}

Respond with JSON:
{
  "categories": [
    {
      "name": "category name",
      "amount": number,
      "percentage": number,
      "trend": "increasing|decreasing|stable",
      "optimization": "specific optimization suggestion"
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "potentialSavings": number
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating expense optimization report:', error);
    throw new Error('Failed to generate expense optimization report');
  }
};