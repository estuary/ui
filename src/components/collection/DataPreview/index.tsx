/* eslint-disable complexity */
import type { LiveSpecsQuery_details } from 'src/hooks/useLiveSpecs';

import { useMemo } from 'react';

import { DataPreviewHeader } from 'src/components/collection/DataPreview/Header';
import HydrationError from 'src/components/collection/DataPreview/HydrationError';
import ListView from 'src/components/collection/DataPreview/ListView';
import ListViewSkeleton from 'src/components/collection/DataPreview/ListViewSkeleton';
import NoCollectionJournalsAlert from 'src/components/collection/DataPreview/NoCollectionJournalsAlert';
import { useEditorStore_specs } from 'src/components/editor/Store/hooks';
import JournalAlerts from 'src/components/journals/Alerts';
import AlertBox from 'src/components/shared/AlertBox';
import CardWrapper from 'src/components/shared/CardWrapper';
import useIsCollectionDerivation from 'src/hooks/details/useIsCollectionDerivation';
import {
    useJournalData,
    useJournalsForCollection,
} from 'src/hooks/journals/useJournalData';
import { useTenantHidesDataPreview } from 'src/hooks/useTenants';
import { BASE_ERROR } from 'src/services/supabase';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    collectionName: string;
}

// TODO (preview table) `TableView` is turned off until it has a fix for its
//      issues, mainly that it should use projections to fetch data.

export function DataPreview({ collectionName }: Props) {
    const isDerivation = useIsCollectionDerivation();

    const { error: tenantHidesError, hide } =
        useTenantHidesDataPreview(collectionName);

    const editorSpecs = useEditorStore_specs<LiveSpecsQuery_details>({
        localScope: true,
    });

    const spec = useMemo(
        () => (editorSpecs && hasLength(editorSpecs) ? editorSpecs[0] : null),
        [editorSpecs]
    );

    const journals = useJournalsForCollection(spec?.catalog_name);

    const {
        data: journalsData,
        isValidating: journalsLoading,
        error: journalsError,
    } = journals;

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journalsData?.journals[0], [journalsData]);
    const journalData = useJournalData(journal?.spec?.name, {
        desiredCount: 20,
    });

    const readError = journalData.error
        ? {
              ...BASE_ERROR,
              message: journalData.error.message,
          }
        : journalsError;

    // There is a brief delay between when the data preview card is rendered and the two journal-related
    // hooks are called, which resulted in `isLoading` being a false negative. If the journal client is
    // `null` or the collection name undefined, `journalsData` will be `null` and this component will be
    // stuck in a loading state. Ideally, this condition would specifically check whether `journalsData`
    // is undefined; however it is possible for the variable to quickly switch from undefined to `null`
    // then back to undefined while loading, resulting in a pseudo-inversion of the original problem.
    const isLoading = journalsLoading || !journalsData || journalData.loading;

    const hidden = Boolean(tenantHidesError || hide);
    const documents = journalData.data?.documents;
    const showList =
        !hidden && !readError && !isLoading && hasLength(documents) && spec;

    return (
        <CardWrapper
            message={
                <DataPreviewHeader
                    documents={showList ? documents : undefined}
                    keyPointers={spec?.spec.key}
                    onRefresh={() => journalData.refresh()}
                    refreshDisabled={Boolean(
                        isLoading || !hasLength(documents) || hide
                    )}
                    showNotice={Boolean(
                        !hidden && !readError && (isLoading || showList)
                    )}
                />
            }
        >
            <>
                {!hide ? (
                    <JournalAlerts
                        journalData={journalData}
                        journalsData={journalsData}
                        notFoundTitleMessage={
                            isDerivation ? (
                                'collectionsPreview.notFound.message.derivation'
                            ) : (
                                <NoCollectionJournalsAlert />
                            )
                        }
                    />
                ) : null}

                {hidden ? (
                    <AlertBox short severity="info">
                        Data previews are disabled for this tenant.
                    </AlertBox>
                ) : readError ? (
                    <HydrationError readError={readError} />
                ) : isLoading ? (
                    <ListViewSkeleton />
                ) : showList ? (
                    <ListView journalData={journalData} spec={spec} />
                ) : null}
            </>
        </CardWrapper>
    );
}
