import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface MultiSelectOption {
  label: string;
  value: string;
  count?: number;
}

export interface SearchableMultiSelectProps {
  label: string;
  icon?: React.ReactNode;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  searchPlaceholder?: string;
  align?: 'left' | 'right';
  widthClass?: string;
  isFullWidth?: boolean;
  forceLightMode?: boolean;
  usePortal?: boolean;
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  icon,
  options,
  selectedValues,
  onChange,
  searchPlaceholder = 'Search...',
  align = 'left',
  widthClass = 'w-72',
  isFullWidth = false,
  forceLightMode = false,
  usePortal = true,
}) => {
  const { isThemeB } = useTheme();
  const useDarkTheme = isThemeB && !forceLightMode;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Position calculation for portal
  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const menuWidth = isFullWidth ? rect.width : 288;
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 360;

    let top = rect.bottom + 4;
    // If not enough space below, open upwards
    if (spaceBelow < 260 && rect.top > 260) {
      top = Math.max(8, rect.top - estimatedHeight - 4);
    }

    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - menuWidth - 8);
    }
    if (left < 8) left = 8;

    setDropdownCoords({
      top,
      left,
      width: menuWidth,
    });
  };

  // Close on outside click (checks both trigger and portal container)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter options by search term
  const filteredOptions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(term) || opt.value.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const hasSelections = selectedValues.length > 0;

  const handleToggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredValues = filteredOptions.map((o) => o.value);
    const combined = Array.from(new Set([...selectedValues, ...allFilteredValues]));
    onChange(combined);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const dropdownMenu = (
    <div
      ref={dropdownRef}
      className={`${
        usePortal ? 'fixed' : `absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5`
      } ${
        isFullWidth ? 'min-w-[280px]' : widthClass
      } bg-white border border-[#E0E0E0] shadow-2xl rounded-none z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col searchable-multiselect-dropdown`}
      style={
        usePortal
          ? {
              top: dropdownCoords ? `${dropdownCoords.top}px` : '100px',
              left: dropdownCoords ? `${dropdownCoords.left}px` : '100px',
              width: dropdownCoords ? `${dropdownCoords.width}px` : undefined,
              maxHeight: '400px',
            }
          : { maxHeight: '420px' }
      }
    >
      {/* Header & Search */}
      <div className="p-2.5 border-b border-gray-200 bg-gray-50/90 space-y-2">
        <div className="relative">
          <Search
            className={`w-3.5 h-3.5 absolute left-2.5 top-2 ${
              isThemeB ? 'text-[#1A1A1A]' : 'text-gray-400'
            }`}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#F8B800] focus:ring-1 focus:ring-[#F8B800]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Actions (Select All, Clear) */}
        <div className="flex items-center justify-between text-[11px] px-0.5 pt-0.5">
          <span className="text-gray-500 font-medium">
            {selectedValues.length} of {options.length} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold cursor-pointer"
            >
              Select All
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Option List - NO CROPPING, clean wrapping with whitespace-normal */}
      <div className="overflow-y-auto max-h-56 p-1 space-y-1">
        {filteredOptions.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-xs italic">
            No matching {label.toLowerCase()} found
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isChecked = selectedValues.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition-colors border ${
                  isChecked
                    ? 'bg-amber-50/80 border-amber-300 text-[#1A1A1A] font-semibold'
                    : 'bg-white border-transparent hover:bg-gray-100/90 text-[#1A1A1A]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleOption(opt.value)}
                  className="accent-[#f7b611] rounded cursor-pointer w-3.5 h-3.5 mt-0.5 shrink-0"
                />
                <span className="flex-1 text-xs text-[#1A1A1A] font-medium leading-snug break-words whitespace-normal text-left">
                  {opt.label}
                </span>
                {typeof opt.count === 'number' && (
                  <span className="text-[10px] font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 ml-1">
                    {opt.count}
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>

      {/* Footer with Done button */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-[11px] text-gray-600 font-medium">
          {filteredOptions.length} option{filteredOptions.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-3 py-1 bg-[#f7b611] hover:bg-[#e2a508] text-black font-bold rounded text-xs cursor-pointer shadow-2xs"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${isFullWidth ? 'w-full' : 'inline-block'} text-left searchable-multiselect`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (next) updateCoords();
            return next;
          });
        }}
        className={`flex items-center ${
          isFullWidth ? 'w-full justify-between' : 'gap-2'
        } px-3 py-2 border text-xs font-semibold rounded-none cursor-pointer transition-colors shadow-2xs whitespace-nowrap ${
          hasSelections
            ? useDarkTheme
              ? 'bg-[#262626] border-[#F8B800] text-white ring-1 ring-[#F8B800]/40'
              : 'bg-amber-50/90 border-[#F8B800] text-[#1A1A1A] ring-1 ring-[#F8B800]/40'
            : useDarkTheme
            ? 'bg-[#262626] border-[#383838] text-white hover:bg-[#333333]'
            : 'bg-white border-[#D1D5DB] text-[#1A1A1A] hover:bg-gray-50 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{label}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
          {hasSelections ? (
            <span className="px-1.5 py-0.2 rounded-full bg-[#f7b611] text-black font-bold text-[10px] min-w-[18px] text-center shadow-xs">
              {selectedValues.length}
            </span>
          ) : null}

          {hasSelections && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              className={`p-0.5 rounded cursor-pointer transition-colors ${
                isThemeB ? 'text-[#1A1A1A] hover:text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <X className="w-3 h-3" />
            </span>
          )}

          {isOpen ? (
            <ChevronUp
              data-dropdown-icon="true"
              className="dropdown-chevron w-3.5 h-3.5 shrink-0 ml-0.5 text-[#1A1A1A]"
              style={{ color: '#1A1A1A', stroke: '#1A1A1A' }}
            />
          ) : (
            <ChevronDown
              data-dropdown-icon="true"
              className="dropdown-chevron w-3.5 h-3.5 shrink-0 ml-0.5 text-[#1A1A1A]"
              style={{ color: '#1A1A1A', stroke: '#1A1A1A' }}
            />
          )}
        </div>
      </button>

      {/* Render Dropdown Menu (Via Portal or Inline) */}
      {isOpen && (
        usePortal && typeof document !== 'undefined'
          ? createPortal(dropdownMenu, document.body)
          : dropdownMenu
      )}
    </div>
  );
};
