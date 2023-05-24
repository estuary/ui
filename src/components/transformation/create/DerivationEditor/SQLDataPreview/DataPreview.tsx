import { AlertTitle, Box } from '@mui/material';
import ListView from 'components/collection/DataPreview/ListView';
import AlertBox from 'components/shared/AlertBox';
import { useJournalData, useJournalsForCollection } from 'hooks/useJournalData';
import { LiveSpecsQuery_spec, useLiveSpecs_spec } from 'hooks/useLiveSpecs';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useTransformationCreate_setPreviewActive } from 'stores/TransformationCreate/hooks';
import { hasLength } from 'utils/misc-utils';

interface Props {
    collectionName: string;
}

function DataPreview({ collectionName }: Props) {
    const setPreviewActive = useTransformationCreate_setPreviewActive();

    const { liveSpecs: publicationSpecs } = useLiveSpecs_spec(
        `data-preview-${collectionName}`,
        [collectionName]
    );
    const spec = useMemo(
        () => publicationSpecs[0] as LiveSpecsQuery_spec | undefined,
        [publicationSpecs]
    );

    const journals = useJournalsForCollection(spec?.catalog_name);
    const { data: journalsData, isValidating: journalsLoading } = journals;

    // TODO (typing) we need to fix typing
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const journal = useMemo(() => journalsData?.journals?.[0], [journalsData]);
    const journalData = useJournalData(journal?.name, 20, collectionName);
    const isLoading = journalsLoading || journalData.loading;

    useEffect(() => {
        if (!isLoading) {
            setPreviewActive(false);
        }
    }, [setPreviewActive, isLoading]);

    return (
        <>
            {journalsData && !hasLength(journalsData.journals) ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning" short>
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.notFound.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.notFound.message" />
                    </AlertBox>
                </Box>
            ) : journalData.data?.tooManyBytes &&
              journalData.data.documents.length === 0 ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning" short>
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.tooManyBytesAndNoDocuments.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooManyBytesAndNoDocuments.message" />
                    </AlertBox>
                </Box>
            ) : journalData.data?.tooFewDocuments ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning" short>
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.tooFewDocuments.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooFewDocuments.message" />
                    </AlertBox>
                </Box>
            ) : journalData.data?.tooManyBytes ? (
                <Box sx={{ mb: 3 }}>
                    <AlertBox severity="warning" short>
                        <AlertTitle>
                            <FormattedMessage id="collectionsPreview.tooManyBytes.title" />
                        </AlertTitle>
                        <FormattedMessage id="collectionsPreview.tooManyBytes.message" />
                    </AlertBox>
                </Box>
            ) : null}
            {(journalData.data?.documents.length ?? 0) > 0 && spec ? (
                <ListView journalData={journalData} spec={spec} />
            ) : null}
        </>
    );
}

export default DataPreview;
