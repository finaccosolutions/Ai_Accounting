import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { MessageSquare } from 'lucide-react';

interface VoucherNarrationSectionProps {
  voucher: any;
  setVoucher: (updater: (prev: any) => any) => void;
}

export const VoucherNarrationSection: React.FC<VoucherNarrationSectionProps> = ({
  voucher,
  setVoucher
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6"
    >
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
          Voucher Narration
        </label>
        <textarea
          value={voucher.narration}
          onChange={(e) => setVoucher(prev => ({ ...prev, narration: e.target.value }))}
          placeholder="Enter detailed description of the transaction..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </Card>
    </motion.div>
  );
};