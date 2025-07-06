import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { User, MapPin } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../contexts/AppContext';
import { SearchableDropdown } from './SearchableDropdown';

const voucherTypesWithParty = ['sales', 'purchase', 'receipt', 'payment', 'debit_note', 'credit_note'];

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
  const { selectedCompany } = useApp();
  const [ledgers, setLedgers] = useState<any[]>([]);

  useEffect(() => {
    if (selectedCompany) {
      fetchLedgers();
    }
  }, [selectedCompany]);

  const fetchLedgers = async () => {
    try {
      const { data, error } = await supabase
        .from('ledgers')
        .select(`
          id, name, current_balance,
          ledger_groups(name, group_type)
        `)
        .eq('company_id', selectedCompany?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setLedgers(data || []);
    } catch (error) {
      console.error('Error fetching ledgers:', error);
    }
  };

  if (!voucherTypesWithParty.includes(voucherType)) {
    return null;
  }

  const handlePartySelect = (ledger: any) => {
    onVoucherChange(prev => ({ 
      ...prev, 
      party_ledger_id: ledger.id,
      party_name: ledger.name 
    }));
  };

  const handleSalesLedgerSelect = (ledger: any) => {
    onVoucherChange(prev => ({ 
      ...prev, 
      sales_ledger_id: ledger.id
    }));
  };

  const getPartyLabel = () => {
    switch (voucherType) {
      case 'sales':
      case 'debit_note':
        return 'Customer';
      case 'purchase':
      case 'credit_note':
        return 'Vendor';
      case 'receipt':
        return 'Received From';
      case 'payment':
        return 'Paid To';
      default:
        return 'Party';
    }
  };

  const getSalesLedgerLabel = () => {
    switch (voucherType) {
      case 'sales':
        return 'Sales Ledger';
      case 'purchase':
        return 'Purchase Ledger';
      case 'debit_note':
      case 'credit_note':
        return 'Ledger Account';
      default:
        return 'Ledger Account';
    }
  };

  const getFilteredLedgersForSales = () => {
    return ledgers.filter(ledger => {
      const groupType = ledger.ledger_groups?.group_type;
      if (voucherType === 'sales') return groupType === 'income';
      if (voucherType === 'purchase') return groupType === 'expenses';
      return true; // For debit/credit notes, show all ledgers
    });
  };

  const renderLedgerItem = (ledger: any) => (
    <div>
      <div className="font-medium text-gray-900">{ledger.name}</div>
      <div className="text-sm text-gray-500">
        {ledger.ledger_groups?.name} • Balance: ₹{ledger.current_balance?.toFixed(2) || '0.00'}
      </div>
    </div>
  );

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
        <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
        Party Details
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Party Name (Ledger Selection) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            {getPartyLabel()} *
          </label>
          <SearchableDropdown
            items={ledgers}
            value={voucher.party_ledger_id || ''}
            onSelect={handlePartySelect}
            placeholder={`Search ${getPartyLabel().toLowerCase()}...`}
            displayField="name"
            searchFields={['name']}
            renderItem={renderLedgerItem}
          />
        </div>

        {/* Sales/Purchase Ledger */}
        {['sales', 'purchase', 'debit_note', 'credit_note'].includes(voucherType) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getSalesLedgerLabel()}
            </label>
            <SearchableDropdown
              items={getFilteredLedgersForSales()}
              value={voucher.sales_ledger_id || ''}
              onSelect={handleSalesLedgerSelect}
              placeholder={`Search ${getSalesLedgerLabel().toLowerCase()}...`}
              displayField="name"
              searchFields={['name']}
              renderItem={renderLedgerItem}
            />
          </div>
        )}

        {/* Place of Supply */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Place of Supply
          </label>
          <select
            value={voucher.place_of_supply || ''}
            onChange={(e) => onVoucherChange(prev => ({ ...prev, place_of_supply: e.target.value }))}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">Select State</option>
            <option value="01">01 - Jammu and Kashmir</option>
            <option value="02">02 - Himachal Pradesh</option>
            <option value="03">03 - Punjab</option>
            <option value="04">04 - Chandigarh</option>
            <option value="05">05 - Uttarakhand</option>
            <option value="06">06 - Haryana</option>
            <option value="07">07 - Delhi</option>
            <option value="08">08 - Rajasthan</option>
            <option value="09">09 - Uttar Pradesh</option>
            <option value="10">10 - Bihar</option>
            <option value="11">11 - Sikkim</option>
            <option value="12">12 - Arunachal Pradesh</option>
            <option value="13">13 - Nagaland</option>
            <option value="14">14 - Manipur</option>
            <option value="15">15 - Mizoram</option>
            <option value="16">16 - Tripura</option>
            <option value="17">17 - Meghalaya</option>
            <option value="18">18 - Assam</option>
            <option value="19">19 - West Bengal</option>
            <option value="20">20 - Jharkhand</option>
            <option value="21">21 - Odisha</option>
            <option value="22">22 - Chhattisgarh</option>
            <option value="23">23 - Madhya Pradesh</option>
            <option value="24">24 - Gujarat</option>
            <option value="25">25 - Daman and Diu</option>
            <option value="26">26 - Dadra and Nagar Haveli</option>
            <option value="27">27 - Maharashtra</option>
            <option value="28">28 - Andhra Pradesh</option>
            <option value="29">29 - Karnataka</option>
            <option value="30">30 - Goa</option>
            <option value="31">31 - Lakshadweep</option>
            <option value="32">32 - Kerala</option>
            <option value="33">33 - Tamil Nadu</option>
            <option value="34">34 - Puducherry</option>
            <option value="35">35 - Andaman and Nicobar Islands</option>
            <option value="36">36 - Telangana</option>
            <option value="37">37 - Andhra Pradesh (New)</option>
          </select>
        </div>
      </div>
    </Card>
  );
};