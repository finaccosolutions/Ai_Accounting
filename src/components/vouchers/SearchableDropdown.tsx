import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchableDropdownProps {
  items: any[];
  value: string;
  onSelect: (item: any) => void;
  placeholder: string;
  displayField: string;
  searchFields: string[];
  renderItem?: (item: any) => React.ReactNode;
  className?: string;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  items,
  value,
  onSelect,
  placeholder,
  displayField,
  searchFields,
  renderItem,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = items.filter(item =>
        searchFields.some(field =>
          item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, items, searchFields]);

  useEffect(() => {
    const selectedItem = items.find(item => item.id === value);
    if (selectedItem) {
      setSearchTerm(selectedItem[displayField] || '');
    } else {
      setSearchTerm('');
    }
  }, [value, items, displayField]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    onSelect(item);
    setSearchTerm(item[displayField] || '');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                {renderItem ? renderItem(item) : (
                  <div className="font-medium text-gray-900">{item[displayField]}</div>
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No items found
            </div>
          )}
        </div>
      )}
    </div>
  );
};