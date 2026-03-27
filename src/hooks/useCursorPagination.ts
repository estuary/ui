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
                setCursor(cursorHistory[page]);
            }
            setCurrentPage(page);
        },
        [cursorHistory]
    );

    const onPageChange = useCallback(
        (_event: any, page: number, nextCursor: string | undefined | null) => {
            if (page > currentPage && nextCursor) {
                setCursor(nextCursor);
                setCursorHistory((prev) => [...prev, nextCursor]);
                setCurrentPage(page);
            } else if (page < currentPage) {
                goToPage(page);
            }
        },
        [currentPage, goToPage]
    );

    return { currentPage, cursor, goToPage, onPageChange };
}
