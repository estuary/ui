import { act, renderHook } from '@testing-library/react';

import { usePageVisibility } from 'src/hooks/usePageVisibility';

// jsdom always reports the page as visible, so override `document.hidden`
// and fire the event the browser would send.
function setPageHidden(hidden: boolean, { notify = true } = {}) {
    Object.defineProperty(document, 'hidden', {
        configurable: true,
        get: () => hidden,
    });

    if (notify) {
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });
    }
}

describe('usePageVisibility', () => {
    afterEach(() => {
        // Drop the override so jsdom's own (visible) value applies again
        delete (document as { hidden?: boolean }).hidden;
    });

    test('starts visible when the page is visible', () => {
        const { result } = renderHook(() => usePageVisibility());

        expect(result.current).toBe(true);
    });

    test('starts hidden when the page is hidden at mount', () => {
        setPageHidden(true, { notify: false });

        const { result } = renderHook(() => usePageVisibility());

        expect(result.current).toBe(false);
    });

    test('follows the page as it is hidden and shown again', () => {
        const { result } = renderHook(() => usePageVisibility());

        setPageHidden(true);
        expect(result.current).toBe(false);

        setPageHidden(false);
        expect(result.current).toBe(true);
    });

    test('reads the current state rather than toggling on each event', () => {
        const { result } = renderHook(() => usePageVisibility());

        // Two events while still visible, e.g. a duplicate notification
        setPageHidden(false);
        setPageHidden(false);

        expect(result.current).toBe(true);
    });

    test('stops listening once unmounted', () => {
        const addListener = vi.spyOn(document, 'addEventListener');
        const removeListener = vi.spyOn(document, 'removeEventListener');

        const { unmount } = renderHook(() => usePageVisibility());

        const [, handler] =
            addListener.mock.calls.find(
                ([type]) => type === 'visibilitychange'
            ) ?? [];
        expect(handler).toBeDefined();

        unmount();

        expect(removeListener).toHaveBeenCalledWith(
            'visibilitychange',
            handler
        );
    });
});
