import type { UseHistoryDiffFindResponse } from 'src/hooks/searchParams/types';

import { useMemo } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import {
    usePublicationSpecsExt_DiffViewer,
    usePublicationSpecsExt_History,
} from 'src/hooks/usePublicationSpecsExt';

export function useHistoryDiff() {
    const [query, setQuery] = useQueryParams({
        [GlobalSearchParams.CATALOG_NAME]: StringParam,
        [GlobalSearchParams.DIFF_VIEW_ORIGINAL]: StringParam,
        [GlobalSearchParams.DIFF_VIEW_MODIFIED]: StringParam,
    });
    const queryData = useMemo(
        () => ({
            catalogName: query[GlobalSearchParams.CATALOG_NAME] ?? undefined,
            originalPubId: query[GlobalSearchParams.DIFF_VIEW_ORIGINAL] ?? null,
            modifiedPubId: query[GlobalSearchParams.DIFF_VIEW_MODIFIED] ?? null,
        }),
        [query]
    );

    const pubSpecs = usePublicationSpecsExt_DiffViewer(queryData.catalogName, [
        queryData.originalPubId,
        queryData.modifiedPubId,
    ]);

    const pubHistory = usePublicationSpecsExt_History(queryData.catalogName);

    return useMemo<UseHistoryDiffFindResponse>(
        () => ({
            ...queryData,
            pubSpecs,
            pubHistory,
            findModifiedPublication: (publication) =>
                publication.pub_id === queryData.modifiedPubId,
            findOriginalPublication: (publication) =>
                publication.pub_id === queryData.originalPubId,
            updateSelections: (settings) => {
                setQuery({
                    [GlobalSearchParams.DIFF_VIEW_MODIFIED]:
                        settings.modifiedPubId,
                    [GlobalSearchParams.DIFF_VIEW_ORIGINAL]:
                        settings.originalPubId,
                });
            },
        }),
        [pubHistory, pubSpecs, queryData, setQuery]
    );
}
