import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
  position: 'top' | 'bottom' | 'right' | 'left';
}

export const GlobalTooltip: React.FC = () => {
  const { isThemeB } = useTheme();
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    position: 'top',
  });

  useEffect(() => {
    let currentTarget: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('[title], [data-tooltip]') as HTMLElement | null;
      if (!target) return;

      currentTarget = target;

      // Extract title and store into data-tooltip to suppress native browser tooltip
      let text = target.getAttribute('data-tooltip') || '';
      const nativeTitle = target.getAttribute('title');
      if (nativeTitle) {
        text = nativeTitle;
        target.setAttribute('data-tooltip', nativeTitle);
        target.removeAttribute('title');
      }

      if (!text || text.trim() === '') {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Check if inside original PDF document viewer in order detail screen
      if (
        target.closest('.original-pdf-viewer') ||
        target.closest('[data-pdf-view]') ||
        target.closest('#original-pdf-container') ||
        target.closest('.pdf-doc-table')
      ) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        return;
      }

      // Check if inside side menu (aside)
      const aside = target.closest('aside');
      if (aside) {
        // When the menu is expanded, no need to show tooltip
        const isExpanded = aside.getBoundingClientRect().width > 80;
        if (isExpanded) {
          setTooltip((prev) => ({ ...prev, visible: false }));
          return;
        }
      }

      const rect = target.getBoundingClientRect();
      const approxWidth = Math.max(80, text.length * 7.5 + 32);
      const approxHeight = 32;

      let position: 'top' | 'bottom' | 'right' | 'left' = 'top';
      let tooltipX = rect.left + rect.width / 2;
      let tooltipY = rect.top - 8;

      if (aside) {
        // All tooltips for the side menu should open on right side of side menu
        position = 'right';
        tooltipX = rect.right + 10;
        tooltipY = rect.top + rect.height / 2;

        // If going out of visible screen on right side, show on alternate side (left)
        if (tooltipX + approxWidth > window.innerWidth - 8) {
          position = 'left';
          tooltipX = Math.max(8, rect.left - 10);
        }
      } else {
        const spaceAbove = rect.top;
        const spaceBelow = window.innerHeight - rect.bottom;

        // If going out of visible screen or getting cropped above, show on alternate side (bottom)
        if (spaceAbove < approxHeight + 12 && spaceBelow >= approxHeight) {
          position = 'bottom';
          tooltipY = rect.bottom + 8;
        } else if (spaceAbove >= approxHeight + 12) {
          position = 'top';
          tooltipY = rect.top - 8;
        } else {
          // If vertical space is very tight, check left/right alternate sides
          if (window.innerWidth - rect.right > approxWidth + 12) {
            position = 'right';
            tooltipX = rect.right + 10;
            tooltipY = rect.top + rect.height / 2;
          } else if (rect.left > approxWidth + 12) {
            position = 'left';
            tooltipX = rect.left - 10;
            tooltipY = rect.top + rect.height / 2;
          } else {
            position = spaceBelow > spaceAbove ? 'bottom' : 'top';
            tooltipY = position === 'top' ? rect.top - 8 : rect.bottom + 8;
          }
        }

        // Horizontal boundary protection for top/bottom tooltips
        if (position === 'top' || position === 'bottom') {
          const halfWidth = approxWidth / 2;
          if (tooltipX - halfWidth < 12) {
            tooltipX = halfWidth + 12;
          } else if (tooltipX + halfWidth > window.innerWidth - 12) {
            tooltipX = window.innerWidth - halfWidth - 12;
          }
        }
      }

      setTooltip({
        visible: true,
        text,
        x: tooltipX,
        y: tooltipY,
        position,
      });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (currentTarget && (!related || !currentTarget.contains(related))) {
        setTooltip((prev) => ({ ...prev, visible: false }));
        currentTarget = null;
      }
    };

    const handleScrollOrClick = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
      currentTarget = null;
    };

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    window.addEventListener('scroll', handleScrollOrClick, true);
    window.addEventListener('click', handleScrollOrClick, true);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      window.removeEventListener('scroll', handleScrollOrClick, true);
      window.removeEventListener('click', handleScrollOrClick, true);
    };
  }, []);

  if (!tooltip.visible || !tooltip.text) return null;

  const getTransform = () => {
    switch (tooltip.position) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'right':
        return 'translate(0, -50%)';
      case 'left':
        return 'translate(-100%, -50%)';
      default:
        return 'translate(-50%, -100%)';
    }
  };

  return (
    <div
      className="fixed z-9999 pointer-events-none transition-opacity duration-150 ease-out"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
        transform: getTransform(),
      }}
    >
      <div
        className={`relative text-[11px] font-medium px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap select-none flex items-center gap-1.5 ${
          isThemeB
            ? 'bg-[#161922] text-white border border-[#262A36]'
            : 'bg-white text-[#262626] border border-[#D1D5DB]'
        }`}
      >
        <span>{tooltip.text}</span>
      </div>
    </div>
  );
};
