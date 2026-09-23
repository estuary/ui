import { useCallback, useState } from 'react';

// This hook helps provide back pagination for queries that only support forward pagination.
// Queries that support both forward and back pagination don't need this hook.
export function useCursorPagination() {
    const [currentPage, setCurrentPage] = useState(0);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>(
        []
    );

    const goToPage = useCallback(
        (page: number) => {
            if (page === 0) {
                setCursor(undefined);
                setCursorHistory([]);
            } else {
                setCursor(cursorHistory[page - 1]);
            }
            setCurrentPage(page);
        },
        [cursorHistory]
    );

    const onPageChange = useCallback(
        (_event: any, page: number, nextCursor: string | undefined | null) => {
            if (page > currentPage && nextCursor) {
                setCursor(nextCursor);
                // `cursorHistory[i]` holds the cursor that starts page
                // `i + 1`. Record `nextCursor` at `page - 1` and drop every
                // entry past it, so the history always describes the path to
                // the page now on screen.
                setCursorHistory((prev) => [
                    ...prev.slice(0, page - 1),
                    nextCursor,
                ]);
                setCurrentPage(page);
            } else if (page < currentPage) {
                goToPage(page);
            }
        },
        [currentPage, goToPage]
    );

    return { currentPage, cursor, goToPage, onPageChange };
}
