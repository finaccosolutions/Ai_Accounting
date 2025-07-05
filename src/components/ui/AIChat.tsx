import React, { useState, useEffect } from 'react';
import { X, Send, Bot, User, Lightbulb } from 'lucide-react';
import { chatWithAI, parseVoucherCommand } from '../../lib/gemini';
import { useApp } from '../../contexts/AppContext';
import { useLedgers } from '../../hooks/useLedgers';
import { useVouchers } from '../../hooks/useVouchers';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose }) => {
  const { currentCompany } = useApp();
  const { ledgers } = useLedgers();
  const { createVoucher, generateVoucherNumber, voucherTypes } = useVouchers();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI accounting assistant. I can help you with voucher entries, explain reports, detect anomalies, and much more. What would you like to do today?',
      timestamp: new Date(),
      suggestions: [
        'Create a sales voucher for ABC Ltd',
        'Show me profit and loss summary',
        'Check for duplicate entries',
        'Explain GST compliance status'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      // Check if this is a voucher creation command
      if (currentInput.toLowerCase().includes('voucher') || 
          currentInput.toLowerCase().includes('create') ||
          currentInput.toLowerCase().includes('add') ||
          currentInput.toLowerCase().includes('record')) {
        
        await handleVoucherCommand(currentInput);
      } else {
        // Regular chat
        const context = {
          company: currentCompany,
          ledgers: ledgers.slice(0, 10), // Limit context size
          voucherTypes: voucherTypes,
        };

        const aiResponse = await chatWithAI(currentInput, context);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiResponse,
          timestamp: new Date(),
          suggestions: getAISuggestions(currentInput)
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your request.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoucherCommand = async (command: string) => {
    try {
      const voucherSuggestion = await parseVoucherCommand(command, {
        ledgers: ledgers.map(l => l.name),
        voucherTypes: voucherTypes.map(vt => vt.name),
      });

      // Create a preview message
      const previewMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `I've analyzed your request and created a voucher preview:\n\n**Voucher Type:** ${voucherSuggestion.voucherType}\n**Party:** ${voucherSuggestion.party || 'Not specified'}\n**Amount:** ₹${voucherSuggestion.amount.toLocaleString()}\n**Narration:** ${voucherSuggestion.narration}\n\n**Entries:**\n${voucherSuggestion.entries.map(entry => `• ${entry.type === 'debit' ? 'Dr.' : 'Cr.'} ${entry.ledger}: ₹${entry.amount.toLocaleString()}`).join('\n')}\n\nWould you like me to create this voucher?`,
        timestamp: new Date(),
        suggestions: ['Yes, create this voucher', 'Modify the entries', 'Cancel']
      };

      setMessages(prev => [...prev, previewMessage]);

      // Store the suggestion for potential creation
      (window as any).pendingVoucherSuggestion = voucherSuggestion;
    } catch (error) {
      console.error('Error parsing voucher command:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I couldn\'t parse that voucher command. Please try rephrasing it or provide more specific details like amounts, party names, and account names.',
        timestamp: new Date(),
        suggestions: [
          'Create sales voucher for ₹10,000 to ABC Ltd',
          'Record payment of ₹5,000 for office rent',
          'Add purchase voucher from XYZ Corp for ₹15,000'
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getAISuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('sales')) {
      return [
        'Show sales report for this month',
        'Create another sales voucher',
        'Check outstanding receivables'
      ];
    }
    
    if (lowerInput.includes('profit')) {
      return [
        'Show detailed P&L statement',
        'Compare with previous quarter',
        'Export profit analysis'
      ];
    }
    
    return [
      'Show me today\'s entries',
      'Check pending tasks',
      'Generate monthly summary'
    ];
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (suggestion === 'Yes, create this voucher') {
      const pendingSuggestion = (window as any).pendingVoucherSuggestion;
      if (pendingSuggestion && currentCompany) {
        try {
          // Find voucher type
          const voucherType = voucherTypes.find(vt => 
            vt.name.toLowerCase() === pendingSuggestion.voucherType.toLowerCase()
          );

          if (!voucherType) {
            throw new Error('Voucher type not found');
          }

          // Generate voucher number
          const voucherNumber = await generateVoucherNumber(voucherType.id);

          // Create voucher
          const voucherData = {
            voucher_type_id: voucherType.id,
            voucher_number: voucherNumber,
            voucher_date: new Date().toISOString().split('T')[0],
            narration: pendingSuggestion.narration,
            total_amount: pendingSuggestion.amount,
            status: 'draft' as const,
          };

          // Create entries
          const entries = pendingSuggestion.entries.map((entry: any) => {
            const ledger = ledgers.find(l => 
              l.name.toLowerCase().includes(entry.ledger.toLowerCase())
            );

            return {
              ledger_id: ledger?.id || null,
              entry_type: entry.type,
              amount: entry.amount,
              quantity: entry.quantity || null,
              rate: entry.rate || null,
              narration: entry.narration || null,
            };
          });

          await createVoucher(voucherData, entries);

          const successMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: `✅ Voucher created successfully!\n\n**Voucher Number:** ${voucherNumber}\n**Status:** Draft\n\nYou can find it in the Voucher Entry module to review or post it.`,
            timestamp: new Date(),
            suggestions: ['Create another voucher', 'View voucher list', 'Post this voucher']
          };

          setMessages(prev => [...prev, successMessage]);
          delete (window as any).pendingVoucherSuggestion;
        } catch (error) {
          console.error('Error creating voucher:', error);
          toast.error('Failed to create voucher');
        }
      }
    } else {
      setInput(suggestion);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-16 h-full w-96 bg-white border-l border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`px-3 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                </div>
              </div>
              
              {message.suggestions && (
                <div className="mt-2 space-y-1">
                  {message.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-200 transition-colors"
                    >
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your accounts..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};