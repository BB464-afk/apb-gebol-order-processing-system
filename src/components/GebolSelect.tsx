import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface GebolSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export const GebolSelect: React.FC<GebolSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  required = false,
  disabled = false,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full font-['Open_Sans',sans-serif] ${className}`}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-normal text-[#4f4f4e] mb-1.5 field-header"
        >
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {/* Select Box Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full bg-white rounded-lg px-3.5 py-2.5 flex items-center justify-between text-left text-sm cursor-pointer transition-all duration-150 outline-none ${
          disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''
        } ${
          isOpen
            ? 'border-2 border-[#F8B800] ring-0 shadow-xs'
            : 'border border-[#E0E0E0] hover:border-gray-400'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`truncate font-normal ${
            selectedOption ? 'text-[#262626]' : 'text-gray-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#262626] shrink-0 ml-2 stroke-[2.2]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0 ml-2 stroke-[2.2]" />
        )}
      </button>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
        >
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-gray-500 italic">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.value)}
                  className={`relative px-4 py-2.5 text-sm cursor-pointer transition-colors select-none flex items-center ${
                    isSelected
                      ? 'bg-[#FFF9E6] text-[#262626] font-medium'
                      : 'text-[#262626] hover:bg-[#F8B800]/10 font-normal'
                  }`}
                >
                  {/* Left accent bar for selected item */}
                  {isSelected && (
                    <span className="absolute left-0 top-1 bottom-1 w-1 bg-[#F8B800] rounded-r" />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
