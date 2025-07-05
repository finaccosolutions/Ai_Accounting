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
      You are an expert accounting assistant. Parse the following natural language command into a structured voucher entry for an Indian accounting system:
      
      Command: "${command}"
      
      Please respond with a JSON object containing:
      - voucher_type: (sales/purchase/receipt/payment/journal/contra/debit_note/credit_note)
      - amount: number (total amount)
      - party: string (customer/vendor name if applicable)
      - ledger_entries: array of {ledger_name: string, debit_amount: number, credit_amount: number, narration: string}
      - narration: string (overall transaction description)
      - items: array of {name: string, quantity: number, rate: number, amount: number} (if applicable)
      - tax_details: {cgst: number, sgst: number, igst: number} (if applicable)
      - reference: string (invoice/bill number if mentioned)
      
      Rules:
      1. For sales: Debit Customer/Cash, Credit Sales Account
      2. For purchases: Debit Purchase Account, Credit Vendor/Cash
      3. For receipts: Debit Cash/Bank, Credit Customer/Income
      4. For payments: Debit Expense/Vendor, Credit Cash/Bank
      5. Always ensure total debits = total credits
      6. Include GST calculations if amounts suggest tax inclusion
      
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

// Create a singleton instance with the API key
export const geminiAI = new GeminiAI('AIzaSyBHoEz1DmTs55w2ed30X2GpaNhvUlmHETo');