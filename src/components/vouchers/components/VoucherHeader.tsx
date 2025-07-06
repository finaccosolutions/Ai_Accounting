import React from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Hash, Calendar } from 'lucide-react';

interface VoucherHeaderProps {
  voucher: any;
  onVoucherChange: (voucher: any) => void;
}

export const VoucherHeader: React.FC<VoucherHeaderProps> = ({
  voucher,
  onVoucherChange
}) => {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
        Voucher Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-1" />
            Voucher Number
          </label>
          <Input
            value={voucher.voucher_number}
            onChange={(e) => onVoucherChange(prev => ({ ...prev, voucher_number: e.target.value }))}
            placeholder="Auto-generated"
            className="bg-gray-50/80 border-gray-200"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date
          </label>
          <Input
            type="date"
            value={voucher.date}
            onChange={(e) => onVoucherChange(prev => ({ ...prev, date: e.target.value }))}
            className="border-gray-200"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reference Number
          </label>
          <Input
            value={voucher.reference}
            onChange={(e) => onVoucherChange(prev => ({ ...prev, reference: e.target.value }))}
            placeholder="Reference number"
            className="border-gray-200"
          />
        </div>
      </div>
    </Card>
  );
};