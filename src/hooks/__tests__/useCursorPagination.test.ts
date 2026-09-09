import { act, renderHook } from '@testing-library/react';

import { useCursorPagination } from 'src/hooks/useCursorPagination';

// A table passes `pageInfo.endCursor` of the page it currently shows, so a
// forward step away from page N carries the cursor that starts page N + 1.
const endCursorOf = (page: number) => `end-of-page-${page}`;

describe('useCursorPagination', () => {
    test('starts on the first page with no cursor', () => {
        const { result } = renderHook(() => useCursorPagination());

        expect(result.current.currentPage).toBe(0);
        expect(result.current.cursor).toBeUndefined();
    });

    test('takes the cursor of the page it leaves when it moves forward', () => {
        const { result } = renderHook(() => useCursorPagination());

        act(() => {
            result.current.onPageChange(null, 1, endCursorOf(0));
        });

        expect(result.current.currentPage).toBe(1);
        expect(result.current.cursor).toBe(endCursorOf(0));
    });

    test('clears the cursor on a return to the first page', () => {
        const { result } = renderHook(() => useCursorPagination());

        act(() => {
            result.current.onPageChange(null, 1, endCursorOf(0));
        });
        act(() => {
            result.current.onPageChange(null, 0, endCursorOf(1));
        });

        expect(result.current.currentPage).toBe(0);
        expect(result.current.cursor).toBeUndefined();
    });

    test('ignores a forward step that carries no cursor', () => {
        const { result } = renderHook(() => useCursorPagination());

        act(() => {
            result.current.onPageChange(null, 1, null);
        });

        expect(result.current.currentPage).toBe(0);
        expect(result.current.cursor).toBeUndefined();
    });

    // Forward navigation after a backwards step revisits pages that already
    // have recorded cursors. Each revisit must overwrite the entry for the
    // page it lands on, so the cursor stays aligned with the page number.
    test('keeps the cursor aligned with the page across a backtracking sequence', () => {
        const { result } = renderHook(() => useCursorPagination());

        const forward = () =>
            act(() => {
                const from = result.current.currentPage;

                result.current.onPageChange(null, from + 1, endCursorOf(from));
            });

        const backward = () =>
            act(() => {
                const from = result.current.currentPage;

                result.current.onPageChange(null, from - 1, endCursorOf(from));
            });

        // Pages 1 -> 2 -> 3.
        forward();
        forward();

        expect(result.current.currentPage).toBe(2);
        expect(result.current.cursor).toBe(endCursorOf(1));

        // Back to page 2.
        backward();

        expect(result.current.currentPage).toBe(1);
        expect(result.current.cursor).toBe(endCursorOf(0));

        // Forward again through pages 3 -> 4 -> 5.
        forward();
        forward();
        forward();

        expect(result.current.currentPage).toBe(4);
        expect(result.current.cursor).toBe(endCursorOf(3));

        // Back to page 4, which starts after the end of page 3.
        backward();

        expect(result.current.currentPage).toBe(3);
        expect(result.current.cursor).toBe(endCursorOf(2));
    });
});
