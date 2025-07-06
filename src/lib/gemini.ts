export class GeminiAI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateContent(prompt: string): Promise<string> {
    if (!this.apiKey || this.apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

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
        if (response.status === 404) {
          throw new Error('Invalid API key or endpoint not found. Please check your Gemini API key.');
        }
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
      You are an expert accounting assistant for an Indian accounting system. Parse this natural language command into a structured voucher entry:
      
      Command: "${command}"
      
      First, determine if you need more information to create a complete voucher entry. If the command is unclear or missing critical details, respond with:
      {
        "needs_clarification": true,
        "questions": ["What questions to ask the user"],
        "suggested_voucher_type": "payment/receipt/sales/purchase/journal"
      }
      
      If you have enough information, respond with:
      {
        "needs_clarification": false,
        "voucher_type": "payment/receipt/sales/purchase/journal/contra/debit_note/credit_note",
        "amount": number,
        "party_name": "string (if applicable)",
        "payment_method": "cash/bank/cheque/online",
        "bank_account": "string (if bank payment)",
        "reference_number": "string (cheque/transaction number if applicable)",
        "date": "YYYY-MM-DD (today's date if not specified)",
        "ledger_entries": [
          {
            "ledger_name": "string",
            "debit_amount": number,
            "credit_amount": number,
            "narration": "string"
          }
        ],
        "narration": "string (overall description)",
        "items": [
          {
            "name": "string",
            "quantity": number,
            "rate": number,
            "amount": number,
            "hsn_code": "string (if applicable)"
          }
        ],
        "tax_details": {
          "cgst_rate": number,
          "sgst_rate": number,
          "igst_rate": number,
          "cgst_amount": number,
          "sgst_amount": number,
          "igst_amount": number,
          "total_tax": number
        }
      }
      
      Accounting Rules:
      1. Payment: Debit Expense/Party Account, Credit Cash/Bank
      2. Receipt: Debit Cash/Bank, Credit Income/Party Account
      3. Sales: Debit Customer/Cash, Credit Sales Account + Tax Accounts
      4. Purchase: Debit Purchase Account + Tax Accounts, Credit Vendor/Cash
      5. Always ensure total debits = total credits
      6. Include GST at 18% if not specified and amount suggests business transaction
      7. For payments, ask if cash or bank payment
      8. For bank payments, ask which bank account
      
      Examples of clarification needed:
      - "payment to ABC Ltd 5000" → Ask: Cash or bank payment? Which bank account? What is the payment for?
      - "received money" → Ask: From whom? How much? Cash or bank? What is it for?
      - "sold goods" → Ask: To whom? What items? Quantity? Rate? With or without GST?
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        needs_clarification: true,
        questions: ["I couldn't understand your command. Could you please provide more details about the transaction?"],
        suggested_voucher_type: "journal"
      };
    }
  }

  async askFollowUpQuestion(originalCommand: string, previousResponse: any, userAnswer: string): Promise<any> {
    const prompt = `
      Original command: "${originalCommand}"
      Previous AI response: ${JSON.stringify(previousResponse)}
      User's answer: "${userAnswer}"
      
      Based on the user's answer, either:
      1. Ask another clarifying question if still need more info
      2. Generate the complete voucher entry if you have enough information
      
      Use the same JSON format as parseVoucherCommand.
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse follow-up response:', error);
      return {
        needs_clarification: true,
        questions: ["I need more information to process this transaction. Could you provide more details?"],
        suggested_voucher_type: "journal"
      };
    }
  }

  async parsePDFInvoice(extractedText: string): Promise<any> {
    const prompt = `
      Extract accounting information from this invoice/bill text and create a voucher entry:
      
      Text: "${extractedText}"
      
      Extract and respond with JSON containing:
      - voucher_type: (sales/purchase based on document type)
      - vendor_customer: string (party name)
      - invoice_number: string
      - invoice_date: string (YYYY-MM-DD format)
      - total_amount: number
      - tax_amount: number
      - net_amount: number (before tax)
      - items: array of {description: string, quantity: number, rate: number, amount: number}
      - tax_details: {cgst: number, sgst: number, igst: number, total_tax: number}
      - ledger_entries: array of accounting entries
      - hsn_codes: array of HSN codes found
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse PDF invoice:', error);
      return null;
    }
  }

  async parseBankStatement(extractedText: string): Promise<any> {
    const prompt = `
      Extract bank transactions from this bank statement text:
      
      Text: "${extractedText}"
      
      Extract and respond with JSON containing:
      - bank_name: string
      - account_number: string
      - statement_period: {from: string, to: string}
      - opening_balance: number
      - closing_balance: number
      - transactions: array of {
          date: string (YYYY-MM-DD),
          description: string,
          reference: string,
          debit: number,
          credit: number,
          balance: number,
          suggested_ledger: string (suggest appropriate ledger account),
          voucher_type: string (receipt/payment)
        }
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse bank statement:', error);
      return null;
    }
  }

  async createMasterFromCommand(command: string, masterType: string): Promise<any> {
    const prompt = `
      Create a ${masterType} master based on this command: "${command}"
      
      Respond with JSON containing the fields needed for ${masterType}:
      ${masterType === 'ledgers' ? `
      - name: string (ledger name)
      - group_type: string (assets/liabilities/income/expenses)
      - opening_balance: number (default 0)
      - is_bank_account: boolean (if it's a bank account)
      - bank_details: {account_number: string, ifsc: string, bank_name: string} (if bank account)
      ` : ''}
      ${masterType === 'ledger_groups' ? `
      - name: string
      - group_type: string (assets/liabilities/income/expenses)
      - parent_group_id: string (optional)
      ` : ''}
      ${masterType === 'stock_items' ? `
      - name: string
      - hsn_code: string (if applicable)
      - unit: string (Nos/Kg/Mtr etc.)
      - rate: number (default selling price)
      - opening_stock: number (default 0)
      - minimum_stock: number (reorder level)
      - maximum_stock: number (maximum stock level)
      ` : ''}
      ${masterType === 'stock_groups' ? `
      - name: string
      - parent_group_id: string (optional)
      ` : ''}
      ${masterType === 'units' ? `
      - name: string (full name like "Kilograms")
      - symbol: string (short form like "Kg")
      ` : ''}
      ${masterType === 'godowns' ? `
      - name: string
      - address: string (optional)
      - contact_person: string (optional)
      - phone: string (optional)
      ` : ''}
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to create master:', error);
      return null;
    }
  }

  async analyzeReport(reportData: any, reportType: string): Promise<string> {
    const prompt = `
      Analyze the following ${reportType} report data and provide business insights:
      
      Data: ${JSON.stringify(reportData, null, 2)}
      
      Please provide a comprehensive analysis including:
      
      1. **Key Financial Highlights:**
         - Most significant numbers and trends
         - Performance indicators
      
      2. **Business Insights:**
         - What the numbers tell us about business health
         - Areas of strength and concern
      
      3. **Trends & Patterns:**
         - Month-over-month or period-over-period changes
         - Seasonal patterns if visible
      
      4. **Recommendations:**
         - Specific actionable suggestions
         - Areas that need attention
         - Opportunities for improvement
      
      5. **Compliance & Risk Alerts:**
         - Any compliance issues to watch
         - Financial risks to monitor
      
      Keep the response business-focused, actionable, and easy to understand for business owners and accountants.
      Use bullet points and clear sections for readability.
    `;

    return await this.generateContent(prompt);
  }

  async auditAnalysis(voucherData: any[], ledgerData: any[]): Promise<string> {
    const prompt = `
      Perform an audit analysis on the following accounting data:
      
      Vouchers: ${JSON.stringify(voucherData.slice(0, 50), null, 2)}
      Ledgers: ${JSON.stringify(ledgerData.slice(0, 20), null, 2)}
      
      Analyze for:
      
      1. **Data Quality Issues:**
         - Missing or incomplete entries
         - Inconsistent naming conventions
         - Unusual amounts or patterns
      
      2. **Compliance Checks:**
         - GST compliance issues
         - TDS/TCS compliance
         - Voucher numbering sequence
      
      3. **Audit Red Flags:**
         - Duplicate entries
         - Round number bias
         - Unusual timing of transactions
         - Missing supporting documents
      
      4. **Internal Control Weaknesses:**
         - Segregation of duties issues
         - Authorization concerns
         - Documentation gaps
      
      5. **Recommendations:**
         - Process improvements
         - Control enhancements
         - Training needs
      
      Provide specific examples and actionable recommendations for each finding.
    `;

    return await this.generateContent(prompt);
  }

  async generateBusinessInsights(dashboardData: any): Promise<string> {
    const prompt = `
      Analyze this business dashboard data and provide strategic insights:
      
      Data: ${JSON.stringify(dashboardData, null, 2)}
      
      Provide insights on:
      
      1. **Financial Performance:**
         - Revenue trends and growth
         - Profitability analysis
         - Cash flow indicators
      
      2. **Operational Efficiency:**
         - Expense management
         - Working capital utilization
         - Inventory turnover (if applicable)
      
      3. **Business Health Indicators:**
         - Liquidity position
         - Debt management
         - Growth sustainability
      
      4. **Strategic Recommendations:**
         - Areas for cost optimization
         - Revenue enhancement opportunities
         - Investment priorities
      
      5. **Risk Assessment:**
         - Financial risks
         - Operational risks
         - Market risks
      
      Present insights in a clear, executive-friendly format with specific numbers and actionable recommendations.
    `;

    return await this.generateContent(prompt);
  }

  async suggestChartOfAccounts(industryType: string, companySize: string): Promise<any> {
    const prompt = `
      Suggest a comprehensive chart of accounts for a ${companySize} ${industryType} company in India:
      
      Provide JSON with:
      - ledger_groups: array of {name: string, group_type: string, description: string}
      - ledgers: array of {name: string, group_name: string, opening_balance: number, description: string}
      
      Include:
      1. Standard accounting heads (Assets, Liabilities, Income, Expenses)
      2. Industry-specific accounts
      3. GST-related ledgers
      4. TDS/TCS accounts
      5. Bank and cash accounts
      6. Common expense categories
      7. Revenue streams typical for the industry
      
      Only respond with valid JSON, no additional text.
    `;

    const response = await this.generateContent(prompt);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate chart of accounts:', error);
      return null;
    }
  }
}

// Create a singleton instance with the API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
export const geminiAI = new GeminiAI(apiKey || '');