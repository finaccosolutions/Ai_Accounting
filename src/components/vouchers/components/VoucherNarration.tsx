import React from 'react';
import { Card } from '../../ui/Card';
import { MessageSquare } from 'lucide-react';

interface VoucherNarrationProps {
  narration: string;
  onNarrationChange: (narration: string) => void;
}

export const VoucherNarration: React.FC<VoucherNarrationProps> = ({
  narration,
  onNarrationChange
}) => {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
        Voucher Narration
      </label>
      <textarea
        value={narration}
        onChange={(e) => onNarrationChange(e.target.value)}
        placeholder="Enter detailed description of the transaction..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      />
    </Card>
  );
};