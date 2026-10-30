// Admin Dialog Accessibility Hook (T6.2.5 / AXE-E / WCAG 2.2 AA)
// Provides focus trapping, Escape-to-close, initial focus, aria-modal, and focus restoration.
import { useEffect, useRef } from 'react';

export function useDialogA11y<T extends HTMLElement = HTMLDivElement>({
  isOpen = true,
  onClose,
  initialFocusRef,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<T>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save element that had focus before the dialog opened
    triggerRef.current = document.activeElement as HTMLElement | null;

    const el = dialogRef.current;
    if (!el) return;

    // Focus the initial element or the first interactive element inside the dialog
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = el.querySelectorAll<HTMLElement>(focusableSelector);
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const items = el.querySelectorAll<HTMLElement>(focusableSelector);
        if (items.length === 0) {
          e.preventDefault();
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      // Restore focus to trigger element upon close
      if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
        try {
          triggerRef.current.focus();
        } catch {
          /* best effort */
        }
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

  return dialogRef;
}
