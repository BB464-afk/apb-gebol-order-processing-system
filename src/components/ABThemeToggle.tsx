import React, { useRef, useLayoutEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export const ABThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme, isThemeB } = useTheme();
  const btnARef = useRef<HTMLButtonElement>(null);
  const btnBRef = useRef<HTMLButtonElement>(null);
  const spanARef = useRef<HTMLSpanElement>(null);
  const spanBRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (isThemeB) {
      [btnARef.current, btnBRef.current, spanARef.current, spanBRef.current].forEach((el) => {
        if (el) {
          el.style.setProperty('color', '#000000', 'important');
          el.style.setProperty('-webkit-text-fill-color', '#000000', 'important');
        }
      });
    } else {
      [btnARef.current, btnBRef.current, spanARef.current, spanBRef.current].forEach((el) => {
        if (el) {
          el.style.removeProperty('color');
          el.style.removeProperty('-webkit-text-fill-color');
        }
      });
    }
  }, [isThemeB, theme]);

  return (
    <div
      className={`ab-theme-toggle inline-flex items-center p-0.5 rounded-lg border shadow-xs transition-colors ${
        isThemeB
          ? 'bg-white border-[#E0E0E0] shadow-xs'
          : 'bg-white/95 border-gray-200/90 shadow-gray-200/50'
      } ${className}`}
      style={{
        fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif",
        backgroundColor: isThemeB ? '#ffffff' : undefined,
        borderColor: isThemeB ? '#E0E0E0' : undefined,
      }}
      role="group"
      aria-label="Theme Toggle"
    >
      <button
        ref={btnARef}
        type="button"
        onClick={() => setTheme('A')}
        title="Theme A"
        data-active={theme === 'A'}
        style={{
          fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif",
          color: isThemeB ? '#000000' : '#262626',
        }}
        className={`theme-toggle-btn w-7 h-7 flex items-center justify-center text-xs font-bold rounded-md transition-all cursor-pointer ${
          theme === 'A'
            ? isThemeB
              ? 'bg-[#F8B800] text-black shadow-xs border border-[#F8B800]'
              : 'bg-[#f7b611] text-[#262626] shadow-xs'
            : isThemeB
            ? 'text-black hover:text-black hover:bg-gray-100'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <span
          ref={spanARef}
          style={{
            fontFamily: "'Open Sans', system-ui, sans-serif",
            color: isThemeB ? '#000000' : '#262626',
          }}
          className={`ab-theme-letter theme-toggle-span font-bold ${isThemeB ? 'text-black' : 'text-[#262626]'}`}
        >
          A
        </span>
      </button>

      <button
        ref={btnBRef}
        type="button"
        onClick={() => setTheme('B')}
        title="Theme B"
        data-active={theme === 'B'}
        style={{
          fontFamily: "'Open Sans', system-ui, -apple-system, sans-serif",
          color: isThemeB ? '#000000' : '#262626',
        }}
        className={`theme-toggle-btn w-7 h-7 flex items-center justify-center text-xs font-bold rounded-md transition-all cursor-pointer ${
          theme === 'B'
            ? isThemeB
              ? 'bg-[#F8B800] text-black shadow-xs border border-[#F8B800]'
              : 'bg-[#F8B800] text-[#262626] shadow-xs border border-[#F8B800]'
            : isThemeB
            ? 'text-black hover:text-black hover:bg-gray-100'
            : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
        }`}
      >
        <span
          ref={spanBRef}
          style={{
            fontFamily: "'Open Sans', system-ui, sans-serif",
            color: isThemeB ? '#000000' : '#262626',
          }}
          className={`ab-theme-letter theme-toggle-span font-bold ${isThemeB ? 'text-black' : 'text-[#262626]'}`}
        >
          B
        </span>
      </button>
    </div>
  );
};
