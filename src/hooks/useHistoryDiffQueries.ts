import type { UseHistoryDiffFindResponse } from 'src/hooks/searchParams/types';

import { useMemo } from 'react';

import { useUnmount } from 'react-use';

import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { useHistoryDiff } from 'src/hooks/searchParams/useHistoryDiff';
import {
    usePublicationSpecsExt_DiffViewer,
    usePublicationSpecsExt_History,
} from 'src/hooks/usePublicationSpecsExt';

// This hook originally came about when it helped map the query params to their
//  original/modified naming. After upating the query params I am still leaving this
//  around so that the queries, finds, and set are all kept in sync
export function useHistoryDiffQueries() {
    const { setQuery, ...diffQueryParams } = useHistoryDiff();

    const pubSpecs = usePublicationSpecsExt_DiffViewer(
        diffQueryParams.catalogName,
        [diffQueryParams.originalPubId, diffQueryParams.modifiedPubId]
    );

    const pubHistory = usePublicationSpecsExt_History(
        diffQueryParams.catalogName
    );

    useUnmount(() => {
        setQuery({
            [GlobalSearchParams.DIFF_VIEW_MODIFIED]: null,
            [GlobalSearchParams.DIFF_VIEW_ORIGINAL]: null,
        });
    });

    return useMemo<UseHistoryDiffFindResponse>(
        () => ({
            ...diffQueryParams,
            pubSpecs,
            pubHistory,
            findModifiedPublication: (publication) =>
                publication.pub_id === diffQueryParams.modifiedPubId,
            findOriginalPublication: (publication) =>
                publication.pub_id === diffQueryParams.originalPubId,
            updateSelections: (settings) => {
                setQuery({
                    [GlobalSearchParams.DIFF_VIEW_MODIFIED]:
                        settings.modifiedPubId,
                    [GlobalSearchParams.DIFF_VIEW_ORIGINAL]:
                        settings.originalPubId,
                });
            },
        }),
        [pubHistory, pubSpecs, diffQueryParams, setQuery]
    );
}
