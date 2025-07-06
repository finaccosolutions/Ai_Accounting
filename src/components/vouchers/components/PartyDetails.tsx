import React from 'react';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { User, CreditCard } from 'lucide-react';

const voucherTypesWithParty = ['sales', 'purchase', 'receipt', 'payment'];

interface PartyDetailsProps {
  voucher: any;
  onVoucherChange: (voucher: any) => void;
  voucherType: string;
}

export const PartyDetails: React.FC<PartyDetailsProps> = ({
  voucher,
  onVoucherChange,
  voucherType
}) => {
  if (!voucherTypesWithParty.includes(voucherType)) {
    return null;
  }

  const hasGST = ['sales', 'purchase'].includes(voucherType);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
        Party Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Party Name
          </label>
          <Input
            value={voucher.party_name}
            onChange={(e) => onVoucherChange(prev => ({ ...prev, party_name: e.target.value }))}
            placeholder={`${voucherType === 'sales' ? 'Customer' : voucherType === 'purchase' ? 'Vendor' : 'Party'} name`}
            className="border-gray-200"
          />
        </div>
        
        {hasGST && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Party GSTIN
            </label>
            <Input
              value={voucher.party_gstin}
              onChange={(e) => onVoucherChange(prev => ({ ...prev, party_gstin: e.target.value.toUpperCase() }))}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              className="border-gray-200"
            />
          </div>
        )}
      </div>
    </Card>
  );
};