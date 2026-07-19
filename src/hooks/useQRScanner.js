import { useEffect, useRef, useCallback } from 'react';

/**
 * useQRScanner
 *
 * A custom React hook that listens to global `keydown` events to capture
 * input from a USB HID QR/barcode scanner. These scanners behave exactly
 * like a keyboard — they type each character very rapidly and finish with
 * an `Enter` keypress.
 *
 * Strategy:
 * - We accumulate characters in a buffer (ref, not state, to avoid re-renders).
 * - A debounce timer resets the buffer if keystrokes are too slow (> 50ms apart),
 *   which distinguishes scanner input from manual keyboard typing.
 * - On `Enter`, we fire the callback with the accumulated QR data string.
 *
 * @param {(qrData: string) => void} onScan - Callback invoked with the decoded QR string.
 * @param {object}  [options]               - Optional configuration.
 * @param {number}  [options.debounceMs=50] - Max ms between scanner keystrokes.
 * @param {boolean} [options.enabled=true]  - Set to false to pause scanning.
 */
export function useQRScanner(onScan, { debounceMs = 50, enabled = true } = {}) {
  // The character buffer. A ref so we don't trigger re-renders on each keystroke.
  const bufferRef = useRef('');

  // The debounce timer handle.
  const timerRef = useRef(null);

  // Stable reference to the latest onScan callback.
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const clearBuffer = useCallback(() => {
    bufferRef.current = '';
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Reset the debounce timer on every keystroke
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (event.key === 'Enter') {
        // --- Scanner finished: process the buffered data ---
        const scannedData = bufferRef.current.trim();

        if (scannedData.length > 0) {
          onScanRef.current(scannedData);
        }

        clearBuffer();
        return; // Don't append 'Enter' to the buffer
      }

      // Ignore modifier-only keys (Shift, Ctrl, Alt, etc.)
      if (event.key.length > 1) {
        return;
      }

      // Append the character to the buffer
      bufferRef.current += event.key;

      // Start a debounce timer: if no new key arrives within `debounceMs`,
      // assume the input stalled (e.g., user typed manually) and clear the buffer.
      timerRef.current = setTimeout(() => {
        bufferRef.current = '';
        timerRef.current = null;
      }, debounceMs);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [enabled, debounceMs, clearBuffer]);
}
