import { useMemo } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';

// Used so we don't have to use block notation so much
export function useHistoryDiff() {
    const [query, setQuery] = useQueryParams({
        [GlobalSearchParams.CATALOG_NAME]: StringParam,
        [GlobalSearchParams.DIFF_VIEW_ORIGINAL]: StringParam,
        [GlobalSearchParams.DIFF_VIEW_MODIFIED]: StringParam,
    });
    return useMemo(
        () => ({
            catalogName: query[GlobalSearchParams.CATALOG_NAME] ?? undefined,
            originalPubId: query[GlobalSearchParams.DIFF_VIEW_ORIGINAL] ?? null,
            modifiedPubId: query[GlobalSearchParams.DIFF_VIEW_MODIFIED] ?? null,
            setQuery,
        }),
        [query, setQuery]
    );
}
